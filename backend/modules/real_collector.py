"""
backend/modules/real_collector.py

Four real data sources for Windows 10:
  1. Windows Event Logs  — login attempts, failures, account lockouts
  2. Nginx / Apache logs — HTTP access logs (tail -f style)
  3. Windows Firewall logs — %SystemRoot%\System32\LogFiles\Firewall\pfirewall.log
  4. Live packet capture  — via Scapy + Npcap (optional, needs Npcap installed)
"""

import asyncio
import os
import re
import socket
from datetime import datetime
from typing import Optional

from backend.database import SessionLocal
from backend.modules.log_collector import process_log_line

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────

NGINX_LOG_PATH    = os.getenv("NGINX_LOG_PATH",   r"C:\nginx\logs\access.log")
APACHE_LOG_PATH   = os.getenv("APACHE_LOG_PATH",  r"C:\Apache24\logs\access.log")
FIREWALL_LOG_PATH = os.getenv(
    "FIREWALL_LOG_PATH",
    r"C:\Windows\System32\LogFiles\Firewall\pfirewall.log"
)
CAPTURE_IFACE = os.getenv("CAPTURE_IFACE", "")

WIN_EVENT_CHANNELS = ["Security", "System"]

# ─────────────────────────────────────────────────────────────────────────────
# 1. WINDOWS EVENT LOGS
# ─────────────────────────────────────────────────────────────────────────────

async def windows_event_log_collector():
    try:
        import win32evtlog
        import win32evtlogutil
        import win32con
        import pywintypes
    except ImportError:
        print("⚠ pywin32 not installed — Windows Event Log collector disabled")
        print("  Install with: pip install pywin32")
        return

    INTERESTING_IDS = {
        4625: "FAILED_LOGIN",
        4624: "SUCCESSFUL_LOGIN",
        4740: "ACCOUNT_LOCKOUT",
        4648: "EXPLICIT_CREDS",
        4719: "POLICY_CHANGE",
        4728: "GROUP_MEMBER_ADD",
        7045: "NEW_SERVICE",
    }

    print("✅ Windows Event Log collector started")
    server = "localhost"
    seen_record_ids = set()

    while True:
        db = SessionLocal()
        try:
            for channel in WIN_EVENT_CHANNELS:
                try:
                    hand  = win32evtlog.OpenEventLog(server, channel)
                    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
                    events = win32evtlog.ReadEventLog(hand, flags, 0)

                    for event in (events or []):
                        record_id = event.RecordNumber
                        if record_id in seen_record_ids:
                            continue
                        seen_record_ids.add(record_id)

                        event_id = event.EventID & 0xFFFF
                        if event_id not in INTERESTING_IDS:
                            continue

                        strings  = event.StringInserts or []
                        ip       = _extract_ip_from_strings(strings)
                        username = strings[5] if len(strings) > 5 else "unknown"
                        ts       = event.TimeGenerated.strftime("%b %d %H:%M:%S")
                        label    = INTERESTING_IDS[event_id]

                        if event_id == 4625:
                            line = (
                                f"{ts} DESKTOP sshd[0]: Failed password for {username} "
                                f"from {ip or '0.0.0.0'} port 0 ssh2 [EventID:4625]"
                            )
                        elif event_id == 4624:
                            line = (
                                f"{ts} DESKTOP sshd[0]: Accepted password for {username} "
                                f"from {ip or '0.0.0.0'} port 0 ssh2 [EventID:4624]"
                            )
                        elif event_id == 4740:
                            line = (
                                f"{ts} DESKTOP sshd[0]: Account locked out: {username} "
                                f"from {ip or '0.0.0.0'} [EventID:4740]"
                            )
                        else:
                            line = (
                                f"{ts} DESKTOP kernel: {label} user={username} "
                                f"ip={ip or '0.0.0.0'} [EventID:{event_id}]"
                            )

                        await process_log_line("auth", line, db)

                    win32evtlog.CloseEventLog(hand)
                except pywintypes.error as e:
                    print(f"Event log read error ({channel}): {e}")

        except Exception as e:
            print(f"Windows Event Log collector error: {e}")
        finally:
            db.close()

        await asyncio.sleep(5)


def _extract_ip_from_strings(strings):
    for s in strings:
        if not s:
            continue
        match = re.search(r'(\d{1,3}\.){3}\d{1,3}', str(s))
        if match:
            ip = match.group(0)
            if not ip.startswith(("127.", "0.", "::1")):
                return ip
    return None


# ─────────────────────────────────────────────────────────────────────────────
# 2. NGINX / APACHE ACCESS LOG TAIL
# ─────────────────────────────────────────────────────────────────────────────

async def nginx_log_collector():
    log_path = None
    log_type = None

    if NGINX_LOG_PATH and os.path.exists(NGINX_LOG_PATH):
        log_path = NGINX_LOG_PATH
        log_type = "nginx"
    elif APACHE_LOG_PATH and os.path.exists(APACHE_LOG_PATH):
        log_path = APACHE_LOG_PATH
        log_type = "apache"
    else:
        print(f"⚠ No Nginx/Apache log found — set NGINX_LOG_PATH or APACHE_LOG_PATH in .env")
        return

    print(f"✅ {log_type.upper()} log collector started → {log_path}")

    with open(log_path, "r", encoding="utf-8", errors="replace") as f:
        f.seek(0, 2)
        while True:
            line = f.readline()
            if line:
                line = line.strip()
                if line:
                    db = SessionLocal()
                    try:
                        await process_log_line(log_type, line, db)
                    except Exception as e:
                        print(f"{log_type} log processing error: {e}")
                    finally:
                        db.close()
            else:
                await asyncio.sleep(0.5)


# ─────────────────────────────────────────────────────────────────────────────
# 3. WINDOWS FIREWALL LOG
# ─────────────────────────────────────────────────────────────────────────────

def _parse_firewall_line(line: str) -> Optional[str]:
    """
    Parse Windows Firewall log line into an auth-style log line
    so process_log_line("firewall", ...) can extract source_ip reliably.

    Firewall log format:
    date time action protocol src-ip dst-ip src-port dst-port ...
    2024-01-15 10:23:45 DROP TCP 185.220.101.1 192.168.1.5 54321 22 ...
    """
    parts = line.split()
    if len(parts) < 8:
        return None
    try:
        date, time, action, proto, src_ip, dst_ip, src_port, dst_port = parts[:8]

        # Validate src_ip looks like a real IP
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', src_ip):
            return None

        ts = f"{date} {time}"

        # Format as auth-style line — process_log_line("firewall") regex
        # matches "from <ip>" to extract source_ip
        formatted = (
            f"{ts} FIREWALL kernel: {action} {proto} "
            f"from {src_ip} to {dst_ip}:{dst_port} "
            f"[firewall sport={src_port}]"
        )
        return formatted
    except Exception:
        return None


async def firewall_log_collector():
    if not os.path.exists(FIREWALL_LOG_PATH):
        print(f"⚠ Windows Firewall log not found at: {FIREWALL_LOG_PATH}")
        print("  Enable logging: Windows Defender Firewall → Advanced Settings → Properties → Logging")
        return

    print(f"✅ Windows Firewall log collector started → {FIREWALL_LOG_PATH}")

    with open(FIREWALL_LOG_PATH, "r", encoding="utf-8", errors="replace") as f:
        f.seek(0, 2)
        while True:
            line = f.readline()
            if line:
                line = line.strip()
                if line and not line.startswith("#"):
                    parsed_line = _parse_firewall_line(line)
                    if parsed_line:
                        db = SessionLocal()
                        try:
                            await process_log_line("firewall", parsed_line, db)
                        except Exception as e:
                            print(f"Firewall log processing error: {e}")
                        finally:
                            db.close()
            else:
                await asyncio.sleep(0.5)


# ─────────────────────────────────────────────────────────────────────────────
# 4. LIVE PACKET CAPTURE (Scapy + Npcap)
# ─────────────────────────────────────────────────────────────────────────────

async def packet_capture_collector():
    try:
        from scapy.all import sniff, IP, TCP, UDP, ICMP, conf
        conf.verb = 0
    except ImportError:
        print("⚠ Scapy not installed — packet capture collector disabled")
        print("  pip install scapy  +  install Npcap from https://npcap.com/#download")
        return

    if not CAPTURE_IFACE:
        print("⚠ CAPTURE_IFACE not set in .env — packet capture collector disabled")
        try:
            from scapy.all import get_if_list
            print(f"  Available interfaces: {get_if_list()}")
        except Exception:
            pass
        return

    print(f"✅ Packet capture collector started on interface: {CAPTURE_IFACE}")

    ip_packet_count = {}
    last_reset = datetime.now()

    def packet_handler(pkt):
        nonlocal last_reset, ip_packet_count

        if not pkt.haslayer(IP):
            return

        src_ip = pkt[IP].src
        dst_ip = pkt[IP].dst

        if src_ip.startswith("127.") or src_ip == "::1":
            return

        now = datetime.now()
        ts  = now.strftime("%d/%b/%Y:%H:%M:%S +0000")

        if (now - last_reset).seconds >= 10:
            ip_packet_count = {}
            last_reset = now

        ip_packet_count[src_ip] = ip_packet_count.get(src_ip, 0) + 1

        log_line = None
        log_type = "nginx"

        if pkt.haslayer(TCP):
            tcp      = pkt[TCP]
            dst_port = tcp.dport
            flags    = tcp.flags

            if flags == 0x002:
                if dst_port in [22, 23, 3389, 445, 3306, 5432, 6379]:
                    log_line = (
                        f'{src_ip} - - [{ts}] "CONNECT /{dst_port} HTTP/1.1" '
                        f'403 0 "-" "scanner/1.0 [SYN-SCAN port={dst_port}]"'
                    )
            elif dst_port == 22 and flags in [0x002, 0x018]:
                log_line = (
                    f'{now.strftime("%b %d %H:%M:%S")} server sshd[0]: '
                    f'Failed password for root from {src_ip} port {tcp.sport} ssh2'
                )
                log_type = "auth"
            elif dst_port == 3389:
                log_line = (
                    f'{src_ip} - - [{ts}] "CONNECT /rdp HTTP/1.1" '
                    f'403 0 "-" "rdp-client [port=3389]"'
                )
            elif dst_port == 80:
                log_line = (
                    f'{src_ip} - - [{ts}] "GET / HTTP/1.1" '
                    f'200 512 "-" "Mozilla/5.0"'
                )

        elif pkt.haslayer(ICMP):
            if ip_packet_count.get(src_ip, 0) > 20:
                log_line = (
                    f'{src_ip} - - [{ts}] "GET / HTTP/1.1" '
                    f'200 0 "-" "icmp-flood/1.0"'
                )

        if ip_packet_count.get(src_ip, 0) > 50 and log_line is None:
            log_line = (
                f'{src_ip} - - [{ts}] "GET / HTTP/1.1" '
                f'200 512 "-" "flood-tool/1.0"'
            )

        if log_line:
            asyncio.get_event_loop().call_soon_threadsafe(
                lambda: asyncio.ensure_future(_process_packet_log(log_type, log_line))
            )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: sniff(
            iface=CAPTURE_IFACE,
            prn=packet_handler,
            store=False,
            filter="ip"
        )
    )


async def _process_packet_log(log_type: str, line: str):
    db = SessionLocal()
    try:
        await process_log_line(log_type, line, db)
    except Exception as e:
        print(f"Packet log processing error: {e}")
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY
# ─────────────────────────────────────────────────────────────────────────────

async def real_network_collector():
    print("🌐 Starting REAL network collectors...")
    await asyncio.gather(
        windows_event_log_collector(),
        nginx_log_collector(),
        firewall_log_collector(),
        packet_capture_collector(),
        return_exceptions=True
    )
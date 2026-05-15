import os
import subprocess
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.alert import Alert
from backend.models.response_action import ResponseAction

BLOCKED_IPS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "blocked_ips.txt")
_blocked_ips_cache = set()

# ── Whitelist — read from .env, always include loopback ──────────────────────
def _load_whitelist() -> set:
    raw = os.getenv("WHITELIST_IPS", "")
    whitelist = {ip.strip() for ip in raw.split(",") if ip.strip()}
    # Always protect loopback and common local addresses
    whitelist.update({
        "127.0.0.1", "::1", "localhost", "0.0.0.0",
        "::ffff:127.0.0.1",
        "192.168.1.1", "192.168.0.1",
    })
    return whitelist

WHITELIST_IPS = _load_whitelist()


def _load_blocked_ips():
    if os.path.exists(BLOCKED_IPS_FILE):
        with open(BLOCKED_IPS_FILE, "r") as f:
            for line in f:
                ip = line.strip().split("#")[0].strip()
                if ip:
                    _blocked_ips_cache.add(ip)

_load_blocked_ips()


def is_whitelisted(ip: str) -> bool:
    if not ip:
        return True
    # Exact match
    if ip in WHITELIST_IPS:
        return True
    # Prefix match for private subnets (e.g. 192.168.x.x, 10.x.x.x)
    private_prefixes = ("192.168.", "10.", "172.16.", "172.17.", "172.18.",
                        "172.19.", "172.2", "172.3")
    if ip.startswith(private_prefixes):
        return True
    return False


def block_ip(ip: str) -> tuple:
    if not ip:
        return False, "No IP provided"

    if is_whitelisted(ip):
        return False, f"IP {ip} is whitelisted — block skipped"

    if ip in _blocked_ips_cache:
        return True, "IP already blocked"

    success = False
    details = ""

    # Try iptables (Linux)
    try:
        subprocess.run(
            ["iptables", "-C", "INPUT", "-s", ip, "-j", "DROP"],
            check=True, capture_output=True
        )
        success = True
        details = "Already blocked via iptables"
    except Exception:
        try:
            subprocess.run(
                ["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"],
                check=True, capture_output=True, timeout=5
            )
            success = True
            details = "Blocked via iptables"
        except Exception:
            pass

    # Try Windows Firewall (netsh)
    if not success:
        try:
            rule_name = f"ANOMALYZE_BLOCK_{ip.replace('.', '_')}"
            subprocess.run(
                ["netsh", "advfirewall", "firewall", "add", "rule",
                 f"name={rule_name}", "dir=in", "action=block",
                 f"remoteip={ip}"],
                check=True, capture_output=True, timeout=5
            )
            success = True
            details = "Blocked via Windows Firewall (netsh)"
        except Exception:
            pass

    # Fallback — log to file
    if not success:
        try:
            os.makedirs(os.path.dirname(BLOCKED_IPS_FILE), exist_ok=True)
            with open(BLOCKED_IPS_FILE, "a") as f:
                f.write(f"{ip} # blocked at {datetime.now().isoformat()}\n")
            success = True
            details = "Logged to blocked_ips.txt (simulated block)"
        except Exception as e:
            details = f"All block methods failed: {e}"

    if success:
        _blocked_ips_cache.add(ip)

    return success, details


def unblock_ip(ip: str) -> tuple:
    if not ip:
        return False, "No IP provided"

    if ip not in _blocked_ips_cache:
        return True, "IP was not blocked"

    success = False
    details = ""

    # Try iptables
    try:
        subprocess.run(
            ["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"],
            check=True, capture_output=True, timeout=5
        )
        success = True
        details = "Unblocked via iptables"
    except Exception:
        pass

    # Try Windows netsh
    if not success:
        try:
            rule_name = f"ANOMALYZE_BLOCK_{ip.replace('.', '_')}"
            subprocess.run(
                ["netsh", "advfirewall", "firewall", "delete", "rule",
                 f"name={rule_name}"],
                check=True, capture_output=True, timeout=5
            )
            success = True
            details = "Unblocked via Windows Firewall (netsh)"
        except Exception:
            pass

    # Remove from blocked_ips.txt
    if os.path.exists(BLOCKED_IPS_FILE):
        try:
            with open(BLOCKED_IPS_FILE, "r") as f:
                lines = f.readlines()
            with open(BLOCKED_IPS_FILE, "w") as f:
                for line in lines:
                    if line.strip().split("#")[0].strip() != ip:
                        f.write(line)
            success = True
            details = details or "Removed from blocked_ips.txt"
        except Exception as e:
            details = f"File cleanup failed: {e}"

    if success:
        _blocked_ips_cache.discard(ip)

    return success, details


def handle_alert(alert: Alert, db: Session, target_ip: str = None):
    severity = (alert.severity or "").upper()

    # Never act on whitelisted IPs
    if target_ip and is_whitelisted(target_ip):
        print(f"⚪ Skipping response for whitelisted IP: {target_ip}")
        try:
            action = ResponseAction(
                alert_id=alert.id,
                action_type="WHITELISTED",
                target_ip=target_ip,
                status="SKIPPED",
                details=f"IP {target_ip} is whitelisted — no action taken"
            )
            db.add(action)
            db.commit()
        except Exception as e:
            print(f"Response action save error: {e}")
        return

    if severity in ["HIGH", "CRITICAL"] and target_ip:
        success, details = block_ip(target_ip)
        action_type = "BLOCK_IP"
    elif severity == "MEDIUM":
        success = True
        details = "IP flagged for monitoring"
        action_type = "MONITOR_IP"
    else:
        success = True
        details = "Alert logged"
        action_type = "LOG_ONLY"

    try:
        action = ResponseAction(
            alert_id=alert.id,
            action_type=action_type,
            target_ip=target_ip,
            status="SUCCESS" if success else "FAILED",
            details=details
        )
        db.add(action)
        db.commit()
    except Exception as e:
        print(f"Response action save error: {e}")
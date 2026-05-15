import re
from collections import defaultdict
from datetime import datetime, timedelta

# ── In-memory tracking ────────────────────────────────────────────────────────
_failed_attempts  = defaultdict(list)
_port_attempts    = defaultdict(set)
_request_counts   = defaultdict(list)
_drop_counts      = defaultdict(list)   # firewall DROP rate per IP
_port_scan_track  = defaultdict(set)    # unique dest ports per IP

SQLI_PATTERN = re.compile(
    r'(?i)(union\s+select|select.*from|insert\s+into|drop\s+table|'
    r'cat\s+/etc/passwd|/bin/sh|/bin/bash|exec\(|system\()'
)
XSS_PATTERN = re.compile(
    r'(?i)(<script>|javascript:|onerror=|onload=|alert\(|document\.cookie)'
)
PATH_TRAVERSAL = re.compile(r'(\.\./|\.\.\\|%2e%2e)')
SCANNER_PATTERN = re.compile(
    r'(?i)(nikto|sqlmap|nmap|masscan|zgrab|nuclei|dirbuster|gobuster)'
)

# Ports that are always suspicious when hit from outside
SENSITIVE_PORTS = {
    22,    # SSH
    23,    # Telnet
    3389,  # RDP
    445,   # SMB
    3306,  # MySQL
    5432,  # PostgreSQL
    6379,  # Redis
    27017, # MongoDB
    4444,  # Metasploit default
    5900,  # VNC
    8080,  # Alt HTTP
}


def evaluate_rules(parsed_data: dict, raw_data: str, source_ip: str = None) -> list:
    matched_rules = []
    if not raw_data:
        return matched_rules

    now    = datetime.now()
    window = now - timedelta(minutes=5)

    is_firewall = (
        parsed_data.get("user_agent") == "firewall" or
        parsed_data.get("method") == "FIREWALL" or
        "FIREWALL" in raw_data
    )

    # ── Firewall-specific rules ───────────────────────────────────────────────

    if is_firewall and source_ip:
        action    = str(parsed_data.get("action", "")).upper()
        protocol  = str(parsed_data.get("protocol", "")).upper()
        dest_port = parsed_data.get("dest_port") or parsed_data.get("dst_port", "")
        try:
            dest_port_int = int(dest_port)
        except (ValueError, TypeError):
            dest_port_int = 0

        # Rule F1: Repeated DROP — same IP blocked 10+ times in 5 min
        if action == "DROP":
            _drop_counts[source_ip] = [
                t for t in _drop_counts[source_ip] if t > window
            ]
            _drop_counts[source_ip].append(now)
            if len(_drop_counts[source_ip]) >= 10:
                matched_rules.append(("FIREWALL_REPEATED_DROP", "HIGH"))

        # Rule F2: Probe on sensitive port
        if dest_port_int in SENSITIVE_PORTS:
            matched_rules.append(("FIREWALL_SENSITIVE_PORT_PROBE", "HIGH"))

        # Rule F3: RDP brute force attempt
        if dest_port_int == 3389:
            matched_rules.append(("RDP_CONNECTION_ATTEMPT", "HIGH"))

        # Rule F4: SSH probe via firewall
        if dest_port_int == 22:
            matched_rules.append(("SSH_PORT_PROBE", "MEDIUM"))

        # Rule F5: Telnet attempt (never legitimate in modern networks)
        if dest_port_int == 23:
            matched_rules.append(("TELNET_ATTEMPT", "HIGH"))

        # Rule F6: SMB probe (ransomware / lateral movement)
        if dest_port_int == 445:
            matched_rules.append(("SMB_PROBE_DETECTED", "HIGH"))

        # Rule F7: Port scan — same IP hitting 5+ unique ports in 5 min
        if dest_port_int > 0:
            _port_scan_track[source_ip].add(dest_port_int)
            # Prune old entries every 5 min (simple: clear if > 100 ports stored)
            if len(_port_scan_track[source_ip]) >= 5:
                matched_rules.append(("PORT_SCAN_DETECTED", "HIGH"))
                _port_scan_track[source_ip].clear()  # reset after alert

        # Rule F8: UDP flood
        if protocol == "UDP":
            _request_counts[f"udp_{source_ip}"] = [
                t for t in _request_counts[f"udp_{source_ip}"] if t > window
            ]
            _request_counts[f"udp_{source_ip}"].append(now)
            if len(_request_counts[f"udp_{source_ip}"]) >= 30:
                matched_rules.append(("UDP_FLOOD_DETECTED", "HIGH"))

        # Rule F9: ICMP flood
        if protocol == "ICMP":
            _request_counts[f"icmp_{source_ip}"] = [
                t for t in _request_counts[f"icmp_{source_ip}"] if t > window
            ]
            _request_counts[f"icmp_{source_ip}"].append(now)
            if len(_request_counts[f"icmp_{source_ip}"]) >= 20:
                matched_rules.append(("ICMP_FLOOD_DETECTED", "MEDIUM"))

        return matched_rules  # skip generic rules for firewall logs

    # ── Generic rules (nginx / apache / auth) ─────────────────────────────────

    # Rule 1: SQL Injection / Command Execution
    if SQLI_PATTERN.search(raw_data):
        matched_rules.append(("SQL_INJECTION_OR_CMD_EXEC", "HIGH"))

    # Rule 2: XSS Attack
    if XSS_PATTERN.search(raw_data):
        matched_rules.append(("XSS_ATTACK", "MEDIUM"))

    # Rule 3: Path Traversal
    if PATH_TRAVERSAL.search(raw_data):
        matched_rules.append(("PATH_TRAVERSAL", "HIGH"))

    # Rule 4: Scanner / Recon Tool
    if SCANNER_PATTERN.search(raw_data):
        matched_rules.append(("SCANNER_DETECTED", "MEDIUM"))

    # Rule 5: Unauthorized Access
    status = str(parsed_data.get("status", ""))
    if status in ["401", "403"]:
        matched_rules.append(("UNAUTHORIZED_ACCESS_ATTEMPT", "MEDIUM"))

    # Rule 6: Brute Force (5+ failures in 5 min)
    if source_ip:
        msg        = raw_data.lower()
        is_failure = (
            "failed password"        in msg or
            "invalid user"           in msg or
            "authentication failure" in msg or
            status in ["401", "403"]
        )
        if is_failure:
            _failed_attempts[source_ip] = [
                t for t in _failed_attempts[source_ip] if t > window
            ]
            _failed_attempts[source_ip].append(now)
            if len(_failed_attempts[source_ip]) >= 5:
                matched_rules.append(("BRUTE_FORCE_DETECTED", "HIGH"))

    # Rule 7: DoS / High Request Rate (50+ in 1 min)
    if source_ip:
        one_min_ago = now - timedelta(minutes=1)
        _request_counts[source_ip] = [
            t for t in _request_counts[source_ip] if t > one_min_ago
        ]
        _request_counts[source_ip].append(now)
        if len(_request_counts[source_ip]) >= 50:
            matched_rules.append(("DOS_ATTACK_DETECTED", "HIGH"))

    # Rule 8: Suspicious User Agent
    user_agent = str(parsed_data.get("user_agent", raw_data)).lower()
    if any(s in user_agent for s in ["python-requests", "curl/", "wget/", "go-http"]):
        matched_rules.append(("SUSPICIOUS_USER_AGENT", "LOW"))

    # Rule 9: Admin Panel Access
    request = str(parsed_data.get("request", raw_data)).lower()
    if any(p in request for p in ["/admin", "/wp-admin", "/phpmyadmin", "/.env", "/config"]):
        matched_rules.append(("ADMIN_PANEL_ACCESS", "MEDIUM"))

    # Rule 10: Root Login Attempt
    if "root" in raw_data.lower() and (
        "failed" in raw_data.lower() or "invalid" in raw_data.lower()
    ):
        matched_rules.append(("ROOT_LOGIN_ATTEMPT", "HIGH"))

    return matched_rules
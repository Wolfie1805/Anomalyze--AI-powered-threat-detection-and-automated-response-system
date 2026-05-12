import re
from collections import defaultdict
from datetime import datetime, timedelta

# Track failed attempts per IP in memory
_failed_attempts = defaultdict(list)
_port_attempts = defaultdict(set)
_request_counts = defaultdict(list)

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

def evaluate_rules(parsed_data: dict, raw_data: str, source_ip: str = None) -> list:
    matched_rules = []
    if not raw_data:
        return matched_rules

    now = datetime.now()
    window = now - timedelta(minutes=5)

    # --- Rule 1: SQL Injection / Command Execution ---
    if SQLI_PATTERN.search(raw_data):
        matched_rules.append(("SQL_INJECTION_OR_CMD_EXEC", "HIGH"))

    # --- Rule 2: XSS Attack ---
    if XSS_PATTERN.search(raw_data):
        matched_rules.append(("XSS_ATTACK", "MEDIUM"))

    # --- Rule 3: Path Traversal ---
    if PATH_TRAVERSAL.search(raw_data):
        matched_rules.append(("PATH_TRAVERSAL", "HIGH"))

    # --- Rule 4: Scanner/Recon Tool Detected ---
    if SCANNER_PATTERN.search(raw_data):
        matched_rules.append(("SCANNER_DETECTED", "MEDIUM"))

    # --- Rule 5: Unauthorized Access Attempt ---
    status = str(parsed_data.get("status", ""))
    if status in ["401", "403"]:
        matched_rules.append(("UNAUTHORIZED_ACCESS_ATTEMPT", "MEDIUM"))

    # --- Rule 6: Brute Force Detection (IP-based, 5+ failures in 5 min) ---
    if source_ip:
        msg = raw_data.lower()
        is_failure = (
            "failed password" in msg or
            "invalid user" in msg or
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

    # --- Rule 7: DoS / High Request Rate (50+ requests in 1 min) ---
    if source_ip:
        one_min_ago = now - timedelta(minutes=1)
        _request_counts[source_ip] = [
            t for t in _request_counts[source_ip] if t > one_min_ago
        ]
        _request_counts[source_ip].append(now)
        if len(_request_counts[source_ip]) >= 50:
            matched_rules.append(("DOS_ATTACK_DETECTED", "HIGH"))

    # --- Rule 8: Suspicious User Agent ---
    user_agent = str(parsed_data.get("user_agent", raw_data)).lower()
    if any(s in user_agent for s in ["python-requests", "curl/", "wget/", "go-http"]):
        matched_rules.append(("SUSPICIOUS_USER_AGENT", "LOW"))

    # --- Rule 9: Admin Panel Access ---
    request = str(parsed_data.get("request", raw_data)).lower()
    if any(p in request for p in ["/admin", "/wp-admin", "/phpmyadmin", "/.env", "/config"]):
        matched_rules.append(("ADMIN_PANEL_ACCESS", "MEDIUM"))

    # --- Rule 10: Root Login Attempt ---
    if "root" in raw_data.lower() and (
        "failed" in raw_data.lower() or "invalid" in raw_data.lower()
    ):
        matched_rules.append(("ROOT_LOGIN_ATTEMPT", "HIGH"))

    return matched_rules
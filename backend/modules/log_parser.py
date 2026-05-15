import re
import json

# ── Patterns ──────────────────────────────────────────────────────────────────

NGINX_PATTERN = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - (?P<remote_user>.*) \[(?P<time>.*)\] '
    r'"(?P<method>[A-Z]+) (?P<request>.*) HTTP/.*" (?P<status>\d+) (?P<bytes>\d+) '
    r'"(?P<referrer>.*)" "(?P<user_agent>.*)"'
)
APACHE_PATTERN = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - (?P<remote_user>.*) \[(?P<time>.*)\] '
    r'"(?P<method>[A-Z]+) (?P<request>.*) HTTP/.*" (?P<status>\d+) (?P<bytes>\d+)'
)
AUTH_PATTERN = re.compile(
    r'(?P<time>\w{3}\s+\d+\s+\d+:\d+:\d+) (?P<hostname>\S+) (?P<process>[^:]+): (?P<message>.*)'
)

# Matches lines formatted by real_collector._parse_firewall_line:
# "2024-01-15 10:23:45 FIREWALL kernel: DROP TCP from 1.2.3.4 to 5.6.7.8:22 [firewall sport=54321]"
FIREWALL_PATTERN = re.compile(
    r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) '
    r'FIREWALL \S+: (?P<action>\w+) (?P<protocol>\w+) '
    r'from (?P<source_ip>\d+\.\d+\.\d+\.\d+) '
    r'to (?P<dest_ip>\d+\.\d+\.\d+\.\d+):(?P<dest_port>\d+)'
    r'(?:.*sport=(?P<src_port>\d+))?'
)

# ── Parsers ───────────────────────────────────────────────────────────────────

def parse_nginx(line: str) -> dict:
    match = NGINX_PATTERN.search(line)
    return match.groupdict() if match else {}

def parse_apache(line: str) -> dict:
    match = APACHE_PATTERN.search(line)
    return match.groupdict() if match else {}

def parse_auth(line: str) -> dict:
    match = AUTH_PATTERN.search(line)
    return match.groupdict() if match else {}

def parse_windows(line: str) -> dict:
    try:
        return json.loads(line)
    except json.JSONDecodeError:
        return {}

def parse_firewall(line: str) -> dict:
    match = FIREWALL_PATTERN.search(line)
    if match:
        d = match.groupdict()
        # Expose source_ip as "ip" too so rule_engine patterns
        # that check parsed_data["ip"] also work on firewall logs
        d["ip"] = d.get("source_ip")
        # Map action to an HTTP-style status so existing rules can fire:
        # DROP → 403, ALLOW → 200
        d["status"] = "403" if d.get("action") == "DROP" else "200"
        d["method"] = "FIREWALL"
        d["request"] = (
            f"{d.get('protocol','?')} "
            f"{d.get('source_ip','?')}:{d.get('src_port','?')} "
            f"→ {d.get('dest_ip','?')}:{d.get('dest_port','?')}"
        )
        d["user_agent"] = "firewall"
        d["message"] = (
            f"{d.get('action')} {d.get('protocol')} "
            f"from {d.get('source_ip')} to {d.get('dest_ip')}:{d.get('dest_port')}"
        )
        return d
    # Fallback — try to grab at least the source IP from raw line
    fallback = {}
    m = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
    if m:
        fallback["ip"] = m.group(1)
        fallback["source_ip"] = m.group(1)
    fallback["user_agent"] = "firewall"
    fallback["message"] = line
    fallback["status"] = "403"
    fallback["method"] = "FIREWALL"
    return fallback

# ── Router ────────────────────────────────────────────────────────────────────

def parse_log(log_type: str, line: str) -> dict:
    if log_type == "nginx":
        return parse_nginx(line)
    elif log_type == "apache":
        return parse_apache(line)
    elif log_type == "auth":
        return parse_auth(line)
    elif log_type == "windows":
        return parse_windows(line)
    elif log_type == "firewall":
        return parse_firewall(line)
    else:
        # Unknown type — best-effort: grab first IP, return raw as message
        fallback = {"message": line}
        m = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
        if m:
            fallback["ip"] = m.group(1)
            fallback["source_ip"] = m.group(1)
        return fallback
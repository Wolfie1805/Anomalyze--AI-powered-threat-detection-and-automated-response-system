import re
import json

# Common regex patterns
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

def parse_nginx(line: str) -> dict:
    match = NGINX_PATTERN.search(line)
    if match:
        return match.groupdict()
    return {}

def parse_apache(line: str) -> dict:
    match = APACHE_PATTERN.search(line)
    if match:
        return match.groupdict()
    return {}

def parse_auth(line: str) -> dict:
    match = AUTH_PATTERN.search(line)
    if match:
        return match.groupdict()
    return {}

def parse_windows(line: str) -> dict:
    try:
        return json.loads(line)
    except json.JSONDecodeError:
        return {}

def parse_log(log_type: str, line: str) -> dict:
    if log_type == "nginx":
        return parse_nginx(line)
    elif log_type == "apache":
        return parse_apache(line)
    elif log_type == "auth":
        return parse_auth(line)
    elif log_type == "windows":
        return parse_windows(line)
    else:
        return {}

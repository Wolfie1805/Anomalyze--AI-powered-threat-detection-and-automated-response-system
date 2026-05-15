import asyncio
import re
import random
from datetime import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.log_entry import LogEntry
from backend.modules.log_parser import parse_log
from backend.modules.alert_manager import process_log_for_alerts

# Realistic attacker IPs
ATTACKER_IPS = [
    "45.33.32.156", "185.220.101.1", "103.21.244.0",
    "198.51.100.0", "192.0.2.100", "203.0.113.50",
    "91.108.4.1", "194.165.16.11", "162.247.74.1",
    "176.10.99.200",
]
NORMAL_IPS = [
    f"192.168.1.{i}" for i in range(1, 20)
] + [f"10.0.0.{i}" for i in range(1, 10)]


async def process_log_line(log_type: str, line: str, db: Session):
    parsed = parse_log(log_type, line)

    source_ip = None
    if log_type in ["nginx", "apache"]:
        source_ip = parsed.get("ip")
    elif log_type == "auth":
        ip_match = re.search(r'\d+\.\d+\.\d+\.\d+', parsed.get("message", ""))
        if ip_match:
            source_ip = ip_match.group(0)
    elif log_type == "firewall":
        # Try parsed field first, then regex fallback on raw line
        source_ip = parsed.get("source_ip") or parsed.get("ip")
        if not source_ip:
            ip_match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
            if ip_match:
                source_ip = ip_match.group(1)
        if not source_ip:
            # Last resort — grab first non-local IP in the line
            for m in re.finditer(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', line):
                ip = m.group(1)
                if not ip.startswith(("127.", "0.", "192.168.", "10.")):
                    source_ip = ip
                    break

    log_entry = LogEntry(
        source_ip=source_ip,
        log_type=log_type,
        raw_data=line,
        parsed_data=parsed,
        severity="LOW"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    try:
        process_log_for_alerts(log_entry, db)
    except Exception as e:
        print(f"Alert processing error: {e}")

    return log_entry


def generate_synthetic_log(attack_type: str = None):
    """Generate realistic log lines including various attack types."""
    now = datetime.now().strftime("%d/%b/%Y:%H:%M:%S +0000")

    if attack_type == "sqli":
        ip = random.choice(ATTACKER_IPS)
        line = f'{ip} - - [{now}] "GET /search?q=1\' UNION SELECT username,password FROM users-- HTTP/1.1" 200 4521 "-" "sqlmap/1.7"'
        return "nginx", line

    elif attack_type == "xss":
        ip = random.choice(ATTACKER_IPS)
        line = f'{ip} - - [{now}] "POST /comment HTTP/1.1" 200 312 "-" "Mozilla/5.0" body=<script>alert(document.cookie)</script>'
        return "nginx", line

    elif attack_type == "brute_force":
        ip = random.choice(ATTACKER_IPS)
        user = random.choice(["root", "admin", "administrator", "ubuntu"])
        line = f"May  6 {datetime.now().strftime('%H:%M:%S')} server sshd[1234]: Failed password for {user} from {ip} port {random.randint(1024, 65535)} ssh2"
        return "auth", line

    elif attack_type == "path_traversal":
        ip = random.choice(ATTACKER_IPS)
        line = f'{ip} - - [{now}] "GET /../../../../etc/passwd HTTP/1.1" 200 1234 "-" "python-requests/2.28"'
        return "nginx", line

    elif attack_type == "scanner":
        ip = random.choice(ATTACKER_IPS)
        line = f'{ip} - - [{now}] "GET /admin HTTP/1.1" 404 162 "-" "Nikto/2.1.6"'
        return "nginx", line

    elif attack_type == "dos":
        ip = random.choice(ATTACKER_IPS[:3])
        line = f'{ip} - - [{now}] "GET / HTTP/1.1" 200 512 "-" "flood-tool/1.0"'
        return "nginx", line

    else:
        ip = random.choice(NORMAL_IPS)
        paths = ["/", "/index.html", "/about", "/products", "/api/health", "/static/app.js"]
        status = random.choice([200, 200, 200, 304, 301, 404])
        size = random.randint(200, 5000)
        line = f'{ip} - - [{now}] "GET {random.choice(paths)} HTTP/1.1" {status} {size} "-" "Mozilla/5.0"'
        return "nginx", line


async def dev_mode_log_generator():
    from backend.config import settings
    if not settings.DEV_MODE:
        return

    print("🚀 Dev mode log generator started — full ML pipeline active")

    attack_schedule = [
        (None, 0.6),
        ("brute_force", 0.15),
        ("sqli", 0.08),
        ("scanner", 0.07),
        ("path_traversal", 0.05),
        ("xss", 0.03),
        ("dos", 0.02),
    ]

    while True:
        db = SessionLocal()
        try:
            if random.random() < 0.01:
                print("⚡ Simulating DoS burst...")
                dos_ip = random.choice(ATTACKER_IPS[:3])
                for _ in range(55):
                    now = datetime.now().strftime("%d/%b/%Y:%H:%M:%S +0000")
                    line = f'{dos_ip} - - [{now}] "GET / HTTP/1.1" 200 512 "-" "flood/1.0"'
                    await process_log_line("nginx", line, db)
                    await asyncio.sleep(0.05)

            rand = random.random()
            cumulative = 0
            chosen_attack = None
            for attack_type, probability in attack_schedule:
                cumulative += probability
                if rand < cumulative:
                    chosen_attack = attack_type
                    break

            log_type, line = generate_synthetic_log(chosen_attack)
            await process_log_line(log_type, line, db)

        except Exception as e:
            print(f"Log generator error: {e}")
        finally:
            db.close()

        if chosen_attack:
            await asyncio.sleep(random.uniform(0.5, 2.0))
        else:
            await asyncio.sleep(random.uniform(2.0, 5.0))
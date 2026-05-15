# 🛡️ Anomalyze
### AI-Powered Cybersecurity Threat Detection & Automated Incident Response

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Anomalyze** is a full-stack Security Operations Center (SOC) platform that combines rule-based threat detection, machine learning anomaly scoring, real-time network monitoring, and automated incident response — all in a sleek, cyberpunk-themed dashboard.

</div>

---

## ✨ What Makes Anomalyze Different

Most security tools either alert you or act on threats. Anomalyze does both — simultaneously — using a dual-engine detection pipeline that combines deterministic rules with ML-powered anomaly scoring. Every log entry is analyzed in real time, threats are classified by severity, and automated responses are executed within milliseconds.

---

## 🚀 Key Features

### 🔍 Dual Detection Engine
- **Rule-Based Detection** — 15+ built-in rules covering SQL injection, XSS, path traversal, brute force, port scanning, DoS, RDP/SSH probes, SMB attacks, and more
- **ML Anomaly Detection** — Isolation Forest + Random Forest models score every log entry with a risk percentage; anomalies above threshold auto-generate alerts
- **Firewall-Aware Rules** — Dedicated rule set for Windows Firewall logs: repeated DROPs, sensitive port probes, UDP/ICMP floods, port scan detection

### 📡 Real-Time Monitoring
- **WebSocket Live Feed** — Every log entry and alert streams to the dashboard instantly via WebSocket
- **Live Engine Feed** — Tabbed view showing Alerts, Logs, and Events as they happen
- **System Stats Broadcasting** — Dashboard stats update every 10 seconds automatically

### 🌐 Dual Data Collection Modes
- **SYNTHETIC Mode** — Generates realistic attack traffic (SQLi, XSS, brute force, DoS bursts, scanners) for demo and testing; no real network access needed
- **REAL Mode** — Live collection from four Windows data sources simultaneously:
  - Windows Security & System Event Logs (login failures, lockouts, policy changes)
  - Nginx / Apache access log tailing
  - Windows Firewall log parsing (pfirewall.log)
  - Live packet capture via Scapy + Npcap (SYN scans, SSH brute force, RDP, ICMP flood)

### 🤖 Automated Incident Response
- **Auto IP Blocking** — HIGH/CRITICAL alerts trigger automatic IP blocking via Windows Firewall (netsh) or iptables
- **IP Whitelisting** — Protects your own IPs and private subnets from accidental blocking; reads from `.env`
- **False Positive Management** — Mark alerts as false positives to automatically unblock IPs
- **Manual IP Unblocking** — Admin can manually release any blocked IP from the UI

### 📊 Analytics Dashboard
- Open alerts, resolved alerts, and threat severity counts
- Real-time stat cards with animated counters
- Severity distribution and detection method breakdown
- Threat timeline and source IP geolocation

### 🔔 Smart Notifications
- **Email Alerts** — Sends alert summaries via Gmail SMTP
- **Rate Limited** — Max 1 email per rule type per 10 minutes; hard cap of 10 emails/hour to prevent spam
- **Slack Integration** — Optional webhook support for team notifications

### 👑 Role-Based Access
- **ADMIN** — Full access: clear all alerts, delete individual alerts, switch data modes, manage blocked IPs
- **ANALYST** — Can mark false positives and manually unblock IPs

### 💬 AI Chat Assistant
- Built-in AI chat powered by Groq (Llama 3.1) for security Q&A and incident guidance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│   Dashboard · Alerts · Logs · Live Feed · AI Chat       │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API + WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Log         │  │ Detection    │  │ Response      │  │
│  │ Collectors  │→ │ Pipeline     │→ │ Engine        │  │
│  │             │  │              │  │               │  │
│  │ • Synthetic │  │ • Rule Engine│  │ • Block IP    │  │
│  │ • Firewall  │  │ • ML Engine  │  │ • Whitelist   │  │
│  │ • Event Log │  │ • Preprocessor│  │ • Notify      │  │
│  │ • Nginx/Apache│ │ • Alert Mgr │  │ • Log Action  │  │
│  │ • Packet Cap│  └──────────────┘  └───────────────┘  │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ SQLite DB   │  │ WebSocket    │  │ Scheduler     │  │
│  │ (SQLAlchemy)│  │ Manager      │  │ (APScheduler) │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.8+, FastAPI, SQLAlchemy, Pydantic, JWT |
| **Database** | SQLite (default), configurable via `DATABASE_URL` |
| **ML** | scikit-learn (Isolation Forest + Random Forest) |
| **Real-time** | WebSockets, APScheduler |
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | Custom cyberpunk theme (JetBrains Mono, Orbitron) |
| **Charts** | Recharts, Chart.js |
| **Maps** | React Simple Maps |
| **Network** | Scapy, Npcap (Windows packet capture) |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## 📁 Repository Structure

```
anomalyze/
├── backend/
│   ├── main.py                    # App entrypoint, lifespan, collector startup
│   ├── config.py                  # Settings and .env handling
│   ├── database.py                # SQLAlchemy engine and session
│   ├── scheduler.py               # Background stat broadcasting
│   ├── routers/
│   │   ├── auth.py                # Login, register, JWT
│   │   ├── alerts.py              # Alert CRUD, false positive, unblock
│   │   ├── logs.py                # Log entry API
│   │   ├── dashboard.py           # Stats aggregation
│   │   ├── responses.py           # Response action history
│   │   ├── chat.py                # AI chat (Groq/Llama)
│   │   ├── contact.py             # Contact form
│   │   ├── websocket.py           # WebSocket manager and broadcaster
│   │   └── data_mode.py           # SYNTHETIC/REAL mode switching
│   ├── modules/
│   │   ├── log_collector.py       # Synthetic generator + process_log_line pipeline
│   │   ├── real_collector.py      # 4 real collectors (Event Log, Nginx, Firewall, Scapy)
│   │   ├── log_parser.py          # Parsers for nginx, apache, auth, firewall log formats
│   │   ├── rule_engine.py         # 15+ detection rules incl. firewall-specific rules
│   │   ├── ml_engine.py           # Isolation Forest anomaly detection
│   │   ├── alert_manager.py       # Alert creation, ML scoring, WebSocket broadcast
│   │   ├── preprocessor.py        # Feature extraction for ML
│   │   ├── response_engine.py     # IP blocking, whitelist enforcement, action logging
│   │   └── notifier.py            # Rate-limited email + Slack notifications
│   ├── models/                    # SQLAlchemy DB models
│   ├── schemas/                   # Pydantic request/response schemas
│   ├── utils/                     # Auth helpers, password hashing
│   └── data/
│       ├── blocked_ips.txt        # Persisted blocked IP list
│       └── data_mode.json         # Persisted SYNTHETIC/REAL mode
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Alerts.jsx         # Alerts page with filters and actions
│   │   │   ├── Dashboard.jsx      # Main dashboard with live feed
│   │   │   └── ...
│   │   └── components/
│   │       ├── AlertTable.jsx     # Alert table with false positive / unblock actions
│   │       ├── DataModeSwitch.jsx # Admin toggle for SYNTHETIC/REAL mode
│   │       └── ...
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── requirements.txt
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- (Optional) Npcap for packet capture on Windows

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourname/anomalyze.git
cd anomalyze

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1       # Windows
# source venv/bin/activate         # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create database schema
python -c "from backend.database import engine, Base; Base.metadata.create_all(bind=engine)"

# 5. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 6. Start backend (run as Administrator for real network capture)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser:
- **App:** `http://localhost:5173`
- **API Docs:** `http://localhost:8000/docs`

### Default Admin Credentials
```
Username: admin
Password: admin123
```
> Change these immediately in production.

---

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure:

```dotenv
# Core
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=480

# Data Collection
LOG_FILE_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log
NGINX_LOG_PATH=                          # Leave empty if not running nginx
APACHE_LOG_PATH=                         # Leave empty if not running apache
FIREWALL_LOG_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log

# Packet Capture — get interface name with:
# python -c "from scapy.all import get_if_list; print(get_if_list())"
CAPTURE_IFACE=\Device\NPF_{YOUR-GUID-HERE}

# IP Protection — comma-separated, supports exact match and private subnets
WHITELIST_IPS=127.0.0.1,::1,192.168.1.6,192.168.1.1

# Auto-blocking via Windows Firewall
ENABLE_REAL_FIREWALL=false               # Set true to enable actual IP blocking

# Email Notifications (rate limited: 10/hr, 1 per rule per 10 min)
ENABLE_EMAIL=false
EMAIL_SENDER=your@gmail.com
EMAIL_PASSWORD=your-app-password
ALERT_RECIPIENT_EMAIL=recipient@email.com

# Slack (optional)
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# AI Chat
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant

# Dev
DEV_MODE=True
FRONTEND_URL=http://localhost:5173
```

---

## 🌐 Real Network Mode

Switch from synthetic to real network data collection via the Admin toggle in the UI.

### What gets collected in REAL mode

| Source | Data | Detects |
|---|---|---|
| Windows Event Logs | Login events (4624, 4625, 4740) | Brute force, account lockouts |
| Nginx/Apache Logs | HTTP access logs | SQLi, XSS, scanners, path traversal |
| Windows Firewall Log | pfirewall.log entries | Port scans, DROP floods, RDP/SSH probes |
| Packet Capture | Live TCP/UDP/ICMP packets | SYN scans, DoS, ICMP floods |

### Real mode requirements

```bash
# Windows Event Logs
pip install pywin32

# Packet capture
pip install scapy
# + Install Npcap from https://npcap.com/#download
# ✅ Check "WinPcap API-compatible mode" during Npcap install

# Run backend as Administrator for firewall log + event log access
```

### Enable Windows Firewall logging (PowerShell Admin)

```powershell
Set-NetFirewallProfile -All -LogAllowed True -LogBlocked True `
  -LogFileName "%systemroot%\system32\LogFiles\Firewall\pfirewall.log"
```

---

## 🧪 Testing the Detection Pipeline

Run this script to simulate attack traffic and see the full detection pipeline in action:

```python
# test_traffic.py
import requests, time

TARGET = "http://localhost:8000"
tests = [
    "/api/v1/logs?q=1' UNION SELECT * FROM users--",   # SQLi
    "/api/v1/logs?q=<script>alert(1)</script>",         # XSS
    "/api/v1/../../../../etc/passwd",                    # Path traversal
    "/api/v1/admin",                                     # Admin probe
    "/api/v1/logs",                                      # Normal traffic
]

print("Sending test traffic...")
for i in range(60):
    for url in tests:
        try:
            requests.get(TARGET + url, timeout=2)
        except:
            pass
    time.sleep(0.5)
    print(f"Round {i+1}/60")
```

```bash
python test_traffic.py
```

Watch the **Live Feed** and **Alerts** page fill up in real time. Expected alerts:
- `SQL_INJECTION_OR_CMD_EXEC` — HIGH
- `XSS_ATTACK` — MEDIUM
- `PATH_TRAVERSAL` — HIGH
- `ADMIN_PANEL_ACCESS` — MEDIUM
- `BRUTE_FORCE_DETECTED` — HIGH (after 5+ failures)
- `DOS_ATTACK_DETECTED` — HIGH (after 50+ requests/min)
- `ML_ANOMALY_DETECTED` — CRITICAL/HIGH/MEDIUM (ML scored)

---

## 🐳 Docker Deployment

```bash
# Build and start all containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

| Service | URL |
|---|---|
| Frontend | `http://localhost` |
| Backend API | `http://localhost:8000` |
| API Docs | `http://localhost:8000/docs` |

---

## 🔐 Detection Rules Reference

| Rule | Trigger | Severity |
|---|---|---|
| `SQL_INJECTION_OR_CMD_EXEC` | UNION SELECT, DROP TABLE, /bin/sh etc. | HIGH |
| `XSS_ATTACK` | `<script>`, `onerror=`, `alert()` etc. | MEDIUM |
| `PATH_TRAVERSAL` | `../`, `%2e%2e` patterns | HIGH |
| `SCANNER_DETECTED` | Nikto, sqlmap, nmap, masscan user agents | MEDIUM |
| `UNAUTHORIZED_ACCESS_ATTEMPT` | HTTP 401/403 responses | MEDIUM |
| `BRUTE_FORCE_DETECTED` | 5+ failed logins from same IP in 5 min | HIGH |
| `DOS_ATTACK_DETECTED` | 50+ requests from same IP in 1 min | HIGH |
| `ROOT_LOGIN_ATTEMPT` | Failed root/admin login | HIGH |
| `ADMIN_PANEL_ACCESS` | Requests to /admin, /.env, /config | MEDIUM |
| `SUSPICIOUS_USER_AGENT` | python-requests, curl, wget, go-http | LOW |
| `FIREWALL_REPEATED_DROP` | 10+ DROPs from same IP in 5 min | HIGH |
| `FIREWALL_SENSITIVE_PORT_PROBE` | Hits on SSH/RDP/SMB/Redis/MongoDB | HIGH |
| `RDP_CONNECTION_ATTEMPT` | Port 3389 probe | HIGH |
| `SSH_PORT_PROBE` | Port 22 probe | MEDIUM |
| `TELNET_ATTEMPT` | Port 23 probe | HIGH |
| `SMB_PROBE_DETECTED` | Port 445 probe | HIGH |
| `PORT_SCAN_DETECTED` | 5+ unique ports from same IP in 5 min | HIGH |
| `UDP_FLOOD_DETECTED` | 30+ UDP packets from same IP in 5 min | HIGH |
| `ICMP_FLOOD_DETECTED` | 20+ ICMP packets from same IP in 5 min | MEDIUM |
| `ML_ANOMALY_DETECTED` | ML risk score > 40% | CRITICAL/HIGH/MEDIUM |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies and run locally
4. Add tests for new behavior
5. Open a pull request with a clear description

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for cybersecurity professionals and developers who want real-time threat visibility without enterprise pricing.
</div>

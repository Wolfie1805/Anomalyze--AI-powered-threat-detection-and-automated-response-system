# 🛡️ Anomalyze — Complete Setup Guide

This guide walks you through setting up Anomalyze from scratch on a new Windows machine, including every configuration value and how to generate or find it.

---

## 📋 Prerequisites

Install these before anything else:

| Tool | Version | Download |
|---|---|---|
| Python | 3.8+ | https://python.org/downloads |
| Node.js | 18+ | https://nodejs.org |
| Git | Latest | https://git-scm.com |
| Npcap | Latest | https://npcap.com/#download |

> ⚠️ When installing **Npcap**, check **"Install Npcap in WinPcap API-compatible mode"** — required for packet capture to work.

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/yourname/anomalyze.git
cd anomalyze
```

---

## 🐍 Step 2 — Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If you get a permissions error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📦 Step 3 — Install Dependencies

```bash
# Backend dependencies
pip install -r requirements.txt

# Optional — Windows Event Log support
pip install pywin32

# Optional — Packet capture (also requires Npcap)
pip install scapy
```

---

## 🗄️ Step 4 — Create the Database

```bash
python -c "from backend.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

This creates `anomalyze.db` (SQLite) in your project root with all tables.

---

## ⚙️ Step 5 — Configure the Environment File

Create your `.env` file:

```bash
copy backend\.env.example backend\.env
```

Now open `backend\.env` and fill in each value. Full instructions for every field are below.

---

## 🔑 Environment Variables — Full Reference

### `SECRET_KEY`
Used to sign JWT tokens. Must be a long random string. Generate one with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste it in:
```dotenv
SECRET_KEY=paste_output_here
```

---

### `ALGORITHM` and `TOKEN_EXPIRE_MINUTES`
Leave these as default:
```dotenv
ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=480
```

---

### `LOG_FILE_PATH` and `FIREWALL_LOG_PATH`
Path to your Windows Firewall log. This is the same on every Windows machine:
```dotenv
LOG_FILE_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log
FIREWALL_LOG_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log
```

Enable firewall logging first (run PowerShell as Administrator):
```powershell
Set-NetFirewallProfile -All -LogAllowed True -LogBlocked True -LogFileName "%systemroot%\system32\LogFiles\Firewall\pfirewall.log"
```

---

### `NGINX_LOG_PATH` and `APACHE_LOG_PATH`
Only fill these if you're running a web server locally. Leave empty otherwise:
```dotenv
NGINX_LOG_PATH=
APACHE_LOG_PATH=
```

If you have nginx:
```dotenv
NGINX_LOG_PATH=C:\nginx\logs\access.log
```

---

### `ENABLE_REAL_FIREWALL`
Controls whether Anomalyze actually blocks IPs via Windows Firewall.
- `false` — logs blocks to a file only (safe for development)
- `true` — actually runs `netsh advfirewall` to block IPs (needs admin)

```dotenv
ENABLE_REAL_FIREWALL=false
```

---

### `CAPTURE_IFACE`
The network interface for live packet capture. Find yours:

```bash
python -c "from scapy.all import get_if_list, get_if_hwaddr; [print(i, get_if_hwaddr(i)) for i in get_if_list()]"
```

Output looks like:
```
\Device\NPF_{0903144B-9263-47AB-9C34-105C8EF7FA9C}  00:00:00:00:00:00
\Device\NPF_{2898D45C-E9CA-4CFA-8C81-1C80A55F3CD6}  00:e0:4c:5c:10:dc   ← real adapter (non-zero MAC)
\Device\NPF_Loopback                                  00:00:00:00:00:00
```

Pick the one with a **real MAC address** (not all zeros). Then:
```dotenv
CAPTURE_IFACE=\Device\NPF_{2898D45C-E9CA-4CFA-8C81-1C80A55F3CD6}
```

> If you're on WiFi instead of Ethernet, pick the interface with your WiFi adapter's MAC.

---

### `WHITELIST_IPS`
IPs that will **never** be auto-blocked. Always include your own machine's IPs.

Find your IPs:
```bash
ipconfig
```

Look for:
```
IPv4 Address. . . : 192.168.1.X     ← your machine
Default Gateway . : 192.168.1.1     ← your router
IPv6 Address. . . : 2401:xxxx...    ← your IPv6 (optional)
Link-local IPv6 . : fe80::xxxx      ← local IPv6 (optional)
```

Then build your whitelist:
```dotenv
WHITELIST_IPS=127.0.0.1,::1,localhost,0.0.0.0,::ffff:127.0.0.1,192.168.1.X,192.168.1.1
```

Replace `192.168.1.X` with your actual IPv4 address. Add IPv6 addresses too if you want full coverage.

> ⚠️ If you skip this step and run in REAL mode, your own machine could get auto-blocked.

---

### `ENABLE_EMAIL`
Whether to send email notifications for alerts.
- Start with `false` while testing — the synthetic generator fires hundreds of alerts and will exhaust your Gmail daily limit instantly
- Switch to `true` only when you're ready for production use

```dotenv
ENABLE_EMAIL=false
```

Rate limits (built-in, always enforced when enabled):
- Max **1 email per rule type** per 10 minutes
- Max **10 emails per hour** total

---

### `EMAIL_SENDER`, `EMAIL_PASSWORD`, `ALERT_RECIPIENT_EMAIL`
Gmail SMTP credentials. Use a **Gmail App Password**, not your regular password.

To generate a Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already on
3. Go to **App Passwords** (search for it in the search bar)
4. Select app: **Mail**, device: **Windows Computer**
5. Copy the 16-character password generated

```dotenv
EMAIL_SENDER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop       # the 16-char app password (spaces ok)
ALERT_RECIPIENT_EMAIL=alerts@yourdomain.com
```

---

### `SLACK_WEBHOOK_URL` (optional)
To get a Slack webhook:
1. Go to https://api.slack.com/apps
2. Create a new app → **Incoming Webhooks** → Activate
3. Add webhook to your channel → copy the URL

```dotenv
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Leave commented out if you don't use Slack.

---

### `FRONTEND_URL`
The URL where your frontend is running. Used in notification links:
```dotenv
FRONTEND_URL=http://localhost:5173
```

---

### `DEV_MODE`
Controls whether the synthetic log generator runs:
- `True` — synthetic generator active (good for testing)
- `False` — synthetic generator disabled (production/real mode only)

```dotenv
DEV_MODE=True
```

---

### `GROQ_API_KEY` and `GROQ_MODEL`
Powers the AI chat assistant. Get a free API key:
1. Go to https://console.groq.com
2. Sign up / log in
3. Go to **API Keys** → Create new key
4. Copy and paste it

```dotenv
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

---

## ✅ Complete `.env` Template

```dotenv
# --- Core ---
SECRET_KEY=                          # Generate: python -c "import secrets; print(secrets.token_hex(32))"
ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=480

# --- Log file monitoring ---
LOG_FILE_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log

# --- Nginx / Apache (leave empty if not running) ---
NGINX_LOG_PATH=
APACHE_LOG_PATH=

# --- Firewall ---
FIREWALL_LOG_PATH=C:\Windows\System32\LogFiles\Firewall\pfirewall.log
ENABLE_REAL_FIREWALL=false

# --- Packet Capture ---
# Find with: python -c "from scapy.all import get_if_list, get_if_hwaddr; [print(i, get_if_hwaddr(i)) for i in get_if_list()]"
# Pick the interface with a non-zero MAC address
CAPTURE_IFACE=\Device\NPF_{YOUR_INTERFACE_GUID_HERE}

# --- Whitelist (find with: ipconfig) ---
# Add your IPv4, IPv6, router IP — comma separated
WHITELIST_IPS=127.0.0.1,::1,localhost,0.0.0.0,::ffff:127.0.0.1,192.168.1.X,192.168.1.1

# --- Email (keep false while testing) ---
ENABLE_EMAIL=false
EMAIL_SENDER=youremail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ALERT_RECIPIENT_EMAIL=recipient@email.com

# --- Slack (optional) ---
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# --- App ---
FRONTEND_URL=http://localhost:5173

# --- Dev ---
DEV_MODE=True

# --- AI Chat ---
# Get free key at: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

---

## 🖥️ Step 6 — Start the Backend

> Run as **Administrator** for firewall log access and IP blocking to work.

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process [XXXX]
Scheduler started — broadcasting stats every 10 seconds
🚀 Starting in SYNTHETIC mode
🚀 Dev mode log generator started — full ML pipeline active
INFO:     Application startup complete.
```

---

## 🌐 Step 7 — Start the Frontend

Open a second terminal (no admin needed):

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🔐 Step 8 — Login

Open `http://localhost:5173` in your browser.

Default admin credentials:
```
Username: admin
Password: admin123
```

> Change these immediately after first login in a production environment.

---

## 🔄 Step 9 — Choose Data Mode

In the top right of the dashboard (admin only):

| Mode | When to use |
|---|---|
| **SYNTHETIC** | Demo, testing, development — generates realistic attack traffic automatically |
| **REAL** | Production — reads live Windows Event Logs, Firewall, Nginx, and packet capture |

Start with **SYNTHETIC** to verify everything is working before switching to REAL.

---

## 🧪 Step 10 — Test the Detection Pipeline (Optional)

Create a file called `test_traffic.py` in the project root:

```python
import requests, time

TARGET = "http://localhost:8000"
tests = [
    "/api/v1/logs?q=1' UNION SELECT * FROM users--",
    "/api/v1/logs?q=<script>alert(1)</script>",
    "/api/v1/../../../../etc/passwd",
    "/api/v1/admin",
    "/api/v1/logs",
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

Run it in a third terminal:
```bash
python test_traffic.py
```

Watch the **Live Feed** and **Alerts** page populate in real time.

---

## ⚠️ Common Issues

### "uvicorn not found"
```bash
pip install uvicorn fastapi
```

### "Permission denied" reading firewall log
Run your backend terminal as Administrator.

### "No module named win32evtlog"
```bash
pip install pywin32
```

### "Scapy not finding interfaces"
Make sure Npcap is installed with WinPcap compatibility mode checked. Reinstall if needed.

### Backend is very slow / unresponsive
You're likely in REAL mode with firewall logging generating too many entries. Switch to SYNTHETIC:
```bash
# Edit backend/data/data_mode.json
{"mode": "SYNTHETIC"}
```
Then restart the backend.

### Gmail sending limit exceeded
Set `ENABLE_EMAIL=false` in `.env` and restart. Gmail allows ~500 emails/day. The built-in rate limiter (10/hr) prevents this in normal use.

### Can't log in to the UI
The backend may be overwhelmed. Kill it with:
```bash
taskkill /F /IM python.exe
```
Then restart.

---

## 🐳 Docker Setup (Alternative)

If you prefer Docker over manual setup:

```bash
# Build and start everything
docker-compose up --build -d

# Check logs
docker-compose logs -f backend

# Stop
docker-compose down
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

> Note: Packet capture and Windows Event Log collection won't work inside Docker containers. Use Docker for demo/synthetic mode only.

---

## 📁 Data Persistence

| File | Purpose |
|---|---|
| `anomalyze.db` | All logs, alerts, users, response actions |
| `backend/data/data_mode.json` | Current SYNTHETIC/REAL mode (persists across restarts) |
| `backend/data/blocked_ips.txt` | IPs blocked via file fallback |
| `backend/data/ml_model.pkl` | Trained ML model (auto-saved, improves over time) |

---

## 🔒 Security Checklist for Production

- [ ] Change default admin password
- [ ] Set a strong random `SECRET_KEY`
- [ ] Set `ENABLE_REAL_FIREWALL=true` if you want actual IP blocking
- [ ] Add all your machine's IPs to `WHITELIST_IPS`
- [ ] Set `DEV_MODE=False`
- [ ] Set `ENABLE_EMAIL=true` with a proper App Password
- [ ] Set `FRONTEND_URL` to your actual domain
- [ ] Run backend as Administrator
- [ ] Use Docker + Nginx for public-facing deployment

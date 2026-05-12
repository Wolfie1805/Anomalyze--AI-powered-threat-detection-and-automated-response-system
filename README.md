# Anomalyze — AI-Based Cyber Threat Detection & Automated Response System

Anomalyze is a full-stack cybersecurity monitoring dashboard that detects network threats in real time using a combination of rule-based logic and AI (machine learning). It simulates a Security Operations Center (SOC) environment — flagging suspicious activity, logging every event, and automatically triggering response actions.

## Use Cases

- Monitor a server or network for suspicious login attempts, DoS attacks, port scans, credential stuffing, SQL injection, XSS, and path traversal
- Visualize threat patterns over time with live charts and maps
- Simulate different types of cyberattacks to test detection logic
- Maintain a full audit trail of all security events
- Export logs for reporting or further analysis
- Use AI chat assistant for threat analysis and recommendations

## Features

- **Dual Detection Engine**
  - Rule-based detection — flags known attack patterns instantly
  - AI anomaly detection — identifies unusual behavior using Isolation Forest scoring
- **8+ Attack Types Detected**: Brute Force, DoS, Port Scan, Credential Stuffing, SQL Injection, XSS, Path Traversal, Scanners
- **Automated Response Simulation** — logs actions like IP blocking and account flagging
- **Live Dashboard** — real-time stat cards, bar/line charts, threat maps, live terminal
- **Alerts Management** — view, filter, and resolve alerts with severity badges
- **Audit Log** — full chronological event log with search and filtering
- **ML Insights** — anomaly scores, feature importance charts
- **AI Chat Assistant** — ARIA for threat analysis powered by Groq API
- **WebSocket Real-time Updates** — live alerts and logs without polling
- **User Authentication** — JWT-based with ADMIN/ANALYST roles
- **Email Notifications** — SMTP alerts for high-severity threats
- **Docker Deployment** — easy setup with containerization

## Project Structure

```
anomalyze/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings and environment
│   ├── database.py             # SQLAlchemy setup
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── alert.py            # Alert model
│   │   ├── log_entry.py        # Log entry model
│   │   └── response_action.py  # Response model
│   ├── routers/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── alerts.py           # Alert CRUD + stats
│   │   ├── logs.py             # Log management
│   │   ├── dashboard.py        # Dashboard data
│   │   ├── responses.py        # Automated responses
│   │   ├── websocket.py        # WebSocket events
│   │   └── chat.py             # AI chat assistant
│   ├── modules/
│   │   ├── alert_manager.py    # Alert processing
│   │   ├── ml_engine.py        # ML anomaly detection
│   │   ├── rule_engine.py      # Rule-based detection
│   │   ├── preprocessor.py     # Log preprocessing
│   │   ├── response_engine.py  # Automated responses
│   │   ├── notifier.py         # Email notifications
│   │   ├── ip_geo.py           # IP geolocation
│   │   └── log_collector.py    # Log ingestion
│   ├── schemas/                # Pydantic schemas
│   ├── utils/                  # Utilities (auth, etc.)
│   ├── data/                   # Sample data and blocked IPs
│   ├── ml_models/              # Trained ML models
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React app
│   │   ├── main.tsx            # App entry point
│   │   ├── index.css           # Global styles
│   │   ├── api/                # API client functions
│   │   ├── components/
│   │   │   ├── alerts/         # Alert components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── map/            # Map components
│   │   │   ├── ml/             # ML insight components
│   │   │   └── ui/             # UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand stores
│   │   ├── context/            # React contexts
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Additional styles
│   ├── package.json            # Node dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── vite.config.ts          # Vite config
│   ├── index.html              # HTML template
│   └── nginx.conf              # Nginx config
├── docker-compose.yml          # Docker Compose setup
├── package.json                # Root package.json
└── README.md                   # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login and get JWT tokens |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/logs | Get paginated logs |
| POST | /api/v1/logs/stream | Stream logs via WebSocket |
| GET | /api/v1/alerts | Get alerts with filters |
| PUT | /api/v1/alerts/{id} | Update alert status |
| DELETE | /api/v1/alerts/{id} | Delete alert |
| GET | /api/v1/dashboard/stats | Get dashboard statistics |
| GET | /api/v1/dashboard/charts | Get chart data |
| POST | /api/v1/responses | Execute automated response |
| POST | /api/v1/chat | Query AI assistant |
| WS | /api/v1/ws | WebSocket for real-time events |
| GET | /api/v1/healthz | Health check |

## Detection Logic

### Rule Engine

| Attack Type | Condition | Severity |
|-------------|-----------|----------|
| BRUTE_FORCE | 5+ failed logins in 5 minutes | HIGH |
| DOS | 100+ requests per minute | HIGH |
| PORT_SCAN | 10+ unique ports accessed | MEDIUM |
| CRED_STUFFING | Failed logins from 3+ IPs | MEDIUM |
| SQL_INJECTION | SQL patterns in requests | HIGH |
| XSS | XSS patterns in requests | MEDIUM |
| PATH_TRAVERSAL | Path traversal patterns | HIGH |
| SCANNER_DETECTED | Security scanner tools | MEDIUM |
| UNAUTHORIZED_ACCESS | 401/403 responses | MEDIUM |

### ML Engine

Uses an Isolation Forest anomaly scorer. Features scored: status codes, request counts, time deltas, login attempts, success rates, unique ports. If flagged as anomaly → MEDIUM severity alert with detection method marked as "AI". Model retrains automatically on new data.

### Automated Responses

- **HIGH severity** → `"IP {ip} BLOCKED via iptables/netsh"`
- **MEDIUM severity** → `"Account {username} flagged for review"`
- **All alerts** → `"Admin notification sent"`

> Note: Responses are executed automatically. IP blocking uses system commands.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite, TypeScript |
| UI Components | Custom components, Tailwind CSS, Framer Motion |
| Charts | Recharts, Chart.js |
| Maps | React Simple Maps |
| State Management | Zustand |
| Data Fetching | Axios |
| Routing | React Router |
| Backend | Python, FastAPI, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| ML | Scikit-learn (Isolation Forest) |
| Scheduling | APScheduler |
| WebSockets | WebSockets library |
| Authentication | JWT, Bcrypt |
| API Client | Axios |
| Build Tool | Vite, Docker |
| Logging | Custom logger |

> Note: Responses are executed automatically. IP blocking uses system commands.

## How to Run Locally

### Prerequisites

- [Python](https://python.org/) 3.8 or higher
- [Node.js](https://nodejs.org/) v18 or higher
- [Docker](https://docker.com/) and Docker Compose
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd anomalyze
```

### 2. Install dependencies

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Set up environment variables

Create `.env` files:

**backend/.env**
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./anomalyze.db
DEV_MODE=True
GROQ_API_KEY=your-groq-api-key
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

**frontend/.env** (if needed)
```
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Set up the database

The database is created automatically on first run. For manual setup:

```bash
cd backend
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
```

### 5. Start the backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start the frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

### 7. Open in browser

Visit `http://localhost:5173` for the frontend.

The API docs are accessible at `http://localhost:8000/docs`.

## Key Commands

```bash
# Full typecheck across frontend
cd frontend && npm run build

# Run backend tests (if any)
cd backend && python -m pytest

# Run frontend in dev mode
cd frontend && npm run dev

# Run backend in dev mode
cd backend && uvicorn main:app --reload

# Build Docker images
docker-compose build

# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## How to Use the Dashboard

1. **Dashboard** — The home screen. Shows live threat stats, charts, and maps. View real-time alerts and anomaly scores.
2. **Alerts** — Browse all detected threats. Use filters by severity, status, detection method. Click "Resolve" to close alerts.
3. **Logs** — View the full audit trail. Search and filter logs by IP, timestamp, type.
4. **ML Insights** — Analyze anomaly scores and feature importance.
5. **Threat Map** — Visualize global threat distribution.
6. **Chat** — Ask ARIA for threat analysis and recommendations.

## Future Improvements

- Connect to real log sources (syslog, Windows Event Log, cloud providers)
- Add more ML models (supervised learning, deep learning)
- Real automated responses with integration to firewalls/SIEM
- Advanced threat hunting and correlation
- Multi-tenant support
- Kubernetes deployment
- Integration with threat intelligence feeds

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token

#### Logs
- `GET /api/v1/logs` - Get paginated logs
- `POST /api/v1/logs/stream` - Stream logs via WebSocket

#### Alerts
- `GET /api/v1/alerts` - Get alerts with filters
- `PUT /api/v1/alerts/{id}` - Update alert status
- `DELETE /api/v1/alerts/{id}` - Delete alert

#### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/charts` - Get chart data

#### Chat
- `POST /api/v1/chat` - Query AI assistant

#### WebSocket
- `ws://localhost:8000/api/v1/ws` - Real-time events

## License

MIT — free to use, modify, and distribute.
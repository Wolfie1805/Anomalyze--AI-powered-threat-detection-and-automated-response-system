# 🚀 Anomalyze — AI-Powered Cyber Threat Detection & Automated Response System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Anomalyze is a cutting-edge, full-stack cybersecurity monitoring platform that revolutionizes threat detection through the fusion of advanced rule-based logic and state-of-the-art AI machine learning. Designed to emulate a professional Security Operations Center (SOC), it provides real-time network threat identification, comprehensive logging, automated response mechanisms, and intuitive visualization tools.

## ✨ Key Highlights

- **🔍 Dual Detection Engine**: Combines instant rule-based threat flagging with AI-powered anomaly detection using Isolation Forest algorithms
- **🎯 Comprehensive Threat Coverage**: Detects 8+ attack types including Brute Force, DDoS, Port Scans, Credential Stuffing, SQL Injection, XSS, Path Traversal, and Security Scanners
- **⚡ Real-Time Monitoring**: Live dashboards with WebSocket-powered updates, no page refreshes needed
- **🤖 AI Assistant**: Integrated ARIA chatbot powered by Groq API for intelligent threat analysis and recommendations
- **🗺️ Global Threat Visualization**: Interactive maps showing attack origins and patterns
- **📊 Advanced Analytics**: ML insights with anomaly scoring, feature importance charts, and predictive analytics
- **🔒 Enterprise-Grade Security**: JWT authentication with role-based access (ADMIN/ANALYST)
- **📧 Automated Notifications**: SMTP email alerts for critical threats
- **🐳 Containerized Deployment**: One-command Docker setup for easy deployment
- **📱 Responsive Design**: Modern, mobile-friendly interface built with React and TypeScript

## 🎯 Use Cases

- **Server & Network Monitoring**: Real-time surveillance for suspicious activities like login attempts, DoS attacks, and port scans
- **Threat Pattern Analysis**: Visualize attack trends over time with interactive charts and geographical maps
- **Cybersecurity Training**: Simulate various attack scenarios to test and improve detection capabilities
- **Audit Trail Management**: Maintain comprehensive logs of all security events for compliance and analysis
- **Incident Response**: Automated blocking of malicious IPs and account flagging
- **AI-Powered Insights**: Leverage machine learning for anomaly detection and predictive threat hunting

## 🏗️ Architecture Overview

```
anomalyze/
├── backend/                          # Python FastAPI Backend
│   ├── main.py                       # Application entry point
│   ├── config.py                     # Configuration & settings
│   ├── database.py                   # SQLAlchemy database setup
│   ├── auth.py                       # Authentication utilities
│   ├── logger.py                     # Custom logging system
│   ├── scheduler.py                  # Background task scheduler
│   ├── websocket_manager.py          # WebSocket connection manager
│   ├── data_generator.py             # Sample data generation for testing
│   ├── models/                       # SQLAlchemy models
│   │   ├── user.py                   # User authentication model
│   │   ├── alert.py                  # Security alert model
│   │   ├── log_entry.py              # Audit log entry model
│   │   ├── response_action.py        # Automated response model
│   │   └── contact_request.py        # Contact form submissions
│   ├── routers/                      # API route handlers
│   │   ├── auth.py                   # Authentication endpoints
│   │   ├── alerts.py                 # Alert management API
│   │   ├── logs.py                   # Log management API
│   │   ├── dashboard.py              # Dashboard data API
│   │   ├── responses.py              # Automated response API
│   │   ├── websocket.py              # WebSocket event handling
│   │   ├── chat.py                   # AI chat assistant API
│   │   └── contact.py                # Contact form API
│   ├── modules/                      # Core business logic
│   │   ├── alert_manager.py          # Alert processing engine
│   │   ├── ml_engine.py              # Machine learning anomaly detection
│   │   ├── rule_engine.py            # Rule-based threat detection
│   │   ├── preprocessor.py           # Log data preprocessing
│   │   ├── response_engine.py        # Automated response execution
│   │   ├── notifier.py               # Email notification system
│   │   ├── ip_geo.py                 # IP geolocation services
│   │   └── log_collector.py          # Log ingestion and parsing
│   ├── schemas/                      # Pydantic data validation
│   ├── utils/                        # Utility functions
│   ├── data/                         # Static data and configurations
│   │   ├── blocked_ips.txt           # Blocked IP addresses
│   │   └── ml_models/                # Trained ML models
│   ├── Dockerfile                    # Backend container config
│   └── requirements.txt              # Python dependencies
├── frontend/                         # React TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx                   # Main application component
│   │   ├── main.tsx                  # Application entry point
│   │   ├── index.css                 # Global styles
│   │   ├── api/                      # API client functions
│   │   │   ├── alerts.ts             # Alert API client
│   │   │   ├── auth.ts               # Authentication API client
│   │   │   ├── dashboard.ts          # Dashboard API client
│   │   │   └── logs.ts               # Logs API client
│   │   ├── components/               # Reusable UI components
│   │   │   ├── alerts/               # Alert-related components
│   │   │   │   ├── AlertBadge.tsx    # Alert severity badges
│   │   │   │   ├── AlertDetailModal.tsx # Alert details modal
│   │   │   │   ├── AlertFilters.tsx  # Alert filtering controls
│   │   │   │   └── AlertTable.tsx    # Alert data table
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   │   ├── AlertTimeline.tsx # Timeline visualization
│   │   │   │   ├── AttackTypeChart.tsx # Attack type charts
│   │   │   ├── LiveTerminal.tsx      # Live terminal simulation
│   │   │   ├── StatCard.tsx          # Statistics cards
│   │   │   ├── ThreatGauge.tsx       # Threat level gauge
│   │   │   └── ...
│   │   │   ├── layout/               # Layout components
│   │   │   ├── map/                  # Map visualization components
│   │   │   ├── ml/                   # ML insight components
│   │   │   └── ui/                   # Generic UI components
│   │   ├── pages/                    # Page-level components
│   │   │   ├── DashboardPage.tsx     # Main dashboard
│   │   │   ├── AlertsPage.tsx        # Alerts management
│   │   │   ├── LogsPage.tsx          # Log viewer
│   │   │   ├── MLInsightsPage.tsx    # ML analytics
│   │   │   ├── ThreatMapPage.tsx     # Global threat map
│   │   │   ├── ResponsesPage.tsx     # Response actions
│   │   │   ├── SettingsPage.tsx      # User settings
│   │   │   └── LoginPage.tsx         # Authentication
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAlerts.ts          # Alert management hook
│   │   │   ├── useDashboardStats.ts  # Dashboard data hook
│   │   │   └── useWebSocket.ts       # WebSocket connection hook
│   │   ├── store/                    # Zustand state management
│   │   │   ├── alertStore.ts         # Alert state
│   │   │   ├── authStore.ts          # Authentication state
│   │   │   └── wsStore.ts            # WebSocket state
│   │   ├── context/                  # React contexts
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── types/                    # TypeScript type definitions
│   │   └── styles/                   # Additional stylesheets
│   │     ├── animations.css          # Animation styles
│   │     └── globals.css             # Global CSS variables
│   ├── public/
│   │   └── landing.html              # Marketing landing page
│   ├── Dockerfile                    # Frontend container config
│   ├── nginx.conf                    # Nginx web server config
│   ├── package.json                  # Node.js dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite build configuration
│   └── index.html                    # Main HTML template
├── docker-compose.yml                # Multi-container orchestration
├── requirements.txt                  # Root Python dependencies
├── package.json                      # Root Node.js dependencies
└── README.md                         # This documentation
```

## 🚀 Quick Start

### Prerequisites

- **Python** 3.8 or higher
- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for containerized deployment)
- **Git** for version control

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd anomalyze
   ```

2. **Environment Configuration**

   Copy the example environment file and configure your settings:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` with your configuration:
   ```env
   # Core Settings
   SECRET_KEY=your_super_secret_key_here
   ALGORITHM=HS256
   TOKEN_EXPIRE_MINUTES=480

   # Database
   DATABASE_URL=sqlite:///./anomalyze.db

   # AI Integration
   GROQ_API_KEY=your_groq_api_key_here

   # Email Notifications (Optional)
   ENABLE_EMAIL=false
   EMAIL_SENDER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ALERT_RECIPIENT_EMAIL=admin@yourdomain.com

   # Log Monitoring
   LOG_FILE_PATH=/var/log/auth.log

   # Security
   ENABLE_REAL_FIREWALL=false
   WHITELIST_IPS=127.0.0.1,::1
   ```

3. **Install Dependencies**

   **Backend:**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   ```

   **Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Initialization**
   ```bash
   cd ../backend
   python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**

   - **Dashboard**: http://localhost:5173
   - **Landing Page**: http://localhost:5173/landing.html
   - **API Documentation**: http://localhost:8000/docs
   - **API Health Check**: http://localhost:8000/api/v1/healthz

### Docker Deployment

For production deployment using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user account |
| POST | `/api/v1/auth/login` | Authenticate and receive JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh expired access tokens |

### Alert Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/alerts` | Retrieve alerts with filtering options |
| PUT | `/api/v1/alerts/{id}` | Update alert status and resolution |
| DELETE | `/api/v1/alerts/{id}` | Remove alert from system |

### Log Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/logs` | Get paginated audit logs |
| POST | `/api/v1/logs/stream` | Stream logs via WebSocket connection |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Retrieve dashboard statistics |
| GET | `/api/v1/dashboard/charts` | Get chart data for visualizations |

### AI & Communication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Query AI assistant for threat analysis |
| POST | `/api/v1/contact/submit` | Submit contact form inquiries |

### Real-Time Features
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WebSocket | `/api/v1/ws` | Real-time event streaming |
| GET | `/api/v1/healthz` | System health check endpoint |

## 🧠 Detection Engine

### Rule-Based Detection

Anomalyze employs sophisticated rule-based logic to instantly identify known threat patterns:

| Attack Type | Detection Criteria | Severity | Automated Response |
|-------------|-------------------|----------|-------------------|
| **Brute Force** | 5+ failed logins within 5 minutes | HIGH | IP blocking |
| **DDoS Attack** | 100+ requests per minute | HIGH | IP blocking |
| **Port Scanning** | Access to 10+ unique ports | MEDIUM | Account flagging |
| **Credential Stuffing** | Failed logins from 3+ different IPs | MEDIUM | Account flagging |
| **SQL Injection** | SQL injection patterns in requests | HIGH | IP blocking |
| **Cross-Site Scripting** | XSS patterns in request payloads | MEDIUM | Account flagging |
| **Path Traversal** | Directory traversal attempts | HIGH | IP blocking |
| **Security Scanner** | Detection of security scanning tools | MEDIUM | Account flagging |
| **Unauthorized Access** | 401/403 HTTP responses | MEDIUM | Account flagging |

### AI-Powered Anomaly Detection

The ML engine utilizes **Isolation Forest** algorithm to detect anomalous behavior patterns:

- **Features Analyzed**: HTTP status codes, request frequency, time intervals, login success rates, unique ports accessed
- **Anomaly Scoring**: Continuous model training on new data for improved accuracy
- **Severity Classification**: AI-detected anomalies trigger MEDIUM severity alerts
- **Adaptive Learning**: Model automatically retrains with incoming data streams

### Automated Response System

Intelligent response actions based on threat severity:

- **🔴 HIGH Severity**: Immediate IP blocking via system firewall commands
- **🟡 MEDIUM Severity**: Account flagging for administrative review
- **📧 All Alerts**: Automated email notifications to security team

> **Note**: Response actions are executed automatically. Configure `ENABLE_REAL_FIREWALL=false` in development to prevent actual system modifications.

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Backend** | Python | 3.8+ | Core application logic |
| **API Framework** | FastAPI | 0.109.2 | REST API and WebSocket support |
| **Database** | SQLite/PostgreSQL | - | Data persistence |
| **ORM** | SQLAlchemy | 2.0.25 | Database abstraction |
| **Validation** | Pydantic | 2.6.1 | Data validation and serialization |
| **Authentication** | JWT + Bcrypt | - | Secure user authentication |
| **ML Framework** | Scikit-learn | 1.4.0 | Anomaly detection algorithms |
| **Task Scheduling** | APScheduler | 3.10.4 | Background job processing |
| **WebSockets** | WebSockets | 12.0 | Real-time communication |
| **Frontend** | React | 18.2.0 | User interface framework |
| **Language** | TypeScript | 5.2.2 | Type-safe JavaScript |
| **Build Tool** | Vite | 5.1.4 | Fast development and bundling |
| **State Management** | Zustand | 4.5.2 | Lightweight state management |
| **UI Components** | Custom + Lucide Icons | - | Consistent design system |
| **Charts** | Recharts + Chart.js | 2.12.2 / 4.4.2 | Data visualization |
| **Maps** | React Simple Maps | 3.0.0 | Geographical threat mapping |
| **Animations** | Framer Motion | 11.0.8 | Smooth UI transitions |
| **HTTP Client** | Axios | 1.6.7 | API communication |
| **Styling** | Tailwind CSS | - | Utility-first CSS framework |
| **Deployment** | Docker + Docker Compose | - | Containerized deployment |

## 🎮 User Guide

### Dashboard Overview
- **Real-Time Statistics**: Live threat metrics and KPI cards
- **Interactive Charts**: Attack timelines, type distributions, and trend analysis
- **Threat Map**: Global visualization of attack origins
- **Live Terminal**: Simulated command-line interface for system monitoring

### Alert Management
- **Comprehensive Filtering**: Filter by severity, status, detection method, and time range
- **Bulk Operations**: Resolve multiple alerts simultaneously
- **Detailed View**: Drill down into alert specifics and response actions
- **Status Tracking**: Monitor alert lifecycle from detection to resolution

### Log Analysis
- **Advanced Search**: Full-text search across all log entries
- **Time-Based Filtering**: Narrow down logs by date ranges
- **Export Capabilities**: Download logs for external analysis
- **Real-Time Streaming**: Live log ingestion with WebSocket updates

### AI Insights
- **Anomaly Scoring**: Visualize ML model confidence levels
- **Feature Importance**: Understand which factors contribute to threat detection
- **Predictive Analytics**: Forecast potential future threats
- **Model Performance**: Monitor AI accuracy and false positive rates

### Threat Intelligence
- **Geographical Analysis**: Map-based attack origin visualization
- **Attack Pattern Recognition**: Identify trending threat vectors
- **Correlation Analysis**: Link related security events
- **Reporting**: Generate comprehensive threat reports

## 🤝 Contributing

We welcome contributions from the cybersecurity community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the local development setup instructions above
4. Make your changes and ensure tests pass
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **Backend**: Follow PEP 8 Python style guidelines
- **Frontend**: Use ESLint and Prettier for code formatting
- **Commits**: Use conventional commit format
- **Testing**: Add tests for new features and bug fixes

### Areas for Contribution
- **ML Model Improvements**: Enhance anomaly detection algorithms
- **New Detection Rules**: Add support for emerging threat types
- **UI/UX Enhancements**: Improve user interface and experience
- **Performance Optimization**: Optimize database queries and API responses
- **Documentation**: Improve code documentation and user guides
- **Security Hardening**: Implement additional security measures

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Dual detection engine (rules + AI)
- ✅ Real-time dashboard and WebSocket updates
- ✅ Comprehensive alert and log management
- ✅ Docker containerization

### Phase 2 (Upcoming)
- 🔄 Integration with real log sources (syslog, Windows Event Log, cloud providers)
- 🔄 Advanced ML models (supervised learning, deep learning)
- 🔄 Real firewall integration for automated responses
- 🔄 Multi-tenant architecture support

### Phase 3 (Future)
- 🔄 Kubernetes deployment manifests
- 🔄 Threat intelligence feed integration
- 🔄 Advanced threat hunting and correlation
- 🔄 SIEM system integration
- 🔄 Mobile application companion

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the cybersecurity community**

*Stay vigilant, stay secure!* 🛡️
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
| POST | /api/v1/contact/submit | Submit contact form |
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
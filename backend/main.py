import asyncio
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base, SessionLocal
from backend.config import settings
from backend.models.user import User
from backend.utils.auth import get_password_hash

from backend.routers.auth import router as auth_router
from backend.routers.logs import router as logs_router
from backend.routers.alerts import router as alerts_router
from backend.routers.responses import router as responses_router
from backend.routers.dashboard import router as dashboard_router
from backend.routers.websocket import router as websocket_router
from backend.routers.chat import chat_router
from backend.routers.contact import router as contact_router

# Import data_mode router + helpers
from backend.routers.data_mode import (
    router as data_mode_router,
    get_current_mode,
    set_collector_task,
)

from backend.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)


def create_initial_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating default admin user...")
            admin = User(
                username="admin",
                email="admin@anomalyze.local",
                hashed_password=get_password_hash("admin123"),
                role="ADMIN",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_initial_admin()
    start_scheduler()

    # ── KEY FIX ──────────────────────────────────────────────────────────────
    # Read the persisted mode from data/data_mode.json (set by the UI toggle).
    # This replaces the old `if settings.DEV_MODE` check which ignored the
    # toggle entirely — synthetic kept running even after you switched to REAL.
    # ─────────────────────────────────────────────────────────────────────────
    startup_mode = get_current_mode()   # "SYNTHETIC" or "REAL"
    print(f"🚀 Starting in {startup_mode} mode")

    if startup_mode == "REAL":
        from backend.modules.real_collector import real_network_collector
        task = asyncio.create_task(real_network_collector())
    else:
        from backend.modules.log_collector import dev_mode_log_generator
        task = asyncio.create_task(dev_mode_log_generator())

    # Register the task so the /data-mode/set endpoint can cancel it on toggle
    set_collector_task(task)

    yield  # ← app is running

    # Graceful shutdown
    if task and not task.done():
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "null",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,       prefix=settings.API_V1_STR)
app.include_router(logs_router,       prefix=settings.API_V1_STR)
app.include_router(alerts_router,     prefix=settings.API_V1_STR)
app.include_router(responses_router,  prefix=settings.API_V1_STR)
app.include_router(dashboard_router,  prefix=settings.API_V1_STR)
app.include_router(websocket_router)
app.include_router(chat_router,       prefix=settings.API_V1_STR)
app.include_router(contact_router)
app.include_router(data_mode_router,  prefix=settings.API_V1_STR)   # ← registers /api/v1/data-mode
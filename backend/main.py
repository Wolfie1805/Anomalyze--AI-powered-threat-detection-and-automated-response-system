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

from backend.scheduler import start_scheduler
from backend.modules.log_collector import dev_mode_log_generator
from backend.modules.ml_engine import ml_engine
from backend.routers.contact import router as contact_router
# ...inside your app setup where you include other routers:

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
                is_active=True
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_initial_admin()
    start_scheduler()
    task = None
    if settings.DEV_MODE:
        task = asyncio.create_task(dev_mode_log_generator())
    yield
    if task:
        task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)
app.include_router(contact_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "null"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(logs_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(responses_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)
app.include_router(chat_router, prefix=settings.API_V1_STR)
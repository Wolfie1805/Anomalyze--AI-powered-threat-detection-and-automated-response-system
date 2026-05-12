from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True)
    username = Column(String, index=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    attack_type = Column(String)
    severity = Column(String)
    status = Column(String, default="OPEN") # OPEN, RESOLVED
    detection_method = Column(String) # RULE, AI-RF, AI-IF
    action_taken = Column(String, nullable=True) # BLOCKED, LOGGED

class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True)
    username = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    login_attempts = Column(Integer, default=0)
    request_count = Column(Integer, default=0)
    success = Column(Boolean, default=False)
    port = Column(Integer, nullable=True)
    event_type = Column(String)
    label = Column(String, nullable=True) # For supervised training if generated

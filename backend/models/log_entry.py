from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, JSON
from sqlalchemy.sql import func
from backend.database import Base

class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), index=True, default=func.now())
    source_ip = Column(String, index=True)
    dest_ip = Column(String, index=True, nullable=True)
    port = Column(Integer, nullable=True)
    log_type = Column(String, index=True) # auth, nginx, apache, windows, custom
    raw_data = Column(String)
    parsed_data = Column(JSON, nullable=True)
    severity = Column(String, default="low") # low, medium, high, critical
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, nullable=True)

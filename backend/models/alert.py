from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("log_entries.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    rule_name = Column(String, index=True)
    description = Column(String)
    severity = Column(String, index=True)
    status = Column(String, default="NEW")

    # ── NEW COLUMNS ──
    source_ip = Column(String, nullable=True)
    anomaly_score = Column(Float, nullable=True)
    detection_method = Column(String, default="RULE")  # RULE / ML / BOTH

    log_entry = relationship("LogEntry")
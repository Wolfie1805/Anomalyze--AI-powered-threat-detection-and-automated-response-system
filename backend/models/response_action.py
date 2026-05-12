from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    action_type = Column(String, index=True) # block_ip, email_alert
    target_ip = Column(String, index=True, nullable=True)
    status = Column(String, default="pending") # pending, success, failed
    details = Column(String, nullable=True)

    alert = relationship("Alert")

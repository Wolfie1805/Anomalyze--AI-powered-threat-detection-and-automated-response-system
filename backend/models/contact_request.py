from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database import Base

class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    organisation = Column(String, nullable=False)
    request_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="PENDING")          # PENDING / REVIEWED / RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)
from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class LogEntryBase(BaseModel):
    source_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    port: Optional[int] = None
    log_type: str
    raw_data: str
    parsed_data: Optional[Dict[str, Any]] = None
    severity: Optional[str] = "low"

class LogEntryCreate(LogEntryBase):
    timestamp: Optional[datetime] = None
    is_anomaly: Optional[bool] = False
    anomaly_score: Optional[float] = None

class LogEntryResponse(LogEntryBase):
    id: int
    timestamp: datetime
    is_anomaly: bool
    anomaly_score: Optional[float] = None

    class Config:
        from_attributes = True

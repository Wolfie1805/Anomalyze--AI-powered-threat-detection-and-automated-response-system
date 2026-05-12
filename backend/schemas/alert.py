from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    rule_name: str
    description: str
    severity: str
    status: Optional[str] = "NEW"

class AlertCreate(AlertBase):
    log_id: Optional[int] = None
    source_ip: Optional[str] = None
    anomaly_score: Optional[float] = None
    detection_method: Optional[str] = "RULE"

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime
    log_id: Optional[int] = None
    source_ip: Optional[str] = None
    anomaly_score: Optional[float] = None
    detection_method: Optional[str] = "RULE"

    class Config:
        from_attributes = True
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class LogBase(BaseModel):
    ip_address: str
    username: Optional[str] = None
    timestamp: Optional[datetime] = None
    login_attempts: int = 0
    request_count: int = 0
    success: bool = False
    port: Optional[int] = None
    event_type: str
    label: Optional[str] = None

class LogCreate(LogBase):
    pass

class LogResponse(LogBase):
    id: int
    class Config:
        orm_mode = True

class AlertBase(BaseModel):
    ip_address: str
    username: Optional[str] = None
    attack_type: str
    severity: str
    status: str = "OPEN"
    detection_method: str
    action_taken: Optional[str] = None

class AlertCreate(AlertBase):
    timestamp: Optional[datetime] = None

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime
    class Config:
        orm_mode = True

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from backend.database import get_db
from backend.models.log_entry import LogEntry
from backend.models.alert import Alert
from backend.utils.auth import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    now = datetime.now()
    past_24h = now - timedelta(hours=24)
    
    total_logs_24h = db.query(LogEntry).filter(LogEntry.timestamp >= past_24h).count()
    total_alerts_24h = db.query(Alert).filter(Alert.timestamp >= past_24h).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "critical").count()
    
    # Active threats (alerts not resolved)
    active_threats = db.query(Alert).filter(Alert.status != "resolved").count()
    
    return {
        "total_logs_24h": total_logs_24h,
        "total_alerts_24h": total_alerts_24h,
        "critical_alerts_total": critical_alerts,
        "active_threats": active_threats
    }

@router.get("/threat-level")
def get_threat_level(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Calculate current threat level 0-100% based on recent alerts"""
    past_1h = datetime.now() - timedelta(hours=1)
    recent_alerts = db.query(Alert).filter(Alert.timestamp >= past_1h).all()
    
    if not recent_alerts:
        return {"level": 0}
        
    score = 0
    for a in recent_alerts:
        if a.severity == "critical": score += 20
        elif a.severity == "high": score += 10
        elif a.severity == "medium": score += 5
        elif a.severity == "low": score += 1
        
    threat_level = min(score, 100)
    return {"level": threat_level}

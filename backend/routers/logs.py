from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.models.log_entry import LogEntry
from backend.utils.auth import get_current_active_user

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("", response_model=dict)
def get_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=1000),
    log_type: Optional[str] = None,
    severity: Optional[str] = None,
    source_ip: Optional[str] = None,
    is_anomaly: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(LogEntry)
    if log_type:
        query = query.filter(LogEntry.log_type == log_type)
    if severity:
        query = query.filter(LogEntry.severity == severity)
    if source_ip:
        query = query.filter(LogEntry.source_ip == source_ip)
    if is_anomaly is not None:
        query = query.filter(LogEntry.is_anomaly == is_anomaly)

    total = query.count()
    logs = query.order_by(LogEntry.timestamp.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "logs": [
            {
                "id": l.id,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None,
                "source_ip": l.source_ip,
                "dest_ip": l.dest_ip,
                "port": l.port,
                "log_type": l.log_type,
                "raw_data": l.raw_data,
                "parsed_data": l.parsed_data,
                "severity": l.severity,
                "is_anomaly": l.is_anomaly,
                "anomaly_score": l.anomaly_score,
            }
            for l in logs
        ]
    }

@router.post("/upload")
async def upload_logs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    content = await file.read()
    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "size": len(content)
    }

@router.get("/sources")
def get_log_sources(current_user = Depends(get_current_active_user)):
    return [
        {"id": 1, "type": "nginx", "path": "/var/log/nginx/access.log", "status": "active"},
        {"id": 2, "type": "auth", "path": "/var/log/auth.log", "status": "active"},
    ]

@router.post("/sources")
def add_log_source(
    source_type: str,
    path: str,
    current_user = Depends(get_current_active_user)
):
    return {"message": "Log source added", "type": source_type, "path": path}
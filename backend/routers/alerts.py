from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import csv
from io import StringIO

from backend.database import get_db
from backend.models.alert import Alert
from backend.utils.auth import get_current_active_user
from backend.modules.ip_geo import get_ip_geo
from backend.modules.response_engine import unblock_ip

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=dict)
def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=1000),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)

    total = query.count()
    alerts = query.order_by(Alert.timestamp.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "alerts": [
            {
                "id": a.id,
                "rule_name": a.rule_name,
                "description": a.description,
                "severity": a.severity,
                "status": a.status,
                "timestamp": a.timestamp.isoformat() if a.timestamp else None,
                "log_id": a.log_id,
                "source_ip": getattr(a, 'source_ip', None),
                "anomaly_score": getattr(a, 'anomaly_score', None),
                "detection_method": getattr(a, 'detection_method', 'RULE'),
            }
            for a in alerts
        ]
    }


@router.get("/stats")
def get_alert_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    severity_stats = db.query(Alert.severity, func.count(Alert.id)).group_by(Alert.severity).all()
    status_stats = db.query(Alert.status, func.count(Alert.id)).group_by(Alert.status).all()

    return {
        "by_severity": {s[0]: s[1] for s in severity_stats},
        "by_status": {s[0]: s[1] for s in status_stats}
    }


@router.get("/geo-stats")
def get_alert_geo_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    from backend.models.log_entry import LogEntry
    try:
        alerts_with_logs = db.query(Alert, LogEntry).join(
            LogEntry, Alert.log_id == LogEntry.id
        ).all()
        country_counts = {}
        for alert, log in alerts_with_logs:
            ip = log.source_ip
            if ip:
                geo = get_ip_geo(ip)
                country = geo.get("country", "Unknown")
                country_counts[country] = country_counts.get(country, 0) + 1
        return {"countries": country_counts}
    except Exception as e:
        return {"countries": {}}


@router.get("/export")
def export_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    alerts = db.query(Alert).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Rule Name", "Severity", "Status", "Description"])
    for a in alerts:
        writer.writerow([
            a.id, a.timestamp, a.rule_name,
            a.severity, a.status, a.description
        ])
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=alerts_export.csv"
    return response


@router.get("/{id}")
def get_alert(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    from backend.models.log_entry import LogEntry
    a = db.query(Alert).filter(Alert.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")

    raw_log = None
    if a.log_id:
        log = db.query(LogEntry).filter(LogEntry.id == a.log_id).first()
        if log:
            raw_log = log.raw_data

    return {
        "id": a.id,
        "rule_name": a.rule_name,
        "description": a.description,
        "severity": a.severity,
        "status": a.status,
        "timestamp": a.timestamp.isoformat() if a.timestamp else None,
        "log_id": a.log_id,
        "source_ip": getattr(a, 'source_ip', None),
        "anomaly_score": getattr(a, 'anomaly_score', None),
        "detection_method": getattr(a, 'detection_method', 'RULE'),
        "raw_log": raw_log,
    }


@router.patch("/{id}/status")
def update_alert_status(
    id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status
    db.commit()
    return {"message": "Status updated", "status": status}


@router.post("/{id}/notes")
def add_alert_note(
    id: int,
    note: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.description = (alert.description or "") + f"\n[NOTE]: {note}"
    db.commit()
    return {"message": "Note added"}


@router.post("/{id}/false-positive")
def mark_false_positive(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mark alert as false positive and auto-unblock the IP."""
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Update alert status
    alert.status = "FALSE_POSITIVE"
    alert.description = (alert.description or "") + \
        f"\n[FALSE POSITIVE]: Marked by {current_user.username} at {__import__('datetime').datetime.utcnow().isoformat()}"
    db.commit()

    # Auto-unblock the IP if one exists
    unblock_result = None
    if alert.source_ip:
        success, details = unblock_ip(alert.source_ip)
        unblock_result = {"ip": alert.source_ip, "success": success, "details": details}

    return {
        "message": "Alert marked as false positive",
        "alert_id": id,
        "unblock_result": unblock_result
    }


@router.post("/{id}/unblock-ip")
def unblock_alert_ip(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Manually unblock the IP associated with an alert."""
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if not alert.source_ip:
        raise HTTPException(status_code=400, detail="No IP associated with this alert")

    success, details = unblock_ip(alert.source_ip)

    if success:
        alert.description = (alert.description or "") + \
            f"\n[UNBLOCKED]: IP {alert.source_ip} unblocked by {current_user.username} at {__import__('datetime').datetime.utcnow().isoformat()}"
        db.commit()

    return {
        "message": "IP unblocked" if success else "Unblock failed",
        "ip": alert.source_ip,
        "success": success,
        "details": details
    }


@router.delete("")
def clear_all_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """ADMIN only — clear all alerts."""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    deleted = db.query(Alert).delete()
    db.commit()
    return {"message": f"Cleared {deleted} alerts"}


@router.delete("/{id}")
def delete_alert(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}
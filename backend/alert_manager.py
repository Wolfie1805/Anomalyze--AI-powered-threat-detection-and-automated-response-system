from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from logger import log_audit

class AlertManager:
    def create_alert(self, db: Session, alert_in: schemas.AlertCreate):
        alert = models.Alert(
            ip_address=alert_in.ip_address,
            username=alert_in.username,
            timestamp=alert_in.timestamp,
            attack_type=alert_in.attack_type,
            severity=alert_in.severity,
            status=alert_in.status,
            detection_method=alert_in.detection_method,
            action_taken=alert_in.action_taken
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    def get_alerts(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()

    def get_stats(self, db: Session):
        total_alerts = db.query(models.Alert).count()
        resolved_alerts = db.query(models.Alert).filter(models.Alert.status == "RESOLVED").count()
        unresolved_alerts = total_alerts - resolved_alerts
        
        # Count by severity
        high_sev = db.query(models.Alert).filter(models.Alert.severity == "HIGH").count()
        medium_sev = db.query(models.Alert).filter(models.Alert.severity == "MEDIUM").count()
        low_sev = db.query(models.Alert).filter(models.Alert.severity == "LOW").count()
        
        return {
            "total": total_alerts,
            "resolved": resolved_alerts,
            "unresolved": unresolved_alerts,
            "severity_counts": {
                "HIGH": high_sev,
                "MEDIUM": medium_sev,
                "LOW": low_sev
            }
        }
        
    def resolve_alert(self, db: Session, alert_id: int):
        alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
        if alert:
            alert.status = "RESOLVED"
            db.commit()
            log_audit("INFO", f"Alert {alert_id} resolved via backend request.")
        return alert

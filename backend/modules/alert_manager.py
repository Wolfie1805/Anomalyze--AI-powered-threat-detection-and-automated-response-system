import asyncio
from sqlalchemy.orm import Session
from backend.models.log_entry import LogEntry
from backend.models.alert import Alert
from backend.modules.rule_engine import evaluate_rules
from backend.modules.ml_engine import ml_engine
from backend.modules.preprocessor import preprocess_log
from backend.modules.response_engine import handle_alert
from backend.modules.notifier import notify_all

def _broadcast(event_type: str, data: dict):
    try:
        from backend.routers.websocket import manager
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(manager.broadcast(event_type, data))
    except Exception as e:
        print(f"Broadcast error: {e}")

def process_log_for_alerts(log_entry: LogEntry, db: Session) -> list:
    alerts_created = []

    _broadcast("log_entry", {
        "id": log_entry.id,
        "timestamp": str(log_entry.timestamp),
        "ip_address": log_entry.source_ip or "unknown",
        "log_type": log_entry.log_type,
        "event_type": log_entry.log_type,
        "raw_data": log_entry.raw_data,
        "port": 0,
        "success": False,
    })

    matched_rules = evaluate_rules(
        log_entry.parsed_data or {},
        log_entry.raw_data or "",
        source_ip=log_entry.source_ip
    )

    is_known_attack = len(matched_rules) > 0

    for rule_name, severity in matched_rules:
        existing = db.query(Alert).filter(
            Alert.rule_name == rule_name,
            Alert.log_id == log_entry.id
        ).first()
        if existing:
            continue

        alert = Alert(
            log_id=log_entry.id,
            rule_name=rule_name,
            description=f"Rule [{rule_name}] triggered — Source IP: {log_entry.source_ip or 'unknown'}",
            severity=severity,
            status="NEW",
            source_ip=log_entry.source_ip,        # ← FIXED
            detection_method="RULE",               # ← FIXED
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        alerts_created.append(alert)

        _broadcast("new_alert", {
            "id": alert.id,
            "timestamp": str(alert.timestamp),
            "rule_name": alert.rule_name,
            "attack_type": alert.rule_name,
            "ip_address": log_entry.source_ip or "unknown",
            "severity": alert.severity,
            "status": alert.status,
            "description": alert.description,
            "source_ip": log_entry.source_ip or "unknown",
        })

    features = preprocess_log(log_entry.log_type, log_entry.parsed_data or {})
    is_anomaly, score = ml_engine.predict(features)
    ml_engine.add_to_buffer(features, is_known_attack=is_known_attack)

    log_entry.is_anomaly = bool(is_anomaly)
    log_entry.anomaly_score = float(score)
    db.commit()

    if is_anomaly and score > 40:
        if score > 80:
            ml_severity = "CRITICAL"
        elif score > 60:
            ml_severity = "HIGH"
        else:
            ml_severity = "MEDIUM"

        alert = Alert(
            log_id=log_entry.id,
            rule_name="ML_ANOMALY_DETECTED",
            description=(
                f"ML Engine detected anomalous behavior from "
                f"{log_entry.source_ip or 'unknown'} "
                f"(Risk Score: {score:.1f}%)"
            ),
            severity=ml_severity,
            status="NEW",
            source_ip=log_entry.source_ip,        # ← FIXED
            anomaly_score=round(score, 1),         # ← FIXED
            detection_method="ML",                 # ← FIXED
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        alerts_created.append(alert)

        _broadcast("new_alert", {
            "id": alert.id,
            "timestamp": str(alert.timestamp),
            "rule_name": alert.rule_name,
            "attack_type": "ML_ANOMALY",
            "ip_address": log_entry.source_ip or "unknown",
            "severity": alert.severity,
            "status": alert.status,
            "description": alert.description,
            "source_ip": log_entry.source_ip or "unknown",
            "anomaly_score": round(score, 1),
        })

    for alert in alerts_created:
        handle_alert(alert, db, target_ip=log_entry.source_ip)
        try:
            notify_all({
                "id": alert.id,
                "rule_name": alert.rule_name,
                "severity": alert.severity,
                "description": alert.description,
                "source_ip": log_entry.source_ip,
                "timestamp": str(alert.timestamp),
            })
        except Exception as e:
            print(f"Notify error: {e}")

    return alerts_created
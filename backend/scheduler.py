from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.log_entry import LogEntry
from backend.models.alert import Alert
from backend.routers.websocket import manager
from backend.modules.ml_engine import ml_engine

scheduler = AsyncIOScheduler()

async def broadcast_system_stats():
    db = SessionLocal()
    try:
        # Count alerts by status
        total = db.query(Alert).count()
        new_count = db.query(Alert).filter(Alert.status == "NEW").count()
        resolved = db.query(Alert).filter(Alert.status == "RESOLVED").count()
        high = db.query(Alert).filter(Alert.severity == "HIGH").count()
        critical = db.query(Alert).filter(Alert.severity == "CRITICAL").count()

        stats = {
            "by_status": {
                "NEW": new_count,
                "RESOLVED": resolved,
            },
            "by_severity": {
                "HIGH": high + critical,
                "CRITICAL": critical,
                "MEDIUM": db.query(Alert).filter(Alert.severity == "MEDIUM").count(),
                "LOW": db.query(Alert).filter(Alert.severity == "LOW").count(),
            },
            "total": total,
            "unresolved": new_count,
            "resolved": resolved,
        }

        # Broadcast with the correct event type the frontend listens for
        await manager.broadcast("stats_update", stats)

    except Exception as e:
        print(f"Scheduler broadcast error: {e}")
    finally:
        db.close()

def refresh_ip_reputation():
    print("Scheduler: Refreshing IP reputation cache...")

def retrain_ml_model():
    print("Scheduler: Retraining ML Model...")
    db = SessionLocal()
    try:
        recent_normal = db.query(LogEntry).filter(
            LogEntry.is_anomaly == False
        ).order_by(LogEntry.timestamp.desc()).limit(1000).all()

        features_list = []
        for log in recent_normal:
            from backend.modules.preprocessor import preprocess_log
            features = preprocess_log(log.log_type, log.parsed_data or {})
            features_list.append(features)

        if len(features_list) > 10:
            ml_engine.train(features_list)
            print(f"Scheduler: ML retrained with {len(features_list)} samples")
    except Exception as e:
        print(f"Scheduler retrain error: {e}")
    finally:
        db.close()

def cleanup_old_logs():
    print("Scheduler: Cleaning up old logs...")
    db = SessionLocal()
    try:
        thirty_days_ago = datetime.now() - timedelta(days=30)
        deleted = db.query(LogEntry).filter(
            LogEntry.timestamp < thirty_days_ago
        ).delete()
        db.commit()
        print(f"Scheduler: Deleted {deleted} old log entries")
    except Exception as e:
        print(f"Scheduler cleanup error: {e}")
    finally:
        db.close()

def start_scheduler():
    # Broadcast stats every 10 seconds — fast enough for live feel
    scheduler.add_job(broadcast_system_stats, 'interval', seconds=10)
    scheduler.add_job(refresh_ip_reputation, 'interval', minutes=5)
    scheduler.add_job(retrain_ml_model, 'cron', day_of_week='sun', hour=3)
    scheduler.add_job(cleanup_old_logs, 'interval', hours=1)
    scheduler.start()
    print("Scheduler started — broadcasting stats every 10 seconds")
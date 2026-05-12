import random
import datetime
from sqlalchemy.orm import Session
import models

def generate_fake_data(db: Session, num_records: int = 1000):
    # Check if we already have records
    if db.query(models.LogEntry).count() > 0:
        return
        
    print(f"Generating {num_records} fake log entries...")
    records = []
    now = datetime.datetime.utcnow()
    
    event_types = ["login", "http_request", "ssh_connection", "port_scan_attempt"]
    labels = ["normal", "brute_force", "dos", "port_scan", "credential_stuffing"]
    
    # 80% normal, 20% anomaly
    for i in range(num_records):
        is_anomaly = random.random() < 0.2
        
        timestamp = now - datetime.timedelta(minutes=random.randint(1, 10000))
        ip = f"{random.randint(10, 192)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"
        username = random.choice(["admin", "root", "user1", "guest", "test"])
        
        if not is_anomaly:
            label = "normal"
            login_attempts = random.randint(1, 4)
            request_count = random.randint(1, 50)
            success = random.random() > 0.1
            port = random.choice([22, 80, 443])
            event_type = random.choice(event_types)
        else:
            anomaly_type = random.choice(labels[1:])
            label = anomaly_type
            
            if anomaly_type == "brute_force":
                login_attempts = random.randint(15, 100)
                request_count = random.randint(1, 20)
                success = False
                port = 22
                event_type = "login"
            elif anomaly_type == "dos":
                login_attempts = random.randint(0, 2)
                request_count = random.randint(150, 1000)
                success = True
                port = 80
                event_type = "http_request"
            elif anomaly_type == "port_scan":
                login_attempts = 0
                request_count = random.randint(50, 300)
                success = False
                port = random.randint(1024, 65535)
                event_type = "port_scan_attempt"
            else: # credential_stuffing
                login_attempts = random.randint(5, 30)
                request_count = random.randint(10, 50)
                success = random.random() > 0.8
                port = random.choice([80, 443])
                event_type = "login"

        entry = models.LogEntry(
            ip_address=ip,
            username=username,
            timestamp=timestamp,
            login_attempts=login_attempts,
            request_count=request_count,
            success=success,
            port=port,
            event_type=event_type,
            label=label
        )
        records.append(entry)
        
    db.add_all(records)
    db.commit()
    print("Fake data generated successfully.")

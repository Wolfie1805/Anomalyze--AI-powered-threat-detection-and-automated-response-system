import smtplib
from email.mime.text import MIMEText
from backend.config import settings

def send_email_alert(subject: str, body: str):
    if not settings.EMAIL_SENDER or not settings.EMAIL_PASSWORD:
        print("Email not configured. Skipping alert.")
        return
        
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_SENDER
    msg['To'] = settings.EMAIL_SENDER # send to self for now
    
    try:
        with smtplib.SMTP(settings.EMAIL_SMTP_SERVER, settings.EMAIL_SMTP_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.send_message(msg)
        print("Email alert sent successfully.")
    except Exception as e:
        print(f"Failed to send email alert: {e}")

def notify_all(alert_info: dict):
    subject = f"ANOMALYZE ALERT: {alert_info.get('rule_name')} [{alert_info.get('severity')}]"
    body = f"Alert ID: {alert_info.get('id')}\nDescription: {alert_info.get('description')}\nTimestamp: {alert_info.get('timestamp')}"
    send_email_alert(subject, body)

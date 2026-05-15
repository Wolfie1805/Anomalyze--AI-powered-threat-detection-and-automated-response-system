import smtplib
import time
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from backend.config import settings

# ── Rate limiting ─────────────────────────────────────────────────────────────
_last_sent: dict = {}
RATE_LIMIT_MINUTES = 10
MAX_EMAILS_PER_HOUR = 10
_emails_sent_this_hour: list = []


def _is_rate_limited(rule_name: str) -> bool:
    now = datetime.now()
    window = now - timedelta(minutes=RATE_LIMIT_MINUTES)
    hour_window = now - timedelta(hours=1)

    _emails_sent_this_hour[:] = [t for t in _emails_sent_this_hour if t > hour_window]

    if len(_emails_sent_this_hour) >= MAX_EMAILS_PER_HOUR:
        return True

    last = _last_sent.get(rule_name)
    if last and last > window:
        return True

    return False


def _record_sent(rule_name: str):
    now = datetime.now()
    _last_sent[rule_name] = now
    _emails_sent_this_hour.append(now)


def _email_enabled() -> bool:
    """Single source of truth for whether email is enabled."""
    enable = str(getattr(settings, "ENABLE_EMAIL", "false")).lower().strip()
    return enable in ("true", "1", "yes")


def send_email_alert(subject: str, body: str, rule_name: str = "GENERIC"):
    if not _email_enabled():
        return

    if not settings.EMAIL_SENDER or not settings.EMAIL_PASSWORD:
        return

    if _is_rate_limited(rule_name):
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_SENDER
    msg["To"] = settings.ALERT_RECIPIENT_EMAIL

    try:
        with smtplib.SMTP(
            settings.EMAIL_SMTP_SERVER,
            settings.EMAIL_SMTP_PORT
        ) as server:
            server.starttls()
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.send_message(msg)

        _record_sent(rule_name)
        print(f"✉ Email alert sent: {rule_name}")

    except Exception as e:
        print(f"Failed to send email alert: {e}")


def notify_all(alert_info: dict):
    if not _email_enabled():
        return

    rule_name = alert_info.get("rule_name", "GENERIC")

    if _is_rate_limited(rule_name):
        return

    subject = (
        f"ANOMALYZE ALERT: {rule_name} "
        f"[{alert_info.get('severity')}]"
    )
    body = (
        f"Alert ID: {alert_info.get('id')}\n"
        f"Rule: {rule_name}\n"
        f"Description: {alert_info.get('description')}\n"
        f"Source IP: {alert_info.get('source_ip')}\n"
        f"Severity: {alert_info.get('severity')}\n"
        f"Timestamp: {alert_info.get('timestamp')}"
    )

    send_email_alert(subject, body, rule_name=rule_name)
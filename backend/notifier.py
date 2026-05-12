import os
import smtplib
from email.mime.text import MIMEText
import requests
from dotenv import load_dotenv
from logger import log_audit
import threading

load_dotenv()

ENABLE_EMAIL = os.getenv("ENABLE_EMAIL", "false").lower() == "true"
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ALERT_RECIPIENT_EMAIL = os.getenv("ALERT_RECIPIENT_EMAIL", "")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

class Notifier:
    def notify(self, alert_dict: dict):
        severity = alert_dict.get("severity")
        if severity == "HIGH":
            # Send Slack + Email without blocking API response
            threading.Thread(target=self._send_email, args=(alert_dict,)).start()
            threading.Thread(target=self._send_slack, args=(alert_dict,)).start()
        elif severity == "MEDIUM":
            # Just Email
            threading.Thread(target=self._send_email, args=(alert_dict,)).start()

    def notify_test(self):
        test_alert = {
            "attack_type": "TEST_NOTIFICATION",
            "ip_address": "8.8.8.8",
            "username": "tester",
            "severity": "HIGH",
            "timestamp": "Now",
            "action_taken": "TEST"
        }
        self.notify(test_alert)
        return {"status": "Test notification triggered in background."}

    def _send_email(self, alert_dict: dict):
        if not ENABLE_EMAIL or not SMTP_EMAIL or not SMTP_PASSWORD or not ALERT_RECIPIENT_EMAIL:
            return
            
        try:
            subject = f"[ANOMALYZE {alert_dict.get('severity', 'UNKNOWN')} ALERT] {alert_dict.get('attack_type', 'Threat')} from {alert_dict.get('ip_address', 'Unknown')}"
            body = (
                f"Attack Type: {alert_dict.get('attack_type')}\n"
                f"Source IP: {alert_dict.get('ip_address')}\n"
                f"Username: {alert_dict.get('username')}\n"
                f"Severity: {alert_dict.get('severity')}\n"
                f"Time: {alert_dict.get('timestamp')}\n"
                f"Action Built-in: {alert_dict.get('action_taken')}\n\n"
                f"Dashboard: {FRONTEND_URL}"
            )
            
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = SMTP_EMAIL
            msg['To'] = ALERT_RECIPIENT_EMAIL
            
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)
            log_audit("INFO", "Email sent successfully.")
        except Exception as e:
            log_audit("ERROR", f"Failed to send email: {e}")

    def _send_slack(self, alert_dict: dict):
        if not SLACK_WEBHOOK_URL:
            return
            
        color = "#e74c3c" if alert_dict.get("severity") == "HIGH" else "#f39c12"
        try:
            payload = {
                "attachments": [
                    {
                        "color": color,
                        "blocks": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain_text",
                                    "text": f"{alert_dict.get('severity', 'UNKNOWN')} Severity Threat Detected"
                                }
                            },
                            {
                                "type": "section",
                                "fields": [
                                    {"type": "mrkdwn", "text": f"*Attack Type:*\n{alert_dict.get('attack_type')}"},
                                    {"type": "mrkdwn", "text": f"*Source IP:*\n{alert_dict.get('ip_address')}"},
                                    {"type": "mrkdwn", "text": f"*Username:*\n{alert_dict.get('username')}"},
                                    {"type": "mrkdwn", "text": f"*Action taken:*\n{alert_dict.get('action_taken')}"}
                                ]
                            }
                        ]
                    }
                ]
            }
            requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
            log_audit("INFO", "Slack webhook fired.")
        except Exception as e:
            log_audit("ERROR", f"Failed to send slack message: {e}")

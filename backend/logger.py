import logging
import os

# Ensure logs dir exists
os.makedirs(os.path.join(os.path.dirname(__file__), "logs"), exist_ok=True)
AUDIT_LOG_FILE = os.path.join(os.path.dirname(__file__), "logs", "audit.log")

# Minimal logger setup
logging.basicConfig(
    filename=AUDIT_LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def log_audit(level: str, message: str):
    if level == "INFO":
        logging.info(message)
    elif level == "WARNING":
        logging.warning(message)
    elif level == "ERROR":
        logging.error(message)
    else:
        logging.debug(message)
    
    print(f"[{level}] {message}")

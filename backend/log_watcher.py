import os
import re
import time
import threading
from dotenv import load_dotenv
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from logger import log_audit
from datetime import datetime

load_dotenv()
LOG_FILE_PATH = os.getenv("LOG_FILE_PATH", "/var/log/auth.log")

class LogFileHandler(FileSystemEventHandler):
    def __init__(self, process_line_callback):
        self.filePath = LOG_FILE_PATH
        self.callback = process_line_callback
        self.last_pos = 0

        # Prime the seek position if file exists
        if os.path.exists(self.filePath):
            with open(self.filePath, 'r') as f:
                f.seek(0, 2) # EOF
                self.last_pos = f.tell()

    def on_modified(self, event):
        if hasattr(event, 'src_path') and os.path.abspath(event.src_path) == os.path.abspath(self.filePath):
            self._read_new_lines()

    def _read_new_lines(self):
        if not os.path.exists(self.filePath):
            return
            
        try:
            with open(self.filePath, 'r') as f:
                f.seek(self.last_pos)
                lines = f.readlines()
                self.last_pos = f.tell()
                for line in lines:
                    self.callback(line.strip())
        except Exception as e:
            log_audit("ERROR", f"Error reading log file: {e}")

class LogWatcher:
    def __init__(self, callback):
        self.observer = None
        self.callback = callback
        self.running = False

    def on_new_line(self, line: str):
        # We need to parse common formats
        # auth.log: "Failed password for root from 192.168.1.100 port 22 ssh2"
        # nginx: '127.0.0.1 - - [timestamp] "GET / HTTP/1.1" 200 45'
        
        entry_dict = {
            "ip_address": "0.0.0.0",
            "username": "unknown",
            "timestamp": datetime.utcnow().isoformat(),
            "login_attempts": 1,
            "request_count": 1,
            "success": True,
            "port": 0,
            "event_type": "unknown_log",
            "raw": line
        }

        # basic auth.log match
        if "sshd" in line or "ssh2" in line:
            entry_dict["event_type"] = "ssh_connection"
            ip_match = re.search(r'from\s+([0-9\.]+)\s+port\s+(\d+)', line)
            user_match = re.search(r'for\s+(invalid user\s+)?([^\s]+)\s+from', line)
            
            if ip_match:
                entry_dict["ip_address"] = ip_match.group(1)
                entry_dict["port"] = int(ip_match.group(2))
            if user_match:
                entry_dict["username"] = user_match.group(2)
                
            if "Failed password" in line or "invalid password" in line or "Connection closed by invalid user" in line:
                entry_dict["success"] = False
                entry_dict["event_type"] = "login"
            elif "Accepted password" in line or "Accepted publickey" in line:
                entry_dict["success"] = True
                entry_dict["event_type"] = "login"

        # basic nginx match
        elif "HTTP" in line and '"' in line:
            parts = line.split(" ")
            if len(parts) > 0 and "." in parts[0]:
                entry_dict["ip_address"] = parts[0]
                entry_dict["event_type"] = "http_request"
                entry_dict["port"] = 80
                
                # Check status code
                status_match = re.search(r'"\s+(\d{3})\s+', line)
                if status_match:
                    status = int(status_match.group(1))
                    if status >= 400:
                        entry_dict["success"] = False

        self.callback(entry_dict)

    def start(self):
        if not os.path.exists(LOG_FILE_PATH):
            log_audit("WARNING", f"Real log file not found at {LOG_FILE_PATH}. Using simulated data.")
            return False

        log_audit("INFO", f"Starting real LogWatcher on {LOG_FILE_PATH}")
        self.observer = Observer()
        event_handler = LogFileHandler(self.on_new_line)
        self.observer.schedule(event_handler, path=os.path.dirname(LOG_FILE_PATH), recursive=False)
        self.observer.start()
        self.running = True
        return True

    def stop(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
        self.running = False

import os
import platform
import subprocess
from dotenv import load_dotenv
from logger import log_audit

load_dotenv()

ENABLE_REAL_FIREWALL = os.getenv("ENABLE_REAL_FIREWALL", "false").lower() == "true"
WHITELIST_IPS = os.getenv("WHITELIST_IPS", "127.0.0.1,::1,192.168.1.1").split(",")

class ResponseEngine:
    def __init__(self):
        self.os_type = platform.system()

    def execute_response(self, alert_dict: dict) -> str:
        ip = alert_dict.get("ip_address")
        severity = alert_dict.get("severity")
        
        if not ip or severity != "HIGH":
            return "LOGGED"
            
        if ip in WHITELIST_IPS:
            log_audit("WARNING", f"Tried to block whitelisted IP {ip}. Aborted.")
            return "WHITELISTED"
            
        if not ENABLE_REAL_FIREWALL:
            log_audit("INFO", f"[SIMULATED] Would block IP {ip} using firewall.")
            return "SIMULATED_BLOCK"
            
        return self._block_ip(ip)
        
    def _block_ip(self, ip: str) -> str:
        try:
            if self.os_type == "Linux":
                subprocess.run(["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"], check=True)
            elif self.os_type == "Windows":
                subprocess.run(["netsh", "advfirewall", "firewall", "add", "rule",
                               "name=ANOMALYZE_BLOCK", "dir=in", "action=block", f"remoteip={ip}"], check=True)
            else:
                log_audit("ERROR", f"Unsupported OS for firewall block: {self.os_type}")
                return "ERROR"
                
            log_audit("WARNING", f"Successfully BLOCKED IP {ip} via firewall.")
            return "BLOCKED"
        except Exception as e:
            log_audit("ERROR", f"Failed to block IP {ip}: {str(e)}")
            return f"FAILED_BLOCK"

    def unblock_ip(self, ip: str) -> bool:
        if not ENABLE_REAL_FIREWALL:
            log_audit("INFO", f"[SIMULATED] Would UNBLOCK IP {ip} using firewall.")
            return True
        try:
            if self.os_type == "Linux":
                subprocess.run(["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"], check=True)
            elif self.os_type == "Windows":
                subprocess.run(["netsh", "advfirewall", "firewall", "delete", "rule",
                               "name=ANOMALYZE_BLOCK", f"remoteip={ip}"], check=True)
            else:
                return False
                
            log_audit("INFO", f"Successfully UNBLOCKED IP {ip} via firewall.")
            return True
        except Exception as e:
            log_audit("ERROR", f"Failed to unblock IP {ip}: {str(e)}")
            return False

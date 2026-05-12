class RuleEngine:
    def __init__(self):
        pass

    def evaluate(self, entry_dict: dict):
        """
        Evaluate single log entry dict against rules.
        Returns (is_threat: bool, threat_type: str, severity: str)
        """
        login_attempts = entry_dict.get('login_attempts', 0)
        request_count = entry_dict.get('request_count', 0)
        success = entry_dict.get('success', True)
        
        # Brute Force Rule
        if login_attempts > 10 and not success:
            if login_attempts > 50:
                return True, "brute_force", "HIGH"
            return True, "brute_force", "MEDIUM"
            
        # DoS Rule
        if request_count > 100:
            if request_count > 500:
                return True, "dos", "HIGH"
            return True, "dos", "MEDIUM"
            
        # Credential Stuffing Rule
        if login_attempts >= 5 and request_count > 10 and not success:
            return True, "credential_stuffing", "HIGH"
            
        return False, None, None

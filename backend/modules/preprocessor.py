from datetime import datetime

def preprocess_log(log_type: str, parsed_data: dict) -> list:
    """
    Extract 10 numerical features for the ML model.
    Consistent feature vector regardless of log type.
    """
    if not parsed_data:
        return [0.0] * 10

    features = []

    # Feature 1: HTTP status code (0 if not HTTP)
    try:
        status = float(parsed_data.get("status", 0) or 0)
    except (ValueError, TypeError):
        status = 0.0
    features.append(status)

    # Feature 2: Bytes transferred
    try:
        bytes_sent = float(parsed_data.get("bytes", 0) or 0)
    except (ValueError, TypeError):
        bytes_sent = 0.0
    features.append(min(bytes_sent, 100000))  # cap at 100KB

    # Feature 3: Request/message length
    req = str(parsed_data.get("request", parsed_data.get("message", "")) or "")
    features.append(float(min(len(req), 1000)))

    # Feature 4: Is failure event
    raw = str(parsed_data).lower()
    is_failure = 1.0 if any(w in raw for w in [
        "failed", "invalid", "error", "denied", "unauthorized", "forbidden"
    ]) else 0.0
    features.append(is_failure)

    # Feature 5: Is success event
    is_success = 1.0 if any(w in raw for w in [
        "accepted", "success", "granted", "200", "201"
    ]) else 0.0
    features.append(is_success)

    # Feature 6: Contains suspicious keywords
    is_suspicious = 1.0 if any(w in raw for w in [
        "passwd", "shadow", "admin", "root", "exec", "union", "select",
        "script", "cmd", "shell", "wget", "curl", "base64"
    ]) else 0.0
    features.append(is_suspicious)

    # Feature 7: Hour of day (0-23) — attacks spike at odd hours
    features.append(float(datetime.now().hour))

    # Feature 8: Status code category
    # 2xx=0, 3xx=1, 4xx=2, 5xx=3, other=4
    if 200 <= status < 300:
        status_cat = 0.0
    elif 300 <= status < 400:
        status_cat = 1.0
    elif 400 <= status < 500:
        status_cat = 2.0
    elif 500 <= status < 600:
        status_cat = 3.0
    else:
        status_cat = 4.0
    features.append(status_cat)

    # Feature 9: Is auth log type
    features.append(1.0 if log_type == "auth" else 0.0)

    # Feature 10: Is HTTP log type
    features.append(1.0 if log_type in ["nginx", "apache"] else 0.0)

    return features
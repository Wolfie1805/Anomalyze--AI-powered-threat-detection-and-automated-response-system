import requests
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_ip_geo(ip: str) -> dict:
    if not ip or ip in ["127.0.0.1", "localhost", "0.0.0.0"]:
        return {"country": "Local", "city": "Local", "lat": 0, "lon": 0}
        
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=2)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching GeoIP for {ip}: {e}")
    return {}

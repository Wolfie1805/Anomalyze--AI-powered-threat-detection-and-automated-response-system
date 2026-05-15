"""
backend/routers/data_mode.py

Admin-only endpoint to switch between SYNTHETIC and REAL data collection.
Mode is persisted in backend/data/data_mode.json so it survives restarts.

Endpoints:
  GET  /api/v1/data-mode        — get current mode + status of each collector
  POST /api/v1/data-mode/set    — switch mode (ADMIN only)
"""

import json
import os
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.utils.auth import get_current_active_user

router = APIRouter(prefix="/data-mode", tags=["data-mode"])

MODE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "data_mode.json")

# In-memory reference to the running collector task (set by main.py)
_collector_task: asyncio.Task = None


def _read_mode() -> str:
    if os.path.exists(MODE_FILE):
        try:
            with open(MODE_FILE) as f:
                return json.load(f).get("mode", "SYNTHETIC")
        except Exception:
            pass
    return "SYNTHETIC"


def _write_mode(mode: str):
    os.makedirs(os.path.dirname(MODE_FILE), exist_ok=True)
    with open(MODE_FILE, "w") as f:
        json.dump({"mode": mode}, f)


def get_current_mode() -> str:
    return _read_mode()


class SetModeRequest(BaseModel):
    mode: str  # "SYNTHETIC" or "REAL"


@router.get("")
def get_data_mode(current_user=Depends(get_current_active_user)):
    mode = _read_mode()
    return {
        "mode": mode,
        "description": (
            "Generating synthetic attack/normal traffic for demo"
            if mode == "SYNTHETIC"
            else "Reading live Windows Event Logs, Nginx/Apache logs, Firewall logs, and network packets"
        ),
        "collectors": {
            "windows_event_logs": "active" if mode == "REAL" else "off",
            "nginx_apache_logs":  "active" if mode == "REAL" else "off",
            "firewall_logs":      "active" if mode == "REAL" else "off",
            "packet_capture":     "active" if mode == "REAL" else "off",
            "synthetic_generator": "active" if mode == "SYNTHETIC" else "off",
        }
    }


@router.post("/set")
async def set_data_mode(
    body: SetModeRequest,
    current_user=Depends(get_current_active_user)
):
    global _collector_task

    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")

    mode = body.mode.upper()
    if mode not in ("SYNTHETIC", "REAL"):
        raise HTTPException(status_code=400, detail="mode must be SYNTHETIC or REAL")

    current = _read_mode()
    if current == mode:
        return {"message": f"Already in {mode} mode", "mode": mode}

    # Cancel the running collector
    if _collector_task and not _collector_task.done():
        _collector_task.cancel()
        try:
            await _collector_task
        except asyncio.CancelledError:
            pass
        _collector_task = None

    # Persist the new mode
    _write_mode(mode)

    # Start the new collector
    if mode == "SYNTHETIC":
        from backend.modules.log_collector import dev_mode_log_generator
        _collector_task = asyncio.create_task(dev_mode_log_generator())
        print("🔄 Switched to SYNTHETIC data mode")
    else:
        from backend.modules.real_collector import real_network_collector
        _collector_task = asyncio.create_task(real_network_collector())
        print("🔄 Switched to REAL network data mode")

    return {
        "message": f"Switched to {mode} mode",
        "mode": mode,
        "note": (
            "Synthetic log generator started"
            if mode == "SYNTHETIC"
            else "Real collectors started — Windows Event Logs, Nginx/Apache, Firewall, Packet Capture"
        )
    }


def set_collector_task(task: asyncio.Task):
    """Called by main.py to register the initial collector task."""
    global _collector_task
    _collector_task = task
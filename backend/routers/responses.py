from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import os
import subprocess

from backend.database import get_db
from backend.models.response_action import ResponseAction
from backend.utils.auth import get_current_active_user, get_current_admin_user
from backend.modules.response_engine import BLOCKED_IPS_FILE, block_ip

router = APIRouter(prefix="/responses", tags=["responses"])

@router.get("")
def get_responses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    query = db.query(ResponseAction)
    total = query.count()
    actions = query.order_by(ResponseAction.timestamp.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "actions": actions
    }

@router.post("/block-ip")
def api_block_ip(ip: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """Manually block an IP (Admin only)"""
    success, details = block_ip(ip)
    
    action = ResponseAction(
        alert_id=0, # manual
        action_type="block_ip",
        target_ip=ip,
        status="success" if success else "failed",
        details=details
    )
    db.add(action)
    db.commit()
    
    if not success:
        raise HTTPException(status_code=500, detail=details)
    return {"message": "IP Blocked", "ip": ip, "details": details}

@router.post("/unblock-ip")
def api_unblock_ip(ip: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """Manually unblock an IP (Admin only)"""
    try:
        subprocess.run(["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"], check=True, capture_output=True)
        details = "Unblocked via iptables"
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            rule_name = f"Block_{ip}"
            subprocess.run(["netsh", "advfirewall", "firewall", "delete", "rule", f"name={rule_name}"], check=True, capture_output=True)
            details = "Unblocked via netsh"
        except (subprocess.CalledProcessError, FileNotFoundError):
            details = "Failed or fallback file used. Check manual blocklists."
            
    # Remove from file if exists
    if os.path.exists(BLOCKED_IPS_FILE):
        with open(BLOCKED_IPS_FILE, "r") as f:
            lines = f.readlines()
        with open(BLOCKED_IPS_FILE, "w") as f:
            for line in lines:
                if line.strip() != ip:
                    f.write(line)
                    
    action = ResponseAction(
        alert_id=0,
        action_type="unblock_ip",
        target_ip=ip,
        status="success",
        details=details
    )
    db.add(action)
    db.commit()
    
    return {"message": "IP Unblocked", "ip": ip, "details": details}

@router.get("/blocklist")
def get_blocklist(current_user = Depends(get_current_active_user)):
    ips = []
    if os.path.exists(BLOCKED_IPS_FILE):
        with open(BLOCKED_IPS_FILE, "r") as f:
            ips = [line.strip() for line in f.readlines() if line.strip()]
    return {"blocked_ips": ips}

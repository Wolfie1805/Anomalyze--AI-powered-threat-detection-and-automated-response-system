from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from backend.database import get_db
from backend.models.contact_request import ContactRequest
from datetime import datetime
import threading
from backend.modules.notifier import send_email_alert   # reuse your existing notifier

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


class ContactRequestCreate(BaseModel):
    name: str
    email: str
    organisation: str
    request_type: str
    message: str


@router.post("/submit")
def submit_contact(payload: ContactRequestCreate, db: Session = Depends(get_db)):
    # Validate
    if not all([payload.name, payload.email, payload.organisation,
                payload.request_type, payload.message]):
        raise HTTPException(status_code=422, detail="All fields are required")

    # Save to DB
    record = ContactRequest(
        name=payload.name,
        email=payload.email,
        organisation=payload.organisation,
        request_type=payload.request_type,
        message=payload.message,
        status="PENDING",
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Notify admin in background (non-blocking)
    def notify():
        try:
            subject = f"[Anomalyze] New Contact Request — {payload.request_type} from {payload.organisation}"
            body = (
                f"New contact request received:\n\n"
                f"Name:         {payload.name}\n"
                f"Email:        {payload.email}\n"
                f"Organisation: {payload.organisation}\n"
                f"Type:         {payload.request_type}\n\n"
                f"Message:\n{payload.message}\n\n"
                f"--- Anomalyze Contact System ---"
            )
            send_email_alert(subject, body)
        except Exception:
            pass   # notification failure must never block the API

    threading.Thread(target=notify, daemon=True).start()

    return {"success": True, "id": record.id, "message": "Request submitted successfully"}


@router.get("/requests")   # Admin-only route — add JWT dependency as needed
def get_contact_requests(db: Session = Depends(get_db)):
    return db.query(ContactRequest).order_by(ContactRequest.created_at.desc()).all()
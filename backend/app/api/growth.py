"""
Growth / traffic-testing endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from fastapi import Header
from sqlalchemy.orm import Session

from ..core.security import decode_token
from ..db import models
from ..db.schemas import GrowthEventRequest, MessageResponse, WaitlistRequest
from ..db.session import get_db
from ..services.growth import send_posthog_event

router = APIRouter(prefix="/growth", tags=["Growth"])


def _optional_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> Optional[models.User]:
    """Resolve authenticated user when Authorization header is present."""
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()


@router.post("/track", response_model=MessageResponse)
async def track_event(
    request: GrowthEventRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(_optional_user),
):
    """Track product and funnel events for hypothesis testing."""
    event = models.GrowthEvent(
        user_id=current_user.id if current_user else None,
        event_name=request.event_name,
        source=request.source,
        properties=request.properties or {},
    )
    db.add(event)
    db.commit()

    distinct_id = current_user.id if current_user else f"anon:{request.source}"
    await send_posthog_event(
        request.event_name,
        distinct_id=distinct_id,
        properties=request.properties or {},
    )
    return MessageResponse(message="Event tracked.")


@router.post("/waitlist", response_model=MessageResponse)
async def join_waitlist(
    request: WaitlistRequest,
    db: Session = Depends(get_db),
):
    """Capture pilot signup interest from landing page traffic."""
    existing = (
        db.query(models.WaitlistLead)
        .filter(models.WaitlistLead.email == request.email)
        .first()
    )
    if existing:
        return MessageResponse(message="Already on waitlist.")

    db.add(
        models.WaitlistLead(
            name=request.name,
            email=request.email,
            company=request.company,
            note=request.note,
            source=request.source,
            utm_source=request.utm_source,
            utm_medium=request.utm_medium,
            utm_campaign=request.utm_campaign,
        )
    )
    db.commit()

    await send_posthog_event(
        "waitlist_joined",
        distinct_id=str(request.email),
        properties={
            "company": request.company,
            "source": request.source,
            "utm_source": request.utm_source,
            "utm_medium": request.utm_medium,
            "utm_campaign": request.utm_campaign,
        },
    )
    return MessageResponse(message="You are on the pilot waitlist.")

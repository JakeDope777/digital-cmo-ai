"""
Growth / traffic-testing endpoints.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi import Header
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from ..core.security import decode_token
from ..db import models
from ..db.schemas import (
    GrowthEventRequest,
    GrowthFunnelStep,
    GrowthFunnelSummaryResponse,
    MessageResponse,
    TopEventRow,
    UtmBreakdownResponse,
    UtmRow,
    WaitlistRequest,
)
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


@router.get("/funnel-summary", response_model=GrowthFunnelSummaryResponse)
async def funnel_summary(days: int = 14, db: Session = Depends(get_db)):
    """Return MVP funnel conversion summary from tracked growth events."""
    now = datetime.now(timezone.utc)
    days = min(max(days, 1), 90)
    date_from = now - timedelta(days=days)

    def _count_event(event_name: str) -> int:
        return (
            db.query(func.count(models.GrowthEvent.id))
            .filter(
                and_(
                    models.GrowthEvent.event_name == event_name,
                    models.GrowthEvent.created_at >= date_from,
                )
            )
            .scalar()
            or 0
        )

    landing_views = _count_event("landing_view")
    signup_completed = _count_event("signup_completed")
    verification_completed = _count_event("verification_completed")

    first_value_action = (
        db.query(func.count(func.distinct(models.GrowthEvent.user_id)))
        .filter(
            and_(
                models.GrowthEvent.created_at >= date_from,
                models.GrowthEvent.user_id.isnot(None),
                models.GrowthEvent.event_name.in_(["analysis_run", "chat_message_sent"]),
            )
        )
        .scalar()
        or 0
    )

    returning_users = (
        db.query(func.count())
        .select_from(
            db.query(models.GrowthEvent.user_id)
            .filter(
                and_(
                    models.GrowthEvent.created_at >= date_from,
                    models.GrowthEvent.user_id.isnot(None),
                    or_(
                        models.GrowthEvent.event_name == "dashboard_viewed",
                        models.GrowthEvent.event_name == "login_completed",
                    ),
                )
            )
            .group_by(models.GrowthEvent.user_id)
            .having(func.count(models.GrowthEvent.id) >= 2)
            .subquery()
        )
        .scalar()
        or 0
    )

    def _pct(numerator: int, denominator: int) -> float:
        if denominator <= 0:
            return 0.0
        return round((numerator / denominator) * 100, 2)

    return GrowthFunnelSummaryResponse(
        date_from=date_from.isoformat(),
        date_to=now.isoformat(),
        steps=[
            GrowthFunnelStep(name="visitor", count=landing_views),
            GrowthFunnelStep(name="signup_completed", count=signup_completed),
            GrowthFunnelStep(name="verified", count=verification_completed),
            GrowthFunnelStep(name="first_value_action", count=first_value_action),
            GrowthFunnelStep(name="return_session", count=returning_users),
        ],
        conversion_signup_from_visitor=_pct(signup_completed, landing_views),
        conversion_verified_from_signup=_pct(verification_completed, signup_completed),
        conversion_first_value_from_verified=_pct(first_value_action, verification_completed),
        conversion_return_from_first_value=_pct(returning_users, first_value_action),
    )


@router.get("/utm-breakdown", response_model=UtmBreakdownResponse)
async def utm_breakdown(days: int = 14, db: Session = Depends(get_db)):
    """Return UTM source attribution for signups and first-value actions."""
    now = datetime.now(timezone.utc)
    days = min(max(days, 1), 90)
    date_from = now - timedelta(days=days)

    # Fetch relevant events in the window — pull in Python to avoid
    # JSON path syntax differences between SQLite (dev) and Postgres (prod).
    events = (
        db.query(models.GrowthEvent)
        .filter(
            and_(
                models.GrowthEvent.created_at >= date_from,
                models.GrowthEvent.event_name.in_(
                    [
                        "signup_completed",
                        "analysis_run",
                        "chat_message_sent",
                        "creative_generated",
                    ]
                ),
            )
        )
        .all()
    )

    # Aggregate by (utm_source, utm_medium, utm_campaign)
    agg: dict[tuple, dict] = {}
    for ev in events:
        props = ev.properties or {}
        key = (
            props.get("utm_source") or "(direct)",
            props.get("utm_medium") or "",
            props.get("utm_campaign") or "",
        )
        if key not in agg:
            agg[key] = {"signups": 0, "value_actions": 0}
        if ev.event_name == "signup_completed":
            agg[key]["signups"] += 1
        else:
            agg[key]["value_actions"] += 1

    rows = [
        UtmRow(
            utm_source=k[0],
            utm_medium=k[1] or None,
            utm_campaign=k[2] or None,
            signups=v["signups"],
            value_actions=v["value_actions"],
        )
        for k, v in sorted(agg.items(), key=lambda x: -x[1]["signups"])
    ]

    # Top product events by volume in the window
    top_raw = (
        db.query(models.GrowthEvent.event_name, func.count(models.GrowthEvent.id).label("cnt"))
        .filter(models.GrowthEvent.created_at >= date_from)
        .group_by(models.GrowthEvent.event_name)
        .order_by(func.count(models.GrowthEvent.id).desc())
        .limit(10)
        .all()
    )
    top_events = [TopEventRow(event_name=r[0], count=r[1]) for r in top_raw]

    return UtmBreakdownResponse(
        date_from=date_from.isoformat(),
        date_to=now.isoformat(),
        rows=rows,
        top_events=top_events,
    )

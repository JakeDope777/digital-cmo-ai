"""
Growth / traffic-testing endpoints.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from ..core.catalog import is_public_module, resolve_domain_id
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


def _resolved_domain_or_400(domain: Optional[str]) -> Optional[str]:
    if domain is None:
        return None
    resolved = resolve_domain_id(domain)
    if not resolved:
        raise HTTPException(status_code=400, detail="Unsupported domain")
    return resolved


def _module_or_400(module_id: Optional[str]) -> Optional[str]:
    if module_id is None:
        return None
    if not is_public_module(module_id):
        raise HTTPException(status_code=400, detail="Unsupported module_id")
    return module_id


def _apply_event_filters(query, date_from: datetime, domain: Optional[str], module_id: Optional[str]):
    filters = [models.GrowthEvent.created_at >= date_from]
    if domain:
        filters.append(models.GrowthEvent.domain == domain)
    if module_id:
        filters.append(models.GrowthEvent.module_id == module_id)
    return query.filter(and_(*filters))


@router.post("/track", response_model=MessageResponse)
async def track_event(
    request: GrowthEventRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(_optional_user),
):
    """Track product and funnel events for hypothesis testing."""
    event_properties = dict(request.properties or {})
    if request.domain and "domain" not in event_properties:
        event_properties["domain"] = request.domain
    if request.module_id and "module_id" not in event_properties:
        event_properties["module_id"] = request.module_id
    if request.anonymous_id and "anonymous_id" not in event_properties:
        event_properties["anonymous_id"] = request.anonymous_id

    event = models.GrowthEvent(
        user_id=current_user.id if current_user else None,
        event_name=request.event_name,
        source=request.source,
        domain=request.domain,
        module_id=request.module_id,
        anonymous_id=request.anonymous_id,
        properties=event_properties,
    )
    db.add(event)
    db.commit()

    distinct_id = current_user.id if current_user else (request.anonymous_id or f"anon:{request.source}")
    await send_posthog_event(
        request.event_name,
        distinct_id=distinct_id,
        properties=event_properties,
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
        existing.name = request.name
        existing.company = request.company
        existing.note = request.note
        existing.source = request.source
        existing.domain = request.domain
        existing.module_id = request.module_id
        existing.anonymous_id = request.anonymous_id
        existing.utm_source = request.utm_source
        existing.utm_medium = request.utm_medium
        existing.utm_campaign = request.utm_campaign
        db.commit()
        return MessageResponse(message="Already on waitlist.")

    db.add(
        models.WaitlistLead(
            name=request.name,
            email=request.email,
            company=request.company,
            note=request.note,
            source=request.source,
            domain=request.domain,
            module_id=request.module_id,
            anonymous_id=request.anonymous_id,
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
            "domain": request.domain,
            "module_id": request.module_id,
            "anonymous_id": request.anonymous_id,
            "utm_source": request.utm_source,
            "utm_medium": request.utm_medium,
            "utm_campaign": request.utm_campaign,
        },
    )
    return MessageResponse(message="You are on the pilot waitlist.")


@router.get("/funnel-summary", response_model=GrowthFunnelSummaryResponse)
async def funnel_summary(
    days: int = 14,
    domain: Optional[str] = None,
    module_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return MVP funnel conversion summary from tracked growth events."""
    now = datetime.now(timezone.utc)
    days = min(max(days, 1), 90)
    date_from = now - timedelta(days=days)
    resolved_domain = _resolved_domain_or_400(domain)
    resolved_module = _module_or_400(module_id)
    identity_key = func.coalesce(models.GrowthEvent.user_id, models.GrowthEvent.anonymous_id)

    def _count_distinct_event(event_name: str) -> int:
        return (
            _apply_event_filters(
                db.query(func.count(func.distinct(identity_key))),
                date_from,
                resolved_domain,
                resolved_module,
            )
            .filter(models.GrowthEvent.event_name == event_name)
            .scalar()
            or 0
        )

    landing_views = _count_distinct_event("landing_view")
    signup_completed = _count_distinct_event("signup_completed")
    verification_completed = _count_distinct_event("verification_completed")

    first_value_action = (
        _apply_event_filters(
            db.query(func.count(func.distinct(identity_key))),
            date_from,
            resolved_domain,
            resolved_module,
        )
        .filter(
            models.GrowthEvent.event_name.in_(
                ["analysis_run", "chat_message_sent", "creative_generated"]
            )
        )
        .scalar()
        or 0
    )

    returning_users = (
        db.query(func.count())
        .select_from(
            _apply_event_filters(
                db.query(identity_key.label("identity_key")),
                date_from,
                resolved_domain,
                resolved_module,
            )
            .filter(
                identity_key.isnot(None),
                or_(
                    models.GrowthEvent.event_name == "dashboard_viewed",
                    models.GrowthEvent.event_name == "login_completed",
                ),
            )
            .group_by(identity_key)
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
async def utm_breakdown(
    days: int = 14,
    domain: Optional[str] = None,
    module_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return UTM source attribution for signups and first-value actions."""
    now = datetime.now(timezone.utc)
    days = min(max(days, 1), 90)
    date_from = now - timedelta(days=days)
    resolved_domain = _resolved_domain_or_400(domain)
    resolved_module = _module_or_400(module_id)

    # Fetch relevant events in the window — pull in Python to avoid
    # JSON path syntax differences between SQLite (dev) and Postgres (prod).
    events = _apply_event_filters(
        db.query(models.GrowthEvent),
        date_from,
        resolved_domain,
        resolved_module,
    )
    events = events.filter(
        models.GrowthEvent.event_name.in_(
            [
                "signup_completed",
                "analysis_run",
                "chat_message_sent",
                "creative_generated",
            ]
        )
    ).all()

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
        _apply_event_filters(
            db.query(models.GrowthEvent.event_name, func.count(models.GrowthEvent.id).label("cnt")),
            date_from,
            resolved_domain,
            resolved_module,
        )
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

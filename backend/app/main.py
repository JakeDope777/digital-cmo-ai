"""
Digital CMO AI - Main FastAPI Application

Central entry point that registers all API routers, configures middleware,
and initialises the database and brain components.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import re
from typing import Optional
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from .core.catalog import PUBLIC_MODULES, list_public_domains
from .middleware.security_middleware import SecurityMiddleware
from .core.config import settings
from .db import models
from .db.session import SessionLocal, init_db
from .modules.integrations.service import IntegrationService
from .api import auth, chat, analysis, creative, crm, analytics, memory, billing, growth, integrations, restaurant

_integration_service = IntegrationService()


def _configured_cors_origins() -> list[str]:
    if settings.CORS_ORIGINS_CSV:
        return [origin.strip() for origin in settings.CORS_ORIGINS_CSV.split(",") if origin.strip()]
    return settings.CORS_ORIGINS


def _cors_origin_regex() -> Optional[str]:
    frontend_base_url = (settings.FRONTEND_BASE_URL or "").strip()
    if not frontend_base_url:
        return None

    parsed = urlparse(frontend_base_url)
    hostname = parsed.hostname or ""
    scheme = parsed.scheme or "https"

    if hostname.endswith(".vercel.app"):
        project_slug = hostname[: -len(".vercel.app")]
        if project_slug:
            return rf"^{re.escape(scheme)}://{re.escape(project_slug)}(?:-[A-Za-z0-9-]+)?\.vercel\.app$"
    return None


def _smtp_readiness() -> dict[str, object]:
    sender_email = settings.REPORTS_FROM_EMAIL or settings.SMTP_FROM_EMAIL or settings.SUPPORT_EMAIL
    return {
        "configured": bool(
            settings.SMTP_HOST
            and settings.SMTP_PORT
            and settings.SMTP_USERNAME
            and settings.SMTP_PASSWORD
            and sender_email
        ),
        "host_configured": bool(settings.SMTP_HOST),
        "port": settings.SMTP_PORT,
        "username_configured": bool(settings.SMTP_USERNAME),
        "sender_email": sender_email,
        "support_email": settings.SUPPORT_EMAIL,
    }


def _stripe_readiness() -> dict[str, object]:
    prices_configured = bool(
        settings.STRIPE_PRICE_PRO_MONTHLY and settings.STRIPE_PRICE_ENTERPRISE_MONTHLY
    )
    ready = bool(
        settings.STRIPE_SECRET_KEY and settings.STRIPE_WEBHOOK_SECRET and prices_configured
    )
    return {
        "ready": ready,
        "stripe_secret_configured": bool(settings.STRIPE_SECRET_KEY),
        "stripe_webhook_secret_configured": bool(settings.STRIPE_WEBHOOK_SECRET),
        "stripe_prices_configured": prices_configured,
    }


def _growth_readiness() -> dict[str, object]:
    try:
        with SessionLocal() as db:
            now = datetime.now(timezone.utc)
            recent_window = now - timedelta(hours=24)
            recent_events = (
                db.query(func.count(models.GrowthEvent.id))
                .filter(models.GrowthEvent.created_at >= recent_window)
                .scalar()
                or 0
            )
            last_event_at = (
                db.query(models.GrowthEvent.created_at)
                .order_by(models.GrowthEvent.created_at.desc())
                .limit(1)
                .scalar()
            )
            waitlist_count = db.query(func.count(models.WaitlistLead.id)).scalar() or 0
        return {
            "status": "ok",
            "posthog_configured": bool(settings.POSTHOG_API_KEY and settings.POSTHOG_HOST),
            "recent_events_24h": recent_events,
            "last_event_at": last_event_at.isoformat() if last_event_at else None,
            "waitlist_leads_total": waitlist_count,
        }
    except SQLAlchemyError:
        return {
            "status": "unavailable",
            "posthog_configured": bool(settings.POSTHOG_API_KEY and settings.POSTHOG_HOST),
            "recent_events_24h": 0,
            "last_event_at": None,
            "waitlist_leads_total": 0,
        }


def _public_launch_status(
    *,
    pilot_connectors: dict[str, object],
    smtp: dict[str, object],
    stripe: dict[str, object],
    growth: dict[str, object],
) -> dict[str, str]:
    connector_rows = [
        row for row in pilot_connectors.get("connectors", []) if isinstance(row, dict)
    ]
    total = int(pilot_connectors.get("total", 0) or 0)
    live_ready = int(pilot_connectors.get("live_ready", 0) or 0)
    has_workspace_rollout = any(bool(row.get("workspace_level")) for row in connector_rows)

    if total > 0 and live_ready == total:
        pilot_state = "live"
        headline = "Managed live pilot connectors are ready"
        summary = (
            "HubSpot, GA4, and Stripe are available through managed workspace "
            "connections, with demo fallback still available across the wider catalog."
        )
        cta_label = "Open live workspace"
    elif has_workspace_rollout:
        pilot_state = "setup_in_progress"
        headline = "Managed live pilot connectors are rolling out"
        summary = (
            "HubSpot, GA4, and Stripe are being enabled through managed workspace "
            "setup. Demo fallback is available immediately while the live pilot "
            "finishes configuration."
        )
        cta_label = "Start with demo mode"
    else:
        pilot_state = "demo_only"
        headline = "Demo workspace is ready now"
        summary = (
            "Explore the full product loop with demo data while managed live "
            "connectors are configured for the pilot."
        )
        cta_label = "Open demo workspace"

    billing_state = "ready" if bool(stripe.get("ready")) else "setup_in_progress"
    email_state = "ready" if bool(smtp.get("configured")) else "setup_in_progress"
    analytics_state = (
        "observable" if growth.get("status") == "ok" else "setup_in_progress"
    )

    if pilot_state == "live" and (
        billing_state == "setup_in_progress" or email_state == "setup_in_progress"
    ):
        headline = "Live pilot workspace is available"
        summary = (
            "Managed live pilot connectors are active now. Billing or email setup is "
            "still being finalised for the wider launch workflow."
        )

    return {
        "pilot_state": pilot_state,
        "billing_state": billing_state,
        "email_state": email_state,
        "analytics_state": analytics_state,
        "headline": headline,
        "summary": summary,
        "cta_label": cta_label,
    }


def _launch_readiness() -> dict[str, object]:
    pilot_connectors = _integration_service.get_pilot_readiness()
    smtp = _smtp_readiness()
    stripe = _stripe_readiness()
    growth = _growth_readiness()
    public_status = _public_launch_status(
        pilot_connectors=pilot_connectors,
        smtp=smtp,
        stripe=stripe,
        growth=growth,
    )
    checks = {
        "database_url_configured": bool(settings.DATABASE_URL),
        "jwt_secret_configured": settings.SECRET_KEY
        != "change-me-in-production-use-a-strong-random-key",
        "frontend_base_url_configured": bool(settings.FRONTEND_BASE_URL),
        "smtp_configured": bool(smtp["configured"]),
        "stripe_ready": bool(stripe["ready"]),
        "pilot_connectors_ready": pilot_connectors["live_ready"] == pilot_connectors["total"],
        "growth_pipeline_observable": growth["status"] == "ok",
    }
    ready = all(
        [
            checks["database_url_configured"],
            checks["jwt_secret_configured"],
            checks["frontend_base_url_configured"],
        ]
    )
    status = "ready" if ready else "degraded"
    if not checks["growth_pipeline_observable"]:
        status = "degraded"
    return {
        "status": status,
        "ready": ready,
        "frontend_base_url": settings.FRONTEND_BASE_URL,
        "checks": checks,
        "smtp": smtp,
        "stripe": stripe,
        "pilot_connectors": pilot_connectors,
        "growth": growth,
        "public_status": public_status,
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initialise resources on startup."""
    # Initialise database tables
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI operating system for growth teams across ecommerce, SaaS, fintech, "
        "iGaming, healthtech, proptech, edtech, and agency workflows."
    ),
    lifespan=lifespan,
)

# Security middleware (headers, request ID, slow request logging)
# Must be added BEFORE CORSMiddleware so security headers are always present
app.add_middleware(SecurityMiddleware)

# CORS middleware
# NOTE: In production, CORS_ORIGINS_CSV must be set to explicit allowed origins.
# Wildcard (*) is blocked when allow_credentials=True by browsers anyway, but
# explicit origins are always safer.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_configured_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(analysis.router)
app.include_router(creative.router)
app.include_router(crm.router)
app.include_router(analytics.router)
app.include_router(memory.router)
app.include_router(billing.router)
app.include_router(growth.router)
app.include_router(integrations.router)
app.include_router(restaurant.router, include_in_schema=False)


@app.get("/api/health", tags=["Health"])
async def api_health():
    """API health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "modules": PUBLIC_MODULES,
        "domains": list_public_domains(),
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
        "legacy_scope_quarantined": True,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check with dependency status."""
    import time

    redis_status = await _check_redis()
    db_status = await _check_db()

    all_ok = all(s.get("status") == "ok" for s in [redis_status, db_status])
    overall = "healthy" if all_ok else "degraded"

    payload = {
        "status": overall,
        "uptime_seconds": round(time.time() - _START_TIME, 2),
        "checks": {
            "redis": redis_status,
            "database": db_status,
        },
        "llm_configured": bool(settings.OPENAI_API_KEY),
        "memory_path": settings.MEMORY_BASE_PATH,
        "frontend_base_url": settings.FRONTEND_BASE_URL,
        "email_verification_required": settings.REQUIRE_EMAIL_VERIFICATION,
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
    }

    from fastapi.responses import JSONResponse
    status_code = 200 if all_ok else 503
    return JSONResponse(content=payload, status_code=status_code)


_START_TIME = __import__("time").time()


async def _check_redis() -> dict:
    """Async Redis connectivity check."""
    redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379")
    try:
        import redis.asyncio as aioredis
        client = aioredis.Redis.from_url(redis_url, decode_responses=True, socket_connect_timeout=2)
        await client.ping()
        await client.aclose()
        return {"status": "ok"}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)[:120]}


async def _check_db() -> dict:
    """Sync DB connectivity check wrapped for async use."""
    try:
        from sqlalchemy import text as sa_text
        db = SessionLocal()
        try:
            db.execute(sa_text("SELECT 1"))
            return {"status": "ok"}
        finally:
            db.close()
    except Exception as exc:
        return {"status": "error", "detail": str(exc)[:120]}


@app.get("/metrics", tags=["Health"])
async def metrics_endpoint():
    """Prometheus-compatible metrics endpoint."""
    from fastapi.responses import Response
    import time

    lines = [
        "# HELP request_count_total Total number of requests",
        "# TYPE request_count_total counter",
        "request_count_total 0",
        "# HELP request_errors_total Total number of request errors",
        "# TYPE request_errors_total counter",
        "request_errors_total 0",
        "# HELP cache_hits_total Total cache hits",
        "# TYPE cache_hits_total counter",
        "cache_hits_total 0",
        "# HELP cache_misses_total Total cache misses",
        "# TYPE cache_misses_total counter",
        "cache_misses_total 0",
        f"# HELP process_uptime_seconds Uptime in seconds",
        "# TYPE process_uptime_seconds gauge",
        f"process_uptime_seconds {round(time.time() - _START_TIME, 2)}",
    ]
    return Response(
        content="\n".join(lines) + "\n",
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """Readiness probe for container/platform checks."""
    return {
        "status": "ready",
        "database_url_configured": bool(settings.DATABASE_URL),
        "jwt_secret_configured": settings.SECRET_KEY != "change-me-in-production-use-a-strong-random-key",
        "frontend_base_url": settings.FRONTEND_BASE_URL,
        "email_verification_required": settings.REQUIRE_EMAIL_VERIFICATION,
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
    }


@app.get("/health/launch-readiness", tags=["Health"])
async def launch_readiness():
    """Launch-day readiness summary for ops and smoke checks."""
    return _launch_readiness()


@app.get("/", tags=["Health"])
async def root(request: Request):
    """Root endpoint.

    Returns JSON for API clients by default and redirects browser HTML
    requests to the canonical frontend host.
    """
    accept = request.headers.get("accept", "")
    wants_html = "text/html" in accept and "application/json" not in accept
    if wants_html:
        return RedirectResponse(settings.FRONTEND_BASE_URL.rstrip("/") or "/", status_code=307)
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "modules": PUBLIC_MODULES,
        "domains": list_public_domains(),
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
    }

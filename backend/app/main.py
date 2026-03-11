"""
Digital CMO AI - Main FastAPI Application

Central entry point that registers all API routers, configures middleware,
and initialises the database and brain components.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from .core.catalog import PUBLIC_MODULES, list_public_domains
from .core.config import settings
from .db import models
from .db.session import SessionLocal, init_db
from .modules.integrations.service import IntegrationService
from .api import auth, chat, analysis, creative, crm, analytics, memory, billing, growth, integrations, restaurant

_integration_service = IntegrationService()


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


def _launch_readiness() -> dict[str, object]:
    pilot_connectors = _integration_service.get_pilot_readiness()
    smtp = _smtp_readiness()
    stripe = _stripe_readiness()
    growth = _growth_readiness()
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        [origin.strip() for origin in settings.CORS_ORIGINS_CSV.split(",") if origin.strip()]
        if settings.CORS_ORIGINS_CSV
        else settings.CORS_ORIGINS
    ),
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
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "llm_configured": bool(settings.OPENAI_API_KEY),
        "memory_path": settings.MEMORY_BASE_PATH,
        "frontend_base_url": settings.FRONTEND_BASE_URL,
        "email_verification_required": settings.REQUIRE_EMAIL_VERIFICATION,
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
    }


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

    Returns JSON for API clients by default and serves SPA only when
    the client explicitly asks for HTML.
    """
    static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
    index_path = os.path.join(static_dir, "index.html")
    accept = request.headers.get("accept", "")
    wants_html = "text/html" in accept and "application/json" not in accept
    if os.path.exists(index_path) and wants_html:
        return FileResponse(index_path)
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "modules": PUBLIC_MODULES,
        "domains": list_public_domains(),
        "pilot_connectors": _integration_service.get_pilot_readiness(),
        "launch_readiness": _launch_readiness(),
    }


# Mount static files for the built frontend (after API routes)
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="static-assets")

    # SPA catch-all: serve index.html for any unmatched route
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the SPA for any route not matched by API endpoints."""
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))

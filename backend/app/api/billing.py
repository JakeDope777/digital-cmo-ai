"""
Billing API endpoints (Stripe production-ready).

Route map
---------
POST /billing/checkout                  → create Stripe checkout session (canonical)
POST /billing/portal                    → create Stripe billing portal session (canonical)
POST /billing/webhook                   → receive & verify Stripe webhooks (canonical)
POST /billing/create-checkout-session   → legacy alias (kept for backwards compat)
POST /billing/portal-session            → legacy alias (kept for backwards compat)
GET  /billing/subscription              → current subscription status
GET  /billing/invoices                  → invoice history
GET  /billing/health                    → readiness check
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Body, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.dependencies import require_verified_user
from ..db import models
from ..db.schemas import (
    BillingInvoiceItem,
    BillingInvoicesResponse,
    BillingSessionResponse,
    BillingSubscriptionResponse,
    CheckoutSessionRequest,
)
from ..db.session import get_db
from ..services.stripe_service import stripe_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["Billing"])


# ---------------------------------------------------------------------------
# Request / Response models for canonical routes
# ---------------------------------------------------------------------------


class CheckoutRequest(BaseModel):
    plan: str = "pro"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class PortalRequest(BaseModel):
    return_url: Optional[str] = None


# ---------------------------------------------------------------------------
# ── Canonical routes (used by new frontend code) ──────────────────────────
# ---------------------------------------------------------------------------


@router.post("/checkout", response_model=BillingSessionResponse)
async def checkout(
    body: CheckoutRequest,
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe checkout session; return ``{url}``."""
    success_url = body.success_url or (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?checkout=success"
    )
    cancel_url = body.cancel_url or (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?checkout=cancel"
    )
    price_id = _resolve_price_id(body.plan)

    # Demo mode — Stripe not configured
    if not stripe_service.is_configured or not price_id:
        logger.warning("Stripe not configured — returning demo checkout URL")
        return BillingSessionResponse(
            checkout_url=f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?demo_checkout=1",
            session_id="demo_session",
            status="demo",
            demo=True,
        )

    try:
        customer_id = await _ensure_stripe_customer(current_user, db)
        url = stripe_service.create_checkout_session(
            user_id=current_user.id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_id=customer_id,
            email=current_user.email,
            name=current_user.full_name,
        )
        return BillingSessionResponse(checkout_url=url, status="ok", demo=False)
    except Exception as exc:
        logger.error("checkout error for user %s: %s", current_user.id, exc)
        raise HTTPException(status_code=502, detail=f"Stripe error: {exc}") from exc


@router.post("/portal", response_model=BillingSessionResponse)
async def portal(
    body: PortalRequest = Body(default=PortalRequest()),
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe Billing Portal session; return ``{url}``."""
    return_url = body.return_url or (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing"
    )

    if not stripe_service.is_configured:
        return BillingSessionResponse(
            portal_url=f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?demo_portal=1",
            status="demo",
            demo=True,
        )

    try:
        customer_id = await _ensure_stripe_customer(current_user, db)
        url = stripe_service.create_portal_session(
            customer_id=customer_id,
            return_url=return_url,
        )
        return BillingSessionResponse(portal_url=url, status="ok", demo=False)
    except Exception as exc:
        logger.error("portal error for user %s: %s", current_user.id, exc)
        raise HTTPException(status_code=502, detail=f"Stripe error: {exc}") from exc


@router.post("/webhook")
async def stripe_webhook_canonical(
    request: Request,
    stripe_signature: Optional[str] = Header(default=None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    """Canonical Stripe webhook endpoint.

    Verifies the Stripe-Signature header using ``stripe_service.construct_event``
    (which uses the official Stripe SDK), then dispatches to the shared
    ``_handle_webhook_event`` helper.
    """
    payload = await request.body()

    # --- Signature verification ---
    if settings.STRIPE_WEBHOOK_SECRET:
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")
        try:
            event = stripe_service.construct_event(payload, stripe_signature)
            event_dict = dict(event)
        except Exception as exc:
            logger.warning("Webhook signature verification failed: %s", exc)
            raise HTTPException(status_code=400, detail="Invalid Stripe signature") from exc
    else:
        # No secret configured — accept in dev/demo mode
        try:
            event_dict = json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON") from exc

    return await _handle_webhook_event(payload, event_dict, db)


# ---------------------------------------------------------------------------
# ── Legacy routes (backwards compatibility) ───────────────────────────────
# ---------------------------------------------------------------------------


@router.post("/create-checkout-session", response_model=BillingSessionResponse)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe checkout session for test-mode subscriptions."""
    success_url = request.success_url or f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?checkout=success"
    cancel_url = request.cancel_url or f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?checkout=cancel"

    price_id = _resolve_price_id(request.plan)
    if not settings.STRIPE_SECRET_KEY or not price_id:
        return BillingSessionResponse(
            checkout_url=f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?demo_checkout=1",
            session_id="demo_session",
            status="demo",
            demo=True,
        )

    customer_id = await _ensure_customer(current_user, db)
    payload = {
        "mode": "subscription",
        "customer": customer_id,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        "allow_promotion_codes": "true",
    }
    stripe_data = await _stripe_form_post("/v1/checkout/sessions", payload)
    return BillingSessionResponse(
        checkout_url=stripe_data.get("url"),
        session_id=stripe_data.get("id"),
        status="ok",
        demo=False,
    )


@router.post("/portal-session", response_model=BillingSessionResponse)
async def create_portal_session(
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe billing portal session."""
    if not settings.STRIPE_SECRET_KEY:
        return BillingSessionResponse(
            portal_url=f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing?demo_portal=1",
            status="demo",
            demo=True,
        )

    customer_id = await _ensure_customer(current_user, db)
    payload = {
        "customer": customer_id,
        "return_url": f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing",
    }
    stripe_data = await _stripe_form_post("/v1/billing_portal/sessions", payload)
    return BillingSessionResponse(portal_url=stripe_data.get("url"), status="ok", demo=False)


# NOTE: The /webhook route is defined above as stripe_webhook_canonical.
# The legacy function below is intentionally removed to avoid duplicate route
# registration.  The canonical implementation delegates to _handle_webhook_event.


@router.get("/health")
async def billing_health():
    """Expose billing integration readiness for deployment smoke checks."""
    return {
        "stripe_secret_configured": bool(settings.STRIPE_SECRET_KEY),
        "stripe_webhook_secret_configured": bool(settings.STRIPE_WEBHOOK_SECRET),
        "stripe_prices_configured": bool(settings.STRIPE_PRICE_PRO_MONTHLY and settings.STRIPE_PRICE_ENTERPRISE_MONTHLY),
    }


@router.get("/subscription", response_model=BillingSubscriptionResponse)
async def get_subscription(
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    subscription = (
        db.query(models.BillingSubscription)
        .filter(models.BillingSubscription.user_id == current_user.id)
        .first()
    )
    token_account = (
        db.query(models.TokenAccount)
        .filter(models.TokenAccount.user_id == current_user.id)
        .first()
    )
    if not subscription:
        return BillingSubscriptionResponse(
            tier=token_account.tier if token_account else "free",
            status="inactive",
            demo=not bool(settings.STRIPE_SECRET_KEY),
        )
    return BillingSubscriptionResponse(
        tier=token_account.tier if token_account else "free",
        status=subscription.status,
        stripe_subscription_id=subscription.stripe_subscription_id,
        stripe_customer_id=subscription.stripe_customer_id,
        current_period_start=subscription.current_period_start.isoformat() if subscription.current_period_start else None,
        current_period_end=subscription.current_period_end.isoformat() if subscription.current_period_end else None,
        cancel_at_period_end=subscription.cancel_at_period_end,
        demo=not bool(settings.STRIPE_SECRET_KEY),
    )


@router.get("/invoices", response_model=BillingInvoicesResponse)
async def get_invoices(
    current_user: models.User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.BillingInvoice)
        .filter(models.BillingInvoice.user_id == current_user.id)
        .order_by(models.BillingInvoice.created_at.desc())
        .limit(50)
        .all()
    )
    invoices = [
        BillingInvoiceItem(
            id=row.stripe_invoice_id or row.id,
            amount_due=row.amount_due,
            amount_paid=row.amount_paid,
            currency=row.currency,
            status=row.status,
            hosted_invoice_url=row.hosted_invoice_url,
            invoice_pdf=row.invoice_pdf,
            period_start=row.period_start.isoformat() if row.period_start else None,
            period_end=row.period_end.isoformat() if row.period_end else None,
            created_at=row.created_at.isoformat() if row.created_at else None,
        )
        for row in rows
    ]
    return BillingInvoicesResponse(invoices=invoices, demo=not bool(settings.STRIPE_SECRET_KEY))


def _resolve_price_id(plan: str) -> Optional[str]:
    normalized = (plan or "").lower()
    if normalized == "pro":
        return settings.STRIPE_PRICE_PRO_MONTHLY
    if normalized == "enterprise":
        return settings.STRIPE_PRICE_ENTERPRISE_MONTHLY
    return settings.STRIPE_PRICE_PRO_MONTHLY


async def _ensure_customer(user: models.User, db: Session) -> str:
    """Legacy httpx-based customer ensure (used by legacy routes)."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    payload = {"email": user.email, "name": user.full_name or user.email}
    customer = await _stripe_form_post("/v1/customers", payload)
    customer_id = customer.get("id")
    user.stripe_customer_id = customer_id
    db.commit()
    return customer_id


async def _ensure_stripe_customer(user: models.User, db: Session) -> str:
    """Stripe SDK-based customer ensure (used by canonical routes).

    Creates a new Stripe customer via the SDK if the user doesn't have one,
    persists the ID, and returns it.
    """
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe_service.create_customer(
        user_id=user.id,
        email=user.email,
        name=user.full_name,
    )
    user.stripe_customer_id = customer.id
    db.commit()
    logger.info("Persisted stripe_customer_id %s for user %s", customer.id, user.id)
    return customer.id


async def _handle_webhook_event(payload: bytes, event: dict, db: Session) -> dict:
    """Shared webhook event dispatcher (used by both canonical and legacy routes).

    Implements idempotency via the StripeWebhookEvent table.
    Handles:
      - checkout.session.completed
      - customer.subscription.created / updated / deleted
      - invoice.paid / invoice.payment_failed / invoice.finalized
    """
    event_id = event.get("id") or f"evt_fallback_{hashlib.sha256(payload).hexdigest()[:24]}"
    event_type = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    # --- Idempotency check ---
    event_row = (
        db.query(models.StripeWebhookEvent)
        .filter(models.StripeWebhookEvent.stripe_event_id == event_id)
        .first()
    )
    if event_row and event_row.status in {"processed", "processing"}:
        logger.info("Duplicate webhook event %s (%s) — skipping", event_id, event_type)
        return {"received": True, "duplicate": True}

    if not event_row:
        event_row = models.StripeWebhookEvent(
            stripe_event_id=event_id,
            event_type=event_type or "unknown",
            payload_hash=hashlib.sha256(payload).hexdigest(),
            status="processing",
        )
        db.add(event_row)
    else:
        event_row.status = "processing"
    db.commit()

    try:
        if event_type == "checkout.session.completed":
            subscription_id = data_object.get("subscription")
            if subscription_id and settings.STRIPE_SECRET_KEY:
                subscription_data = await _stripe_get(f"/v1/subscriptions/{subscription_id}")
                if not subscription_data.get("customer") and data_object.get("customer"):
                    subscription_data["customer"] = data_object.get("customer")
                await _sync_subscription(subscription_data, db)
            else:
                await _sync_subscription(data_object, db)

        elif event_type in {
            "customer.subscription.updated",
            "customer.subscription.created",
            "customer.subscription.deleted",
        }:
            await _sync_subscription(data_object, db)

        elif event_type in {"invoice.paid", "invoice.payment_failed", "invoice.finalized"}:
            await _sync_invoice(data_object, db)

        else:
            logger.debug("Unhandled Stripe event type: %s", event_type)

        event_row.status = "processed"
        event_row.processed_at = datetime.now(timezone.utc)
        event_row.last_error = None
        db.commit()

    except Exception as exc:
        logger.error("Error processing webhook event %s: %s", event_id, exc, exc_info=True)
        event_row.status = "failed"
        event_row.last_error = str(exc)[:2000]
        db.commit()
        raise

    return {"received": True, "duplicate": False}


async def _stripe_form_post(path: str, data: dict) -> dict:
    if not settings.STRIPE_SECRET_KEY:
        return {"id": "demo", "url": f"{settings.FRONTEND_BASE_URL.rstrip('/')}/app/billing"}

    headers = {"Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}"}
    async with httpx.AsyncClient(base_url="https://api.stripe.com", timeout=25.0) as client:
        response = await client.post(path, data=data, headers=headers)
        response.raise_for_status()
        return response.json()


async def _stripe_get(path: str) -> dict:
    if not settings.STRIPE_SECRET_KEY:
        return {}

    headers = {"Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}"}
    async with httpx.AsyncClient(base_url="https://api.stripe.com", timeout=25.0) as client:
        response = await client.get(path, headers=headers)
        response.raise_for_status()
        return response.json()


def _verify_signature(payload: bytes, header: str, secret: str) -> bool:
    # Simplified Stripe signature validation for MVP.
    # Header shape: t=timestamp,v1=signature,...
    parts = {}
    for item in header.split(","):
        if "=" in item:
            key, value = item.split("=", 1)
            parts[key.strip()] = value.strip()
    timestamp = parts.get("t")
    signature = parts.get("v1")
    if not timestamp or not signature:
        return False
    try:
        age_seconds = int(time.time()) - int(timestamp)
    except ValueError:
        return False
    if age_seconds < 0 or age_seconds > 300:
        return False
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _sync_subscription(obj: dict, db: Session) -> None:
    customer_id = obj.get("customer")
    if not customer_id:
        return

    user = db.query(models.User).filter(models.User.stripe_customer_id == customer_id).first()
    if not user:
        return

    subscription = (
        db.query(models.BillingSubscription)
        .filter(models.BillingSubscription.user_id == user.id)
        .first()
    )
    if not subscription:
        subscription = models.BillingSubscription(user_id=user.id)
        db.add(subscription)

    period_start = obj.get("current_period_start")
    period_end = obj.get("current_period_end")
    subscription.stripe_customer_id = customer_id
    subscription.stripe_subscription_id = obj.get("subscription") or obj.get("id")
    subscription.stripe_price_id = (
        obj.get("items", {})
        .get("data", [{}])[0]
        .get("price", {})
        .get("id")
    )
    subscription.status = obj.get("status", "active")
    subscription.current_period_start = (
        datetime.fromtimestamp(period_start, tz=timezone.utc)
        if period_start else None
    )
    subscription.current_period_end = (
        datetime.fromtimestamp(period_end, tz=timezone.utc)
        if period_end else None
    )
    subscription.cancel_at_period_end = bool(obj.get("cancel_at_period_end", False))

    token_account = db.query(models.TokenAccount).filter(models.TokenAccount.user_id == user.id).first()
    if token_account:
        if subscription.status in {"active", "trialing"}:
            token_account.tier = "pro"
        else:
            token_account.tier = "free"
    db.commit()


async def _sync_invoice(obj: dict, db: Session) -> None:
    customer_id = obj.get("customer")
    if not customer_id:
        return
    user = db.query(models.User).filter(models.User.stripe_customer_id == customer_id).first()
    if not user:
        return

    stripe_invoice_id = obj.get("id")
    row = (
        db.query(models.BillingInvoice)
        .filter(models.BillingInvoice.stripe_invoice_id == stripe_invoice_id)
        .first()
    )
    if not row:
        row = models.BillingInvoice(user_id=user.id, stripe_invoice_id=stripe_invoice_id)
        db.add(row)

    row.amount_due = int(obj.get("amount_due") or 0)
    row.amount_paid = int(obj.get("amount_paid") or 0)
    row.currency = obj.get("currency", "usd")
    row.status = obj.get("status", "draft")
    row.hosted_invoice_url = obj.get("hosted_invoice_url")
    row.invoice_pdf = obj.get("invoice_pdf")
    period_start = obj.get("period_start")
    period_end = obj.get("period_end")
    row.period_start = datetime.fromtimestamp(period_start, tz=timezone.utc) if period_start else None
    row.period_end = datetime.fromtimestamp(period_end, tz=timezone.utc) if period_end else None
    db.commit()

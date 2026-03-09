"""Billing webhook tests for idempotency and signature checks."""

import json

from app.core.config import settings
from app.db import models


def test_billing_health_endpoint(client, auth_headers):
    response = client.get("/billing/health", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "stripe_secret_configured" in data
    assert "stripe_webhook_secret_configured" in data
    assert "stripe_prices_configured" in data


def test_webhook_rejects_invalid_signature(client):
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = "whsec_test"
    payload = b'{"id":"evt_invalid","type":"invoice.paid","data":{"object":{}}}'

    response = client.post(
        "/billing/webhook",
        data=payload,
        headers={"Stripe-Signature": "t=1700000000,v1=notavalidsignature"},
    )

    settings.STRIPE_WEBHOOK_SECRET = old_secret
    assert response.status_code == 400


def test_webhook_idempotency_and_subscription_sync(client, db_session):
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = None

    signup = client.post(
        "/auth/signup",
        json={"email": "billing-webhook-test@example.com", "password": "testpassword123"},
    )
    assert signup.status_code in (201, 409)

    user = db_session.query(models.User).filter(models.User.email == "billing-webhook-test@example.com").first()
    user.stripe_customer_id = "cus_test_idempotency"
    db_session.commit()

    event_payload = {
        "id": "evt_idempotency_001",
        "type": "customer.subscription.created",
        "data": {
            "object": {
                "id": "sub_test_001",
                "customer": "cus_test_idempotency",
                "status": "active",
                "current_period_start": 1700000000,
                "current_period_end": 1702592000,
                "cancel_at_period_end": False,
                "items": {"data": [{"price": {"id": "price_pro"}}]},
            }
        },
    }

    first = client.post("/billing/webhook", data=json.dumps(event_payload).encode("utf-8"))
    second = client.post("/billing/webhook", data=json.dumps(event_payload).encode("utf-8"))

    settings.STRIPE_WEBHOOK_SECRET = old_secret

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json().get("duplicate") is False
    assert second.json().get("duplicate") is True

    webhook_events = (
        db_session.query(models.StripeWebhookEvent)
        .filter(models.StripeWebhookEvent.stripe_event_id == "evt_idempotency_001")
        .all()
    )
    assert len(webhook_events) == 1
    assert webhook_events[0].status == "processed"

    subscription = (
        db_session.query(models.BillingSubscription)
        .filter(models.BillingSubscription.user_id == user.id)
        .first()
    )
    assert subscription is not None
    assert subscription.status == "active"


def test_webhook_subscription_canceled_downgrades_tier(client, db_session):
    """customer.subscription.deleted should reset tier to free."""
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = None

    signup = client.post(
        "/auth/signup",
        json={"email": "billing-cancel-test@example.com", "password": "testpassword123"},
    )
    assert signup.status_code in (201, 409)

    user = db_session.query(models.User).filter(models.User.email == "billing-cancel-test@example.com").first()
    user.stripe_customer_id = "cus_test_cancel"
    db_session.commit()

    # First create an active subscription
    create_payload = {
        "id": "evt_cancel_sub_create",
        "type": "customer.subscription.created",
        "data": {
            "object": {
                "id": "sub_cancel_test",
                "customer": "cus_test_cancel",
                "status": "active",
                "current_period_start": 1700000000,
                "current_period_end": 1702592000,
                "cancel_at_period_end": False,
                "items": {"data": [{"price": {"id": "price_pro"}}]},
            }
        },
    }
    client.post("/billing/webhook", data=json.dumps(create_payload).encode("utf-8"))

    db_session.expire_all()
    token_account = db_session.query(models.TokenAccount).filter(models.TokenAccount.user_id == user.id).first()
    assert token_account is None or token_account.tier == "pro"

    # Now cancel the subscription
    cancel_payload = {
        "id": "evt_cancel_sub_delete",
        "type": "customer.subscription.deleted",
        "data": {
            "object": {
                "id": "sub_cancel_test",
                "customer": "cus_test_cancel",
                "status": "canceled",
                "current_period_start": 1700000000,
                "current_period_end": 1702592000,
                "cancel_at_period_end": False,
                "items": {"data": [{"price": {"id": "price_pro"}}]},
            }
        },
    }
    resp = client.post("/billing/webhook", data=json.dumps(cancel_payload).encode("utf-8"))
    settings.STRIPE_WEBHOOK_SECRET = old_secret

    assert resp.status_code == 200

    db_session.expire_all()
    subscription = (
        db_session.query(models.BillingSubscription)
        .filter(models.BillingSubscription.user_id == user.id)
        .first()
    )
    assert subscription is not None
    assert subscription.status == "canceled"

    token_account = db_session.query(models.TokenAccount).filter(models.TokenAccount.user_id == user.id).first()
    if token_account:
        assert token_account.tier == "free"


def test_webhook_invoice_paid_creates_record(client, db_session):
    """invoice.paid should upsert a BillingInvoice record."""
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = None

    signup = client.post(
        "/auth/signup",
        json={"email": "billing-invoice-test@example.com", "password": "testpassword123"},
    )
    assert signup.status_code in (201, 409)

    user = db_session.query(models.User).filter(models.User.email == "billing-invoice-test@example.com").first()
    user.stripe_customer_id = "cus_test_invoice_paid"
    db_session.commit()

    event_payload = {
        "id": "evt_invoice_paid_001",
        "type": "invoice.paid",
        "data": {
            "object": {
                "id": "in_test_paid_001",
                "customer": "cus_test_invoice_paid",
                "amount_due": 4900,
                "amount_paid": 4900,
                "currency": "usd",
                "status": "paid",
                "hosted_invoice_url": "https://invoice.stripe.com/test",
                "period_start": 1700000000,
                "period_end": 1702592000,
            }
        },
    }

    resp = client.post("/billing/webhook", data=json.dumps(event_payload).encode("utf-8"))
    settings.STRIPE_WEBHOOK_SECRET = old_secret

    assert resp.status_code == 200
    assert resp.json().get("duplicate") is False

    db_session.expire_all()
    invoice = (
        db_session.query(models.BillingInvoice)
        .filter(models.BillingInvoice.stripe_invoice_id == "in_test_paid_001")
        .first()
    )
    assert invoice is not None
    assert invoice.status == "paid"
    assert invoice.amount_paid == 4900
    assert invoice.currency == "usd"


def test_webhook_invoice_payment_failed_recorded(client, db_session):
    """invoice.payment_failed should create a failed invoice record."""
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = None

    signup = client.post(
        "/auth/signup",
        json={"email": "billing-invoice-fail@example.com", "password": "testpassword123"},
    )
    assert signup.status_code in (201, 409)

    user = db_session.query(models.User).filter(models.User.email == "billing-invoice-fail@example.com").first()
    user.stripe_customer_id = "cus_test_invoice_fail"
    db_session.commit()

    event_payload = {
        "id": "evt_invoice_fail_001",
        "type": "invoice.payment_failed",
        "data": {
            "object": {
                "id": "in_test_fail_001",
                "customer": "cus_test_invoice_fail",
                "amount_due": 4900,
                "amount_paid": 0,
                "currency": "usd",
                "status": "open",
                "period_start": 1700000000,
                "period_end": 1702592000,
            }
        },
    }

    resp = client.post("/billing/webhook", data=json.dumps(event_payload).encode("utf-8"))
    settings.STRIPE_WEBHOOK_SECRET = old_secret

    assert resp.status_code == 200

    db_session.expire_all()
    invoice = (
        db_session.query(models.BillingInvoice)
        .filter(models.BillingInvoice.stripe_invoice_id == "in_test_fail_001")
        .first()
    )
    assert invoice is not None
    assert invoice.status == "open"
    assert invoice.amount_paid == 0


def test_webhook_retry_after_failure(client, db_session):
    """A failed webhook event (status=failed) should be re-processed on retry."""
    old_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = None

    signup = client.post(
        "/auth/signup",
        json={"email": "billing-retry-test@example.com", "password": "testpassword123"},
    )
    assert signup.status_code in (201, 409)

    user = db_session.query(models.User).filter(models.User.email == "billing-retry-test@example.com").first()
    user.stripe_customer_id = "cus_test_retry"
    db_session.commit()

    # Simulate a pre-existing failed event record
    failed_event = models.StripeWebhookEvent(
        stripe_event_id="evt_retry_001",
        event_type="customer.subscription.created",
        payload_hash="dummy",
        status="failed",
        last_error="simulated failure",
    )
    db_session.add(failed_event)
    db_session.commit()

    # Stripe retries the same event
    retry_payload = {
        "id": "evt_retry_001",
        "type": "customer.subscription.created",
        "data": {
            "object": {
                "id": "sub_retry_001",
                "customer": "cus_test_retry",
                "status": "active",
                "current_period_start": 1700000000,
                "current_period_end": 1702592000,
                "cancel_at_period_end": False,
                "items": {"data": [{"price": {"id": "price_pro"}}]},
            }
        },
    }

    resp = client.post("/billing/webhook", data=json.dumps(retry_payload).encode("utf-8"))
    settings.STRIPE_WEBHOOK_SECRET = old_secret

    assert resp.status_code == 200
    # Not a duplicate — it was failed, not processed
    assert resp.json().get("duplicate") is False

    db_session.expire_all()
    event_record = (
        db_session.query(models.StripeWebhookEvent)
        .filter(models.StripeWebhookEvent.stripe_event_id == "evt_retry_001")
        .first()
    )
    assert event_record is not None
    assert event_record.status == "processed"
    assert event_record.last_error is None


def test_checkout_session_demo_mode(client, auth_headers):
    """When no STRIPE_SECRET_KEY, checkout returns a demo redirect URL."""
    old_key = settings.STRIPE_SECRET_KEY
    settings.STRIPE_SECRET_KEY = None

    resp = client.post(
        "/billing/create-checkout-session",
        json={"plan": "pro"},
        headers=auth_headers,
    )

    settings.STRIPE_SECRET_KEY = old_key

    assert resp.status_code == 200
    data = resp.json()
    assert data.get("demo") is True
    assert data.get("session_id") == "demo_session"


def test_portal_session_demo_mode(client, auth_headers):
    """When no STRIPE_SECRET_KEY, portal session returns demo URL."""
    old_key = settings.STRIPE_SECRET_KEY
    settings.STRIPE_SECRET_KEY = None

    resp = client.post("/billing/portal-session", headers=auth_headers)

    settings.STRIPE_SECRET_KEY = old_key

    assert resp.status_code == 200
    data = resp.json()
    assert data.get("demo") is True

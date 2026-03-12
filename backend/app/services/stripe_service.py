"""
StripeService — production-ready Stripe SDK wrapper for Digital CMO AI.

Wraps customer, checkout session, billing portal, subscription, and
cancellation operations.  All network calls are guarded with try/except
and errors are logged via the standard logging module so they surface in
structured logs without crashing callers.

Usage
-----
    from app.services.stripe_service import stripe_service

    url = await stripe_service.create_checkout_session(
        user_id=user.id,
        price_id=settings.STRIPE_PRICE_PRO_MONTHLY,
        success_url="https://app.example.com/billing?success=1",
        cancel_url="https://app.example.com/billing?cancel=1",
        customer_id=user.stripe_customer_id,   # optional
        email=user.email,
        name=user.full_name,
    )
"""

from __future__ import annotations

import logging
from typing import Optional

import stripe
# stripe >= 5.0 moved errors to stripe.StripeError (top-level)
try:
    from stripe.error import StripeError  # stripe < 5
except ImportError:
    StripeError = stripe.StripeError  # stripe >= 5

from ..core.config import settings

logger = logging.getLogger(__name__)


def _init_stripe() -> None:
    """Configure the stripe library from settings.  Called lazily."""
    if settings.STRIPE_SECRET_KEY:
        stripe.api_key = settings.STRIPE_SECRET_KEY
    else:
        logger.warning(
            "STRIPE_SECRET_KEY is not set — Stripe calls will fail or return demo data."
        )


class StripeService:
    """High-level Stripe integration service.

    All methods raise ``RuntimeError`` when Stripe is not configured and
    the caller must handle demo-mode fallback themselves (or use the
    ``is_configured`` property).
    """

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def __init__(self) -> None:
        _init_stripe()

    @property
    def is_configured(self) -> bool:
        return bool(settings.STRIPE_SECRET_KEY)

    # ------------------------------------------------------------------
    # Customers
    # ------------------------------------------------------------------

    def create_customer(
        self,
        user_id: str,
        email: str,
        name: Optional[str] = None,
    ) -> stripe.Customer:
        """Create (and return) a Stripe Customer for *user_id*.

        Raises ``StripeError`` on API failure.
        """
        if not self.is_configured:
            raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY missing).")

        try:
            customer = stripe.Customer.create(
                email=email,
                name=name or email,
                metadata={"user_id": user_id},
            )
            logger.info("Created Stripe customer %s for user %s", customer.id, user_id)
            return customer
        except StripeError as exc:
            logger.error(
                "Failed to create Stripe customer for user %s: %s", user_id, exc
            )
            raise

    def get_or_create_customer(
        self,
        user_id: str,
        email: str,
        name: Optional[str] = None,
        existing_customer_id: Optional[str] = None,
    ) -> stripe.Customer:
        """Return the existing Stripe customer or create one.

        If *existing_customer_id* is provided and valid it is returned
        directly (saves an API call); otherwise a new customer is created.
        """
        if not self.is_configured:
            raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY missing).")

        if existing_customer_id:
            try:
                customer = stripe.Customer.retrieve(existing_customer_id)
                if not getattr(customer, "deleted", False):
                    return customer
                logger.warning(
                    "Stripe customer %s is deleted; creating a new one.", existing_customer_id
                )
            except StripeError as exc:
                logger.warning(
                    "Could not retrieve Stripe customer %s (%s); creating a new one.",
                    existing_customer_id,
                    exc,
                )

        return self.create_customer(user_id=user_id, email=email, name=name)

    # ------------------------------------------------------------------
    # Checkout Sessions
    # ------------------------------------------------------------------

    def create_checkout_session(
        self,
        user_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        customer_id: Optional[str] = None,
        email: Optional[str] = None,
        name: Optional[str] = None,
        allow_promotion_codes: bool = True,
    ) -> str:
        """Create a hosted Stripe checkout session.

        Returns the session URL the user should be redirected to.
        Raises ``StripeError`` on failure.
        """
        if not self.is_configured:
            raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY missing).")

        params: dict = {
            "mode": "subscription",
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "allow_promotion_codes": allow_promotion_codes,
            "metadata": {"user_id": user_id},
        }

        if customer_id:
            params["customer"] = customer_id
        elif email:
            params["customer_email"] = email

        try:
            session = stripe.checkout.Session.create(**params)
            logger.info(
                "Created checkout session %s for user %s (price=%s)",
                session.id,
                user_id,
                price_id,
            )
            url: str = session.url  # type: ignore[assignment]
            return url
        except StripeError as exc:
            logger.error(
                "Failed to create checkout session for user %s: %s", user_id, exc
            )
            raise

    # ------------------------------------------------------------------
    # Customer Portal Sessions
    # ------------------------------------------------------------------

    def create_portal_session(
        self,
        customer_id: str,
        return_url: str,
    ) -> str:
        """Create a Stripe Billing Portal session.

        Returns the portal URL the user should be redirected to.
        Raises ``StripeError`` on failure.
        """
        if not self.is_configured:
            raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY missing).")

        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            logger.info("Created portal session for customer %s", customer_id)
            url: str = session.url  # type: ignore[assignment]
            return url
        except StripeError as exc:
            logger.error(
                "Failed to create portal session for customer %s: %s", customer_id, exc
            )
            raise

    # ------------------------------------------------------------------
    # Subscriptions
    # ------------------------------------------------------------------

    def cancel_subscription(
        self,
        subscription_id: str,
        at_period_end: bool = True,
    ) -> stripe.Subscription:
        """Cancel a subscription.

        By default the subscription is cancelled at the end of the current
        billing period (``at_period_end=True``).  Pass ``False`` to cancel
        immediately.

        Returns the updated Subscription object.
        Raises ``StripeError`` on failure.
        """
        if not self.is_configured:
            raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY missing).")

        try:
            if at_period_end:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True,
                )
                logger.info(
                    "Scheduled cancellation of subscription %s at period end",
                    subscription_id,
                )
            else:
                subscription = stripe.Subscription.cancel(subscription_id)
                logger.info("Cancelled subscription %s immediately", subscription_id)

            return subscription
        except StripeError as exc:
            logger.error(
                "Failed to cancel subscription %s: %s", subscription_id, exc
            )
            raise

    def get_subscription_status(self, customer_id: str) -> dict:
        """Return a summary dict of the customer's active subscription(s).

        Returns::

            {
                "has_active_subscription": bool,
                "subscription_id": str | None,
                "status": str | None,           # e.g. "active", "trialing"
                "price_id": str | None,
                "current_period_end": int | None,  # Unix timestamp
                "cancel_at_period_end": bool,
                "plan": str,                    # "free" | "pro" | "enterprise"
            }

        Never raises; returns a safe default dict on error.
        """
        if not self.is_configured:
            return _empty_subscription_status()

        try:
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status="all",
                limit=5,
                expand=["data.items.data.price"],
            )
            active = [
                s for s in subscriptions.auto_paging_iter()
                if s.status in {"active", "trialing"}
            ]
            if not active:
                return _empty_subscription_status()

            sub = active[0]
            price_id: Optional[str] = None
            try:
                price_id = sub["items"]["data"][0]["price"]["id"]
            except (KeyError, IndexError):
                pass

            plan = _plan_from_price_id(price_id)
            return {
                "has_active_subscription": True,
                "subscription_id": sub.id,
                "status": sub.status,
                "price_id": price_id,
                "current_period_end": sub.current_period_end,
                "cancel_at_period_end": bool(sub.cancel_at_period_end),
                "plan": plan,
            }
        except StripeError as exc:
            logger.error(
                "Failed to get subscription status for customer %s: %s", customer_id, exc
            )
            return _empty_subscription_status()

    # ------------------------------------------------------------------
    # Webhook helpers
    # ------------------------------------------------------------------

    def construct_event(self, payload: bytes, sig_header: str) -> stripe.Event:
        """Verify and parse a Stripe webhook event.

        Raises ``stripe.error.SignatureVerificationError`` if the signature
        is invalid.  Raises ``RuntimeError`` if the webhook secret is not
        configured.
        """
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise RuntimeError(
                "STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook signatures."
            )
        return stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _empty_subscription_status() -> dict:
    return {
        "has_active_subscription": False,
        "subscription_id": None,
        "status": None,
        "price_id": None,
        "current_period_end": None,
        "cancel_at_period_end": False,
        "plan": "free",
    }


def _plan_from_price_id(price_id: Optional[str]) -> str:
    """Map a Stripe price ID to an internal plan name."""
    if not price_id:
        return "free"
    if settings.STRIPE_PRICE_ENTERPRISE_MONTHLY and price_id == settings.STRIPE_PRICE_ENTERPRISE_MONTHLY:
        return "enterprise"
    if settings.STRIPE_PRICE_PRO_MONTHLY and price_id == settings.STRIPE_PRICE_PRO_MONTHLY:
        return "pro"
    # Unknown price → treat as pro (better than downgrading unexpectedly)
    return "pro"


# Singleton — import and use directly
stripe_service = StripeService()

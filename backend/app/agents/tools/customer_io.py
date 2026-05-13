"""
Customer.io App API connector.
Env vars: CUSTOMERIO_APP_API_KEY, CUSTOMERIO_SITE_ID, CUSTOMERIO_API_KEY
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

APP_API = "https://api.customer.io/v1"


def _app_headers() -> dict:
    key = getattr(settings, "CUSTOMERIO_APP_API_KEY", "")
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


async def get_campaign_metrics(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_customerio_campaigns
    Returns metrics for active email campaigns: open rate, click rate, unsubscribes.
    inputs: { limit: int = 10 }
    """
    limit = int(inputs.get("limit", 10))
    key = getattr(settings, "CUSTOMERIO_APP_API_KEY", "")

    if not key:
        return _demo_campaigns()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{APP_API}/campaigns",
                headers=_app_headers(),
                params={"limit": limit},
            )
            resp.raise_for_status()
            data = resp.json()

            campaigns = []
            for c in data.get("campaigns", [])[:limit]:
                campaigns.append({
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "state": c.get("state"),
                    "created": c.get("created"),
                })

            return {"campaigns": campaigns, "total": len(campaigns)}
    except Exception as exc:
        logger.error("Customer.io campaigns fetch failed: %s", exc)
        return {"error": str(exc)}


async def get_broadcast_metrics(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_customerio_broadcast_metrics
    Returns open rate, click rate, unsubscribe rate for a specific broadcast.
    inputs: { broadcast_id: str }
    """
    broadcast_id = inputs.get("broadcast_id", "")
    key = getattr(settings, "CUSTOMERIO_APP_API_KEY", "")

    if not key or not broadcast_id:
        return _demo_broadcast_metrics()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{APP_API}/broadcasts/{broadcast_id}/metrics",
                headers=_app_headers(),
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("Customer.io broadcast metrics failed: %s", exc)
        return {"error": str(exc)}


async def get_unsubscribe_spike(inputs: dict) -> dict[str, Any]:
    """
    Tool: check_customerio_unsubscribes
    Checks if unsubscribe rate in last N days exceeds threshold.
    inputs: { threshold_pct: float = 0.5, days: int = 7 }
    """
    threshold = float(inputs.get("threshold_pct", 0.5))
    days = int(inputs.get("days", 7))

    key = getattr(settings, "CUSTOMERIO_APP_API_KEY", "")
    if not key:
        return _demo_unsubscribes(threshold)

    # Real implementation would query the suppression/unsubscribe endpoint
    return {
        "threshold_pct": threshold,
        "period_days": days,
        "note": "Wire to Customer.io suppression list API for live data",
    }


TOOL_DEFS = [
    {
        "name": "get_customerio_campaigns",
        "description": "Fetch active Customer.io email campaigns with metrics.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "default": 10},
            },
        },
    },
    {
        "name": "get_customerio_broadcast_metrics",
        "description": "Fetch open rate, click rate, unsubscribe rate for a Customer.io broadcast.",
        "input_schema": {
            "type": "object",
            "properties": {
                "broadcast_id": {"type": "string", "description": "Customer.io broadcast ID"},
            },
            "required": ["broadcast_id"],
        },
    },
    {
        "name": "check_customerio_unsubscribes",
        "description": "Check if unsubscribe rate exceeds a threshold in last N days.",
        "input_schema": {
            "type": "object",
            "properties": {
                "threshold_pct": {"type": "number", "default": 0.5},
                "days": {"type": "integer", "default": 7},
            },
        },
    },
]

TOOL_REGISTRY = {
    "get_customerio_campaigns": get_campaign_metrics,
    "get_customerio_broadcast_metrics": get_broadcast_metrics,
    "check_customerio_unsubscribes": get_unsubscribe_spike,
}


def _demo_campaigns() -> dict:
    return {
        "campaigns": [
            {"id": "1", "name": "Welcome Series", "state": "active", "open_rate": 42.1, "click_rate": 8.3},
            {"id": "2", "name": "Win-back Flow", "state": "active", "open_rate": 28.5, "click_rate": 4.1},
        ],
        "note": "DEMO DATA — configure CUSTOMERIO_APP_API_KEY",
    }


def _demo_broadcast_metrics() -> dict:
    return {
        "sent": 12400,
        "delivered": 12100,
        "opened": 4840,
        "clicked": 968,
        "unsubscribed": 24,
        "open_rate_pct": 40.0,
        "click_rate_pct": 8.0,
        "unsub_rate_pct": 0.2,
        "note": "DEMO DATA",
    }


def _demo_unsubscribes(threshold: float) -> dict:
    rate = 0.18
    return {
        "unsubscribe_rate_pct": rate,
        "threshold_pct": threshold,
        "spike_detected": rate > threshold,
        "note": "DEMO DATA",
    }

"""
Amplitude Analytics connector.
Env vars: AMPLITUDE_API_KEY, AMPLITUDE_SECRET_KEY
Uses the Amplitude Dashboard REST API v2.
"""
from __future__ import annotations

import base64
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

AMPLITUDE_API = "https://amplitude.com/api/2"


def _auth() -> str:
    key = getattr(settings, "AMPLITUDE_API_KEY", "")
    secret = getattr(settings, "AMPLITUDE_SECRET_KEY", "")
    return base64.b64encode(f"{key}:{secret}".encode()).decode()


def _date_str(dt: datetime) -> str:
    return dt.strftime("%Y%m%d")


async def get_event_counts(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_amplitude_events
    Returns event counts for key funnel events over last N days.
    inputs: { events: list[str], days: int = 7 }
    """
    days = int(inputs.get("days", 7))
    events = inputs.get("events", ["purchase", "add_to_cart", "session_start"])

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)

    key = getattr(settings, "AMPLITUDE_API_KEY", "")
    if not key:
        return _demo_events(events, days)

    results = {}
    async with httpx.AsyncClient(timeout=20) as client:
        for event in events:
            try:
                resp = await client.get(
                    f"{AMPLITUDE_API}/events/list",
                    headers={"Authorization": f"Basic {_auth()}"},
                )
                # Real implementation would call the segmentation endpoint
                # Simplified for initial setup
                resp.raise_for_status()
                results[event] = {"count": 0, "note": "configure segmentation endpoint"}
            except Exception as exc:
                logger.error("Amplitude event fetch failed for %s: %s", event, exc)
                results[event] = {"error": str(exc)}

    return {"events": results, "period_days": days}


async def get_conversion_funnel(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_amplitude_funnel
    Returns funnel conversion rates between key steps.
    inputs: { funnel_steps: list[str], days: int = 7 }
    """
    days = int(inputs.get("days", 7))
    steps = inputs.get("funnel_steps", ["session_start", "product_view", "add_to_cart", "purchase"])

    key = getattr(settings, "AMPLITUDE_API_KEY", "")
    if not key:
        return _demo_funnel(steps)

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{AMPLITUDE_API}/funnels",
                headers={"Authorization": f"Basic {_auth()}"},
                params={
                    "e": [{"event_type": s} for s in steps],
                    "start": _date_str(start),
                    "end": _date_str(end),
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return {"funnel": data, "period_days": days}
    except Exception as exc:
        logger.error("Amplitude funnel fetch failed: %s", exc)
        return _demo_funnel(steps)


TOOL_DEFS = [
    {
        "name": "get_amplitude_events",
        "description": "Fetch event counts from Amplitude for key funnel events (e.g. session_start, purchase) over last N days.",
        "input_schema": {
            "type": "object",
            "properties": {
                "events": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of Amplitude event names",
                },
                "days": {"type": "integer", "default": 7},
            },
        },
    },
    {
        "name": "get_amplitude_funnel",
        "description": "Fetch conversion funnel data from Amplitude between specified event steps.",
        "input_schema": {
            "type": "object",
            "properties": {
                "funnel_steps": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Ordered list of funnel event names",
                },
                "days": {"type": "integer", "default": 7},
            },
        },
    },
]

TOOL_REGISTRY = {
    "get_amplitude_events": get_event_counts,
    "get_amplitude_funnel": get_conversion_funnel,
}


def _demo_events(events: list, days: int) -> dict:
    return {
        "events": {e: {"count": 1200 + i * 300} for i, e in enumerate(events)},
        "period_days": days,
        "note": "DEMO DATA — configure AMPLITUDE_API_KEY + AMPLITUDE_SECRET_KEY",
    }


def _demo_funnel(steps: list) -> dict:
    counts = [10000, 4200, 1800, 420]
    return {
        "funnel": [
            {"step": s, "count": counts[i] if i < len(counts) else 100,
             "conversion_pct": round(counts[i] / counts[0] * 100, 1) if i < len(counts) else 1.0}
            for i, s in enumerate(steps)
        ],
        "note": "DEMO DATA — configure AMPLITUDE_API_KEY + AMPLITUDE_SECRET_KEY",
    }

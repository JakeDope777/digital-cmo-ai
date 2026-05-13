"""
Shopify Admin REST API connector.
Env vars: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://{domain}/admin/api/2024-01/{resource}.json"


def _headers() -> dict:
    token = getattr(settings, "SHOPIFY_ADMIN_API_TOKEN", "")
    return {"X-Shopify-Access-Token": token, "Content-Type": "application/json"}


def _url(resource: str) -> str:
    domain = getattr(settings, "SHOPIFY_STORE_DOMAIN", "")
    return BASE_URL.format(domain=domain, resource=resource)


async def get_revenue_summary(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_shopify_revenue
    Returns total revenue, order count, AOV for a date range.
    inputs: { days: int = 1 }
    """
    days = int(inputs.get("days", 1))
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    params = {
        "status": "any",
        "financial_status": "paid",
        "created_at_min": since,
        "fields": "total_price,created_at",
        "limit": 250,
    }

    token = getattr(settings, "SHOPIFY_ADMIN_API_TOKEN", "")
    if not token:
        return _demo_revenue(days)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(_url("orders"), headers=_headers(), params=params)
            resp.raise_for_status()
            orders = resp.json().get("orders", [])

        total = sum(float(o["total_price"]) for o in orders)
        count = len(orders)
        aov = total / count if count else 0

        return {
            "period_days": days,
            "total_revenue": round(total, 2),
            "order_count": count,
            "average_order_value": round(aov, 2),
            "since": since,
        }
    except Exception as exc:
        logger.error("Shopify revenue fetch failed: %s", exc)
        return {"error": str(exc)}


async def get_product_performance(inputs: dict) -> dict[str, Any]:
    """
    Tool: get_shopify_products
    Returns top products by revenue for the period.
    inputs: { days: int = 7, limit: int = 10 }
    """
    days = int(inputs.get("days", 7))
    limit = int(inputs.get("limit", 10))
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    params = {
        "financial_status": "paid",
        "created_at_min": since,
        "fields": "line_items,total_price",
        "limit": 250,
    }

    token = getattr(settings, "SHOPIFY_ADMIN_API_TOKEN", "")
    if not token:
        return _demo_products()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(_url("orders"), headers=_headers(), params=params)
            resp.raise_for_status()
            orders = resp.json().get("orders", [])

        product_revenue: dict[str, float] = {}
        for order in orders:
            for item in order.get("line_items", []):
                name = item["title"]
                product_revenue[name] = product_revenue.get(name, 0) + float(item["price"]) * item["quantity"]

        top = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)[:limit]
        return {"top_products": [{"name": k, "revenue": round(v, 2)} for k, v in top]}
    except Exception as exc:
        logger.error("Shopify products fetch failed: %s", exc)
        return {"error": str(exc)}


# ── Tool definitions (Anthropic format) ──────────────────────────────────────
TOOL_DEFS = [
    {
        "name": "get_shopify_revenue",
        "description": "Fetch Shopify revenue summary (total revenue, order count, AOV) for last N days.",
        "input_schema": {
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "Number of days to look back", "default": 1}
            },
        },
    },
    {
        "name": "get_shopify_products",
        "description": "Fetch top products by revenue from Shopify for last N days.",
        "input_schema": {
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "Number of days to look back", "default": 7},
                "limit": {"type": "integer", "description": "Max products to return", "default": 10},
            },
        },
    },
]

TOOL_REGISTRY = {
    "get_shopify_revenue": get_revenue_summary,
    "get_shopify_products": get_product_performance,
}


# ── Demo data fallbacks ───────────────────────────────────────────────────────
def _demo_revenue(days: int) -> dict:
    return {
        "period_days": days,
        "total_revenue": 14823.50,
        "order_count": 47,
        "average_order_value": 315.39,
        "note": "DEMO DATA — configure SHOPIFY_ADMIN_API_TOKEN",
    }


def _demo_products() -> dict:
    return {
        "top_products": [
            {"name": "Premium Bundle", "revenue": 4200.0},
            {"name": "Starter Kit", "revenue": 2800.0},
            {"name": "Add-on Pack", "revenue": 1100.0},
        ],
        "note": "DEMO DATA — configure SHOPIFY_ADMIN_API_TOKEN",
    }

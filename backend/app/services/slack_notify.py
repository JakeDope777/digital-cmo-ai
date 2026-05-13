"""
Slack notification service.
Uses incoming webhooks — no OAuth, no bot token needed for basic alerts.
Add SLACK_WEBHOOK_URL to .env. Optionally add SLACK_BOT_TOKEN for
per-channel posting via the Web API.
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_message(
    text: str,
    channel: Optional[str] = None,
    blocks: Optional[list] = None,
    webhook_url: Optional[str] = None,
) -> bool:
    """
    Send a plain-text or block-kit message to Slack.

    Priority order:
      1. Explicit webhook_url argument (useful for per-agent channels).
      2. settings.SLACK_WEBHOOK_URL env var.

    Returns True on success, False on failure (never raises).
    """
    url = webhook_url or getattr(settings, "SLACK_WEBHOOK_URL", None)
    if not url:
        logger.warning("No Slack webhook configured — message not sent: %s", text[:80])
        return False

    payload: dict = {"text": text}
    if channel:
        payload["channel"] = channel
    if blocks:
        payload["blocks"] = blocks

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
        logger.debug("Slack message sent: %s", text[:60])
        return True
    except Exception as exc:
        logger.error("Slack send failed: %s", exc)
        return False


async def send_alert(
    title: str,
    body: str,
    severity: str = "info",  # "info" | "warning" | "critical"
    action_hint: Optional[str] = None,
    webhook_url: Optional[str] = None,
) -> bool:
    """
    Structured alert block — what agents use for anomaly notifications.

    severity colours: info=blue, warning=yellow, critical=red
    """
    colour_map = {"info": "#4338CA", "warning": "#F59E0B", "critical": "#DC2626"}
    colour = colour_map.get(severity, "#4338CA")
    emoji_map = {"info": "ℹ️", "warning": "⚠️", "critical": "🚨"}
    emoji = emoji_map.get(severity, "ℹ️")

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"{emoji} {title}"},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": body},
        },
    ]
    if action_hint:
        blocks.append(
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"*Action:* {action_hint}"}
                ],
            }
        )
    blocks.append({"type": "divider"})

    # Fallback text for notifications
    fallback = f"{emoji} *{title}*\n{body}"
    if action_hint:
        fallback += f"\n→ {action_hint}"

    return await send_message(text=fallback, blocks=blocks, webhook_url=webhook_url)

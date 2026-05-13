"""
Telegram Bot notification service.
Personal channel — Morning Brief and urgent alerts land here.

Setup:
  1. Create a bot via @BotFather → get TELEGRAM_BOT_TOKEN
  2. Send a message to your bot, then fetch:
     https://api.telegram.org/bot<TOKEN>/getUpdates
     to get your TELEGRAM_CHAT_ID (it's your personal chat id).
  3. Add both to .env.
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"
PARSE_MODE = "MarkdownV2"


def _escape(text: str) -> str:
    """Escape special chars for MarkdownV2."""
    special = r"\_*[]()~`>#+-=|{}.!"
    return "".join(f"\\{c}" if c in special else c for c in text)


async def send_message(
    text: str,
    chat_id: Optional[str] = None,
    parse_mode: str = "Markdown",
    disable_preview: bool = True,
) -> bool:
    """
    Send a Telegram message.

    Uses settings.TELEGRAM_CHAT_ID if chat_id not provided.
    Returns True on success, never raises.
    """
    token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    target = chat_id or getattr(settings, "TELEGRAM_CHAT_ID", None)

    if not token or not target:
        logger.warning("Telegram not configured — message not sent: %s", text[:80])
        return False

    url = TELEGRAM_API.format(token=token, method="sendMessage")
    payload = {
        "chat_id": target,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": disable_preview,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
        logger.debug("Telegram message sent to %s", target)
        return True
    except Exception as exc:
        logger.error("Telegram send failed: %s", exc)
        return False


async def send_brief(
    title: str,
    bullets: list[str],
    chat_id: Optional[str] = None,
) -> bool:
    """
    Send a structured daily brief — used by Morning Brief Agent.
    Formats as bold title + numbered bullet list.
    """
    lines = [f"*{title}*\n"]
    for i, bullet in enumerate(bullets, 1):
        lines.append(f"{i}\\. {bullet}")
    text = "\n".join(lines)
    return await send_message(text, chat_id=chat_id)


async def send_alert(
    title: str,
    body: str,
    action: Optional[str] = None,
    chat_id: Optional[str] = None,
) -> bool:
    """
    Urgent alert — used by Campaign Pulse for critical drops.
    """
    parts = [f"🚨 *{title}*", "", body]
    if action:
        parts += ["", f"→ _{action}_"]
    return await send_message("\n".join(parts), chat_id=chat_id)

"""
Competitive Intel Agent — daily crawl, Monday digest to Telegram.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.agents.tools import firecrawl
from app.core.config import settings
from app.services import telegram_bot, slack_notify

logger = logging.getLogger(__name__)

# Configure your top competitors in .env as COMPETITOR_URLS (comma-separated)
def _competitor_urls() -> list[str]:
    raw = getattr(settings, "COMPETITOR_URLS", "")
    if not raw:
        return ["https://example-competitor.com"]
    return [u.strip() for u in raw.split(",") if u.strip()]


class CompetitiveIntelAgent(BaseAgent):
    name = "competitive_intel"
    description = (
        "Daily: scrape competitor sites for pricing, ad, and content changes. "
        "Monday: send a digest to Telegram with key moves this week."
    )

    tools = firecrawl.TOOL_DEFS
    tool_registry = firecrawl.TOOL_REGISTRY

    @property
    def system_prompt(self) -> str:
        return """You are Competitive Intel, an autonomous competitor monitoring agent for an e-commerce CMO.

Your job:
1. Scrape each competitor URL provided.
2. Look for: pricing changes, new product launches, promotional banners, new blog posts / content angles, new features mentioned.
3. Flag anything that changed or is noteworthy.
4. Rate each competitor move: 🔴 High impact (respond this week) | 🟡 Watch | ✅ Noted

Output format (Telegram-friendly, concise):
📊 *Competitive Intel Digest*

*[Competitor Name]*
- [Finding 1] [impact emoji]
- [Finding 2] [impact emoji]

*Summary:* [1-2 sentences on the most important move this week]

If nothing significant found, say: "No major moves this week."

Keep total output under 600 words."""

    async def run(self) -> AgentResult:
        urls = _competitor_urls()
        task = (
            f"Crawl these competitor sites and identify any pricing changes, "
            f"new promotions, new content, or strategic moves: {', '.join(urls)}. "
            "Scrape each one and produce a digest."
        )

        output = await runner.execute(
            system=self.system_prompt,
            user_message=task,
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        high_impact = "🔴" in output
        return AgentResult(
            agent_name=self.name,
            success=True,
            summary=output[:150],
            detail=output,
            data={
                "competitors_checked": len(urls),
                "high_impact_found": high_impact,
                "ran_at": datetime.now(timezone.utc).isoformat(),
            },
            alerts=[{"severity": "warning", "title": "High-impact competitor move", "body": output[:300]}]
            if high_impact else [],
        )

    async def on_success(self, result: AgentResult) -> None:
        is_monday = datetime.now(timezone.utc).weekday() == 0  # 0 = Monday

        if is_monday:
            # Full digest to Telegram
            await telegram_bot.send_message(
                text=result.detail or result.summary,
            )

        # High-impact move on any day → Slack alert
        if result.data.get("high_impact_found"):
            await slack_notify.send_alert(
                title="🔴 Competitor Move: High Impact",
                body=result.summary,
                severity="warning",
                action_hint="Reply with 🔴 in Telegram to request deeper brief",
            )

    async def on_failure(self, result: AgentResult) -> None:
        logger.error("Competitive Intel failed: %s", result.error)

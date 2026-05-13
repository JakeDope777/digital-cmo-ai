"""
Morning Brief Agent — 08:00 daily Telegram brief. 5 bullets. 30 seconds to read.
Aggregates outputs from all CMO agents.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.agents.tools import shopify
from app.services import telegram_bot

logger = logging.getLogger(__name__)


class MorningBriefAgent(BaseAgent):
    name = "morning_brief"
    description = (
        "Daily 08:00 brief to Telegram. "
        "5 bullets: revenue, top issue, competitor move, CRO status, #1 action."
    )

    tools = shopify.TOOL_DEFS
    tool_registry = shopify.TOOL_REGISTRY

    @property
    def system_prompt(self) -> str:
        today = datetime.now(timezone.utc).strftime("%A, %B %d")
        return f"""You are Morning Brief, a personal assistant to the CMO. Today is {today}.

Generate the daily morning brief — 5 bullets, nothing more.
The CMO reads this on their phone in 30 seconds before their first meeting.

Required format (exactly):
☀️ *Good morning. Here's your {today} brief.*

1️⃣ *Revenue:* [Yesterday's Shopify revenue vs 7-day daily avg. +/-% delta. One line.]
2️⃣ *Campaign:* [Top campaign issue or win from last 24h. One line.]
3️⃣ *Competitors:* [Any notable competitor move this week. If none: "No major moves."]
4️⃣ *CRO:* [Experiment status. If significant: "⚡ Winner ready: [name]". If not: "[N] tests running."]
5️⃣ *#1 Action:* [The single most important thing to do today. Be specific.]

No prose. No explanation. Just the 5 bullets.
If you don't have data for a bullet, write: "[data unavailable]" — never invent numbers."""

    async def run(self) -> AgentResult:
        output = await runner.execute(
            system=self.system_prompt,
            user_message=(
                "Generate today's morning brief. "
                "Fetch yesterday's Shopify revenue (1 day) and compare to 7-day average. "
                "Use available context for the other bullets."
            ),
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        return AgentResult(
            agent_name=self.name,
            success=True,
            summary="Morning brief generated",
            detail=output,
            data={"date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        )

    async def on_success(self, result: AgentResult) -> None:
        await telegram_bot.send_message(
            text=result.detail or result.summary,
            parse_mode="Markdown",
        )

    async def on_failure(self, result: AgentResult) -> None:
        await telegram_bot.send_message(
            text=f"⚠️ Morning Brief failed: {result.error or 'unknown error'}",
            parse_mode="Markdown",
        )

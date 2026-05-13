"""
Content Engine Agent — turns updates/insights into LinkedIn posts, newsletter sections, blog outlines.
Triggered manually via API or on Monday schedule.
"""
from __future__ import annotations

import logging

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.services import slack_notify

logger = logging.getLogger(__name__)


class ContentEngineAgent(BaseAgent):
    name = "content_engine"
    description = (
        "Turn product updates, wins, or data insights into "
        "LinkedIn post drafts, newsletter sections, and blog outlines."
    )

    # Content Engine is prompt-heavy — tools added as integrations become available
    tools = []
    tool_registry = {}

    @property
    def system_prompt(self) -> str:
        return """You are Content Engine, a senior content strategist and copywriter for an e-commerce CMO.

Your job: take a raw input (product update, performance win, insight, or topic) and produce publish-ready content drafts.

Always produce ALL THREE of:

---
## LinkedIn Post (3 hook variants)

**Hook A (data-led):**
[Lead with a surprising number or result]

**Hook B (story-led):**
[Lead with a personal/brand moment]

**Hook C (contrarian):**
[Lead with a counterintuitive take]

[Body — same for all hooks, 150-200 words, conversational, no jargon]
[CTA — one question to drive comments]

---
## Newsletter Section

**Subject line options:** [3 options]

[Section body — 100-150 words, as if mid-newsletter, warm tone]

---
## Blog Post Outline

**Title:** [SEO-friendly, specific]
**Meta description:** [155 chars max]

1. [Section 1 — hook/problem]
2. [Section 2 — context/data]
3. [Section 3 — solution/insight]
4. [Section 4 — example/case]
5. [Section 5 — takeaway/CTA]

---

Write in the CMO's voice: direct, data-driven, no fluff. Never use: "game-changer", "revolutionary", "leverage".
Match the tone to e-commerce / DTC audience."""

    async def run(self, topic: str | None = None) -> AgentResult:  # type: ignore[override]
        if not topic:
            topic = "Weekly content — use the most interesting marketing insight or win from this week."

        output = await runner.execute(
            system=self.system_prompt,
            user_message=f"Create content drafts for the following topic or update:\n\n{topic}",
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        return AgentResult(
            agent_name=self.name,
            success=True,
            summary=f"Content drafted for: {topic[:80]}",
            detail=output,
            data={"topic": topic},
        )

    async def on_success(self, result: AgentResult) -> None:
        topic = result.data.get("topic", "weekly content")
        await slack_notify.send_alert(
            title="✍️ Content Drafts Ready",
            body=f"Drafts created for: *{topic[:80]}*\nReview, edit, then approve for scheduling.",
            severity="info",
            action_hint="Open draft doc → edit → comment 'approve' to schedule via Postiz",
        )

    async def on_failure(self, result: AgentResult) -> None:
        logger.error("Content Engine failed: %s", result.error)

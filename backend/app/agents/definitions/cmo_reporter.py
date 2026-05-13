"""
CMO Reporter Agent — weekly (Monday 09:00) + monthly (1st of month).
Generates full marketing report, posts summary to Slack.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.agents.tools import shopify, amplitude, customer_io
from app.services import slack_notify

logger = logging.getLogger(__name__)


class CMOReporterAgent(BaseAgent):
    name = "cmo_reporter"
    description = (
        "Generate weekly and monthly CMO reports from all data sources. "
        "Post summary to Slack with full report linked."
    )

    tools = shopify.TOOL_DEFS + amplitude.TOOL_DEFS + customer_io.TOOL_DEFS
    tool_registry = {
        **shopify.TOOL_REGISTRY,
        **amplitude.TOOL_REGISTRY,
        **customer_io.TOOL_REGISTRY,
    }

    def _report_type(self) -> str:
        now = datetime.now(timezone.utc)
        return "monthly" if now.day == 1 else "weekly"

    @property
    def system_prompt(self) -> str:
        report_type = self._report_type()
        period = "last 30 days" if report_type == "monthly" else "last 7 days"
        return f"""You are CMO Reporter, an autonomous reporting agent for an e-commerce CMO.

Generate a {report_type} marketing performance report for {period}.

Structure:
## Executive Summary
[2-3 sentences: top wins, top concern, overall direction]

## Revenue Performance
[Shopify: total revenue, vs prior period %, AOV, order count]

## Acquisition & Funnel
[Amplitude: top funnel conversion rates, biggest drop-off point]

## Email Performance
[Customer.io: open rates, click rates, unsubscribes, best-performing campaign]

## Top 3 Actions for Next Week
1. [Specific, time-bound action]
2. [Specific, time-bound action]
3. [Specific, time-bound action]

Be data-driven. Use actual numbers from tools.
Flag any metric that is significantly below benchmark.
Format cleanly — this report goes to the CMO and may be shared with leadership."""

    async def run(self) -> AgentResult:
        report_type = self._report_type()
        days = 30 if report_type == "monthly" else 7

        task = (
            f"Generate the {report_type} CMO report. "
            f"Fetch Shopify revenue for last {days} days, "
            f"Amplitude funnel data for last {days} days, "
            f"and Customer.io campaign metrics. "
            "Compile into the full structured report."
        )

        output = await runner.execute(
            system=self.system_prompt,
            user_message=task,
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        return AgentResult(
            agent_name=self.name,
            success=True,
            summary=f"{report_type.title()} report generated — {len(output)} chars",
            detail=output,
            data={"report_type": report_type, "generated_at": datetime.now(timezone.utc).isoformat()},
        )

    async def on_success(self, result: AgentResult) -> None:
        report_type = result.data.get("report_type", "weekly")
        emoji = "📅" if report_type == "weekly" else "📆"

        # Extract executive summary (first 300 chars after the header)
        detail = result.detail or ""
        summary_start = detail.find("## Executive Summary")
        summary_excerpt = detail[summary_start:summary_start + 400] if summary_start != -1 else detail[:400]

        await slack_notify.send_alert(
            title=f"{emoji} {report_type.title()} CMO Report Ready",
            body=summary_excerpt,
            severity="info",
            action_hint="Full report saved. Add your commentary and share to #leadership.",
        )

    async def on_failure(self, result: AgentResult) -> None:
        await slack_notify.send_alert(
            title="CMO Reporter: Failed",
            body=result.error or "Unknown error",
            severity="warning",
        )

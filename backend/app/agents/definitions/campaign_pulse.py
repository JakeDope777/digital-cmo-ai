"""
Campaign Pulse Agent — runs every 2h, detects performance degradation.
Alerts in Slack. Pings Telegram for critical drops.
"""
from __future__ import annotations

import logging

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.agents.tools import shopify, amplitude
from app.services import slack_notify, telegram_bot

logger = logging.getLogger(__name__)

# Thresholds — tune these based on your baseline
ROAS_DROP_THRESHOLD_PCT = 20    # Alert if ROAS drops >20% vs 7d avg
CPL_RISE_THRESHOLD_PCT = 15     # Alert if CPL rises >15% vs 7d avg


class CampaignPulseAgent(BaseAgent):
    name = "campaign_pulse"
    description = (
        "Monitor campaign performance every 2 hours. "
        "Detect CPL/ROAS/revenue anomalies. "
        "Suggest concrete actions. Report to Slack."
    )

    tools = (
        shopify.TOOL_DEFS
        + amplitude.TOOL_DEFS
    )

    tool_registry = {
        **shopify.TOOL_REGISTRY,
        **amplitude.TOOL_REGISTRY,
    }

    @property
    def system_prompt(self) -> str:
        return """You are Campaign Pulse, an autonomous performance monitoring agent for an e-commerce CMO.

Your job every 2 hours:
1. Fetch Shopify revenue for last 24h and compare to 7-day average.
2. Fetch Amplitude funnel conversion rates for last 24h.
3. Identify any metric that deviates by more than 15% from the 7-day baseline.
4. For each anomaly, write:
   - What changed (metric, direction, % delta)
   - Likely cause (1 sentence hypothesis)
   - Recommended action (specific, actionable)
5. Rate overall health: GREEN / YELLOW / RED

Be concise. The CMO is busy. Lead with the most critical finding.
If everything looks normal, say so in one line.

Output format:
HEALTH: [GREEN/YELLOW/RED]
---
[Findings, one per anomaly]
---
RECOMMENDED ACTION: [Most important action]"""

    async def run(self) -> AgentResult:
        task = (
            "Check campaign performance for the last 24h. "
            "Compare Shopify revenue and Amplitude funnel vs 7-day baseline. "
            "Identify anomalies and recommend actions."
        )

        output = await runner.execute(
            system=self.system_prompt,
            user_message=task,
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        # Parse health status from output
        health = "GREEN"
        if "YELLOW" in output:
            health = "YELLOW"
        if "RED" in output:
            health = "RED"

        alerts = []
        if health != "GREEN":
            alerts.append({
                "severity": "warning" if health == "YELLOW" else "critical",
                "title": f"Campaign Pulse: {health}",
                "body": output[:500],
            })

        return AgentResult(
            agent_name=self.name,
            success=True,
            summary=f"Health: {health} — {output[:120]}",
            detail=output,
            data={"health": health},
            alerts=alerts,
        )

    async def on_success(self, result: AgentResult) -> None:
        health = result.data.get("health", "GREEN")

        if health == "GREEN":
            # Silent — no alert needed for healthy state
            return

        severity = "warning" if health == "YELLOW" else "critical"
        action_hint = "Reply 'ok' to acknowledge, or specify override action"

        # Always post to Slack
        await slack_notify.send_alert(
            title=f"Campaign Pulse: {health}",
            body=result.detail or result.summary,
            severity=severity,
            action_hint=action_hint,
        )

        # Critical only → also ping Telegram
        if health == "RED":
            await telegram_bot.send_alert(
                title="🔴 Campaign Alert",
                body=result.summary,
                action="Check Slack for full details + recommended action",
            )

    async def on_failure(self, result: AgentResult) -> None:
        await slack_notify.send_alert(
            title="Campaign Pulse: Run Failed",
            body=result.error or "Unknown error",
            severity="warning",
        )

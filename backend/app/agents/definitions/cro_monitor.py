"""
CRO Monitor Agent — polls Convert.com every 4h for experiment significance.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from app.agents.base import BaseAgent, AgentResult
from app.agents.runner import runner
from app.core.config import settings
from app.services import slack_notify

logger = logging.getLogger(__name__)

CONVERT_API = "https://api.convert.com/api/v2"
SIGNIFICANCE_THRESHOLD = 0.95


async def get_convert_experiments(inputs: dict) -> dict[str, Any]:
    """Tool: get_convert_experiments — fetches running A/B tests from Convert.com."""
    api_key = getattr(settings, "CONVERT_API_KEY", "")
    project_id = getattr(settings, "CONVERT_PROJECT_ID", "")

    if not api_key:
        return {
            "experiments": [
                {
                    "id": "demo-1",
                    "name": "Checkout Button CTA",
                    "status": "active",
                    "control": {"visitors": 1240, "conversions": 62, "conversion_rate": 0.05},
                    "variant": {"visitors": 1198, "conversions": 78, "conversion_rate": 0.065},
                    "significance": 0.91,
                    "lift_pct": 30.0,
                }
            ],
            "note": "DEMO DATA — configure CONVERT_API_KEY + CONVERT_PROJECT_ID",
        }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{CONVERT_API}/projects/{project_id}/experiments",
                headers={"Authorization": f"Bearer {api_key}"},
                params={"status": "active"},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("Convert.com fetch failed: %s", exc)
        return {"error": str(exc)}


class CROMonitorAgent(BaseAgent):
    name = "cro_monitor"
    description = (
        "Poll Convert.com every 4h. Alert when an experiment hits 95% significance. "
        "Recommend winner + next test hypothesis."
    )

    tools = [
        {
            "name": "get_convert_experiments",
            "description": "Fetch all active A/B experiments from Convert.com with current significance and conversion rates.",
            "input_schema": {"type": "object", "properties": {}},
        }
    ]

    tool_registry = {"get_convert_experiments": get_convert_experiments}

    @property
    def system_prompt(self) -> str:
        return """You are CRO Monitor, an autonomous experiment tracking agent for an e-commerce CMO.

Your job every 4 hours:
1. Fetch all active Convert.com experiments.
2. For each experiment:
   - Report current significance level and lift %
   - If significance >= 95%: declare a winner and recommend implementation
   - If significance < 95%: report current status and estimated sample size needed
3. Suggest the next test to run based on remaining funnel gaps.

Output format:

## Active Experiments

### [Experiment Name]
- Status: [Running / ⚡ SIGNIFICANT - WINNER FOUND]
- Significance: [X%] | Lift: [+X%]
- Variant: [X conv rate] vs Control: [Y conv rate]
- [If significant]: RECOMMENDATION: Implement [variant]. Estimated lift: +X% on CVR.
- [If not yet significant]: Need ~[N] more visitors at current traffic.

## Next Test Hypothesis
[One concrete test to run next, based on where the funnel loses the most people]"""

    async def run(self) -> AgentResult:
        output = await runner.execute(
            system=self.system_prompt,
            user_message="Check all active A/B experiments and report significance levels.",
            tools=self.tools,
            tool_registry=self.tool_registry,
        )

        winner_found = "SIGNIFICANT" in output or "WINNER" in output
        return AgentResult(
            agent_name=self.name,
            success=True,
            summary=output[:150],
            detail=output,
            data={"winner_found": winner_found},
            alerts=[{
                "severity": "info",
                "title": "CRO: Experiment Winner Found",
                "body": output[:400],
            }] if winner_found else [],
        )

    async def on_success(self, result: AgentResult) -> None:
        if result.data.get("winner_found"):
            await slack_notify.send_alert(
                title="⚡ CRO: Experiment Significant — Winner Ready",
                body=result.detail or result.summary,
                severity="info",
                action_hint="Reply 'approve' to implement winner. Agent will log result to tracker.",
            )

    async def on_failure(self, result: AgentResult) -> None:
        logger.error("CRO Monitor failed: %s", result.error)

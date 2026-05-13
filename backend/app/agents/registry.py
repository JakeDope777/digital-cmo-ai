"""
Agent registry — single source of truth for all registered agents.
Import and register agents here; the scheduler reads this list.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.agents.base import BaseAgent

# Registry: agent_name -> agent instance
_REGISTRY: dict[str, "BaseAgent"] = {}


def register(agent: "BaseAgent") -> None:
    """Register an agent instance."""
    _REGISTRY[agent.name] = agent


def get(name: str) -> "BaseAgent":
    """Retrieve agent by name. Raises KeyError if not found."""
    return _REGISTRY[name]


def all_agents() -> list["BaseAgent"]:
    """Return all registered agents."""
    return list(_REGISTRY.values())


def _bootstrap() -> None:
    """
    Import and register all agent definitions.
    Called once at app startup (from scheduler.py).
    """
    from app.agents.definitions.campaign_pulse import CampaignPulseAgent
    from app.agents.definitions.competitive_intel import CompetitiveIntelAgent
    from app.agents.definitions.cmo_reporter import CMOReporterAgent
    from app.agents.definitions.cro_monitor import CROMonitorAgent
    from app.agents.definitions.morning_brief import MorningBriefAgent
    from app.agents.definitions.content_engine import ContentEngineAgent

    for AgentClass in [
        CampaignPulseAgent,
        CompetitiveIntelAgent,
        CMOReporterAgent,
        CROMonitorAgent,
        MorningBriefAgent,
        ContentEngineAgent,
    ]:
        instance = AgentClass()
        register(instance)

"""
Base agent class.
All 6 agents inherit from BaseAgent and implement run().
The runner calls run(); the scheduler triggers it on schedule.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class AgentResult:
    """Structured result returned by every agent run."""
    agent_name: str
    success: bool
    summary: str                        # Short text — shown in brief/alert
    detail: Optional[str] = None        # Full output (for reports, docs)
    data: dict[str, Any] = field(default_factory=dict)  # Raw structured data
    actions_taken: list[str] = field(default_factory=list)
    alerts: list[dict] = field(default_factory=list)    # [{severity, title, body}]
    ran_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    error: Optional[str] = None


class BaseAgent(ABC):
    """
    Abstract base for all CMO agents.

    Subclasses must implement:
      - name (str class attr)
      - description (str class attr)
      - tools (list[dict] class attr)  — Anthropic tool defs
      - run() async method

    Optional overrides:
      - system_prompt property
      - on_success() / on_failure() hooks
    """

    name: str = "base_agent"
    description: str = "Base agent"
    tools: list[dict] = []

    # Notification routing — override per agent
    slack_webhook: Optional[str] = None   # None = use default from settings
    telegram_chat_id: Optional[str] = None  # None = use default from settings

    @abstractmethod
    async def run(self) -> AgentResult:
        """Execute the agent. Return an AgentResult."""
        ...

    @property
    def system_prompt(self) -> str:
        """Override to customise the agent's Claude system prompt."""
        return (
            f"You are {self.name}, an autonomous marketing agent. "
            f"Your job: {self.description}. "
            "Be concise. Use tools to fetch real data. "
            "Return structured, actionable output."
        )

    async def safe_run(self) -> AgentResult:
        """
        Wrapper that catches exceptions so scheduler never crashes.
        Logs and returns a failure AgentResult on error.
        """
        logger.info("Agent [%s] starting", self.name)
        try:
            result = await self.run()
            if result.success:
                logger.info("Agent [%s] completed: %s", self.name, result.summary[:80])
                await self.on_success(result)
            else:
                logger.warning("Agent [%s] ran but returned failure: %s", self.name, result.summary)
                await self.on_failure(result)
            return result
        except Exception as exc:
            logger.exception("Agent [%s] crashed", self.name)
            result = AgentResult(
                agent_name=self.name,
                success=False,
                summary=f"Agent crashed: {exc}",
                error=str(exc),
            )
            await self.on_failure(result)
            return result

    async def on_success(self, result: AgentResult) -> None:
        """Hook called after a successful run. Override for custom behaviour."""
        pass

    async def on_failure(self, result: AgentResult) -> None:
        """Hook called after a failed run. Override for custom behaviour."""
        pass

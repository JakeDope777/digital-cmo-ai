"""
AgentRunner — executes a single agent turn with the Claude tool-use loop.

Usage in agent definitions:
    result_text = await runner.run(
        system=self.system_prompt,
        user_message="Analyse campaign performance for last 24h.",
        tools=self.tools,
        tool_registry=self.tool_registry,
    )
"""
from __future__ import annotations

import logging
from typing import Any, Callable, Awaitable

from app.services.claude_client import claude

logger = logging.getLogger(__name__)

# Type alias for a tool registry — maps tool name → async callable
ToolRegistry = dict[str, Callable[[dict], Awaitable[Any]]]


class AgentRunner:
    """Stateless runner. Agents instantiate one and call execute()."""

    async def execute(
        self,
        system: str,
        user_message: str,
        tools: list[dict],
        tool_registry: ToolRegistry,
        history: list[dict] | None = None,
    ) -> str:
        """
        Run a full agentic turn via Claude.

        Args:
            system:        Claude system prompt (the agent's persona + instructions).
            user_message:  The task/trigger message for this run.
            tools:         Anthropic tool definitions list.
            tool_registry: Maps tool_name -> async function(inputs) -> result.
            history:       Optional prior conversation turns (for context continuity).

        Returns:
            Final text output from Claude after all tool calls resolve.
        """
        messages = list(history or [])
        messages.append({"role": "user", "content": user_message})

        async def dispatch(tool_name: str, tool_inputs: dict) -> Any:
            handler = tool_registry.get(tool_name)
            if not handler:
                raise ValueError(f"Unknown tool: {tool_name}")
            logger.debug("Dispatching tool: %s with inputs: %s", tool_name, tool_inputs)
            return await handler(tool_inputs)

        response = await claude.run_with_tools(
            system=system,
            messages=messages,
            tools=tools,
            tool_handler=dispatch,
        )
        return response


# Singleton
runner = AgentRunner()

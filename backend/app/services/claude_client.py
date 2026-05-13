"""
Claude API client with full tool-use loop.
Drop-in alongside the existing OpenAI client.
Set ANTHROPIC_API_KEY in your .env — already present in .env.example.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Callable, Awaitable

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

# Default model — override via ANTHROPIC_MODEL env var
DEFAULT_MODEL = getattr(settings, "ANTHROPIC_MODEL", "claude-sonnet-4-6")
MAX_TOKENS = 8096
MAX_TOOL_ROUNDS = 10  # safety cap on agentic loops


class ClaudeClient:
    """
    Thin async wrapper around the Anthropic SDK.
    Handles the multi-turn tool-use loop so agent definitions stay clean.
    """

    def __init__(self) -> None:
        self._client = anthropic.AsyncAnthropic(
            api_key=settings.ANTHROPIC_API_KEY,
        )

    # ------------------------------------------------------------------ #
    # Public: single-turn chat (no tools)                                 #
    # ------------------------------------------------------------------ #
    async def chat(
        self,
        system: str,
        messages: list[dict],
        model: str = DEFAULT_MODEL,
    ) -> str:
        response = await self._client.messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=messages,
        )
        return response.content[0].text

    # ------------------------------------------------------------------ #
    # Public: agentic loop with tool use                                  #
    # ------------------------------------------------------------------ #
    async def run_with_tools(
        self,
        system: str,
        messages: list[dict],
        tools: list[dict],
        tool_handler: Callable[[str, dict], Awaitable[Any]],
        model: str = DEFAULT_MODEL,
    ) -> str:
        """
        Runs the full Claude tool-use loop:
          1. Call Claude with tool definitions.
          2. If Claude requests a tool, call tool_handler(name, inputs).
          3. Feed results back. Repeat until stop_reason == 'end_turn'.

        Args:
            system:       System prompt string.
            messages:     Conversation history in OpenAI-style [{role, content}].
            tools:        List of Anthropic tool dicts (name, description, input_schema).
            tool_handler: Async callable that executes a tool by name.
            model:        Claude model string.

        Returns:
            Final text response from Claude.
        """
        conversation = list(messages)
        rounds = 0

        while rounds < MAX_TOOL_ROUNDS:
            rounds += 1
            response = await self._client.messages.create(
                model=model,
                max_tokens=MAX_TOKENS,
                system=system,
                messages=conversation,
                tools=tools,
            )

            # Collect any text blocks for potential early return
            text_blocks = [b for b in response.content if b.type == "text"]
            tool_blocks = [b for b in response.content if b.type == "tool_use"]

            if response.stop_reason == "end_turn" or not tool_blocks:
                return text_blocks[0].text if text_blocks else ""

            # Append Claude's full response turn (may contain both text + tool_use)
            conversation.append({"role": "assistant", "content": response.content})

            # Execute each tool and collect results
            tool_results = []
            for block in tool_blocks:
                logger.debug("Tool call: %s(%s)", block.name, block.input)
                try:
                    result = await tool_handler(block.name, block.input)
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(result, default=str),
                        }
                    )
                except Exception as exc:
                    logger.exception("Tool %s failed", block.name)
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": f"ERROR: {exc}",
                            "is_error": True,
                        }
                    )

            conversation.append({"role": "user", "content": tool_results})

        logger.warning("Tool loop hit MAX_TOOL_ROUNDS (%d) — returning last text", MAX_TOOL_ROUNDS)
        return text_blocks[0].text if text_blocks else "Max tool rounds reached."


# Singleton — import and reuse
claude = ClaudeClient()

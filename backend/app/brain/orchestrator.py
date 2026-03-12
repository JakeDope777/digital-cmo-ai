"""
Brain Orchestrator - the central coordinator of Digital CMO AI.

Receives user inputs, determines which module to invoke via the Router,
assembles context via the Prompt Builder, manages memory via the Memory Manager,
and dispatches tasks to the appropriate skill modules.

Improvements over the original:
- Integrates ``ConversationStateManager`` for multi-turn state tracking.
- Uses ``MemoryWatcher`` for automatic fact extraction.
- Uses ``ConversationSummarizer`` to compress old context.
- Passes conversation summaries to the prompt builder.
- Supports task slot-filling workflows.
- Richer response metadata.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional, Union

from .router import IntentRouter, SKILL_GENERAL
from .prompt_builder import PromptBuilder
from .memory_manager import MemoryManager
from .memory_watcher import MemoryWatcher
from .summarizer import ConversationSummarizer
from .conversation_state import (
    ConversationStateManager,
    ConversationState,
    ConversationPhase,
    TaskStatus,
    TASK_SLOT_TEMPLATES,
)
from .llm_router import LLMRouter, LLMRequest, LLMResponse, LLMProvider, get_llm_router
from ..core.config import settings


class LLMClient:
    """
    Adapter that wraps LLMRouter with a simple generate() interface.

    Used internally by Brain sub-components (IntentRouter, MemoryWatcher, etc.)
    that expect a single .generate(messages) method.  Routing intelligence
    (Ollama vs paid APIs) lives in LLMRouter.

    Accepts legacy kwargs (api_key, model, telegram_fallback_bot) for
    backwards compatibility with existing call sites.
    """

    def __init__(
        self,
        router: Optional[LLMRouter] = None,
        model: Optional[str] = None,
        telegram_fallback_bot: Optional[str] = None,
        # Legacy compat kwargs — accepted but routing is handled by LLMRouter
        api_key: Optional[str] = None,
        **kwargs: Any,
    ):
        self._router = router or get_llm_router()
        self.model = model  # optional model override
        self.telegram_fallback_bot = telegram_fallback_bot or getattr(
            settings, "TELEGRAM_FALLBACK_BOT", None
        )
        # Legacy compat attributes (kept so existing code that reads .api_key doesn't break)
        self.api_key = api_key or getattr(settings, "OPENAI_API_KEY", None)

    async def generate(self, messages: Union[list[dict], str]) -> str:
        """
        Send messages through LLMRouter and return the response text.

        Automatically routes to Ollama (free/local) for simple tasks,
        and paid APIs for complex ones. Falls back gracefully.
        """
        if isinstance(messages, str):
            messages = [{"role": "user", "content": messages}]

        available = self._router.available_providers()
        if not available:
            # No providers configured — demo mode
            user_msg = messages[-1].get("content", "") if messages else ""
            fallback_hint = (
                f"\n\nFallback: route tasks through {self.telegram_fallback_bot}."
                if self.telegram_fallback_bot else ""
            )
            return (
                f"[Demo Mode] Received: '{user_msg[:100]}...'\n\n"
                "Configure OPENAI_API_KEY or ensure Ollama is running to enable AI responses."
                f"{fallback_hint}"
            )

        try:
            request = LLMRequest(
                messages=messages,
                model=self.model,
                max_tokens=2000,
                temperature=0.7,
            )
            response = await self._router.complete(request)
            return response.content
        except Exception as exc:
            return f"[LLM Error: {exc}] All providers failed. Check logs for details."


class BrainOrchestrator:
    """
    Central orchestrator that coordinates all components of the Brain module.
    """

    # After this many turns, trigger conversation summarisation
    SUMMARIZE_THRESHOLD = 20
    KEEP_RECENT_MESSAGES = 10

    def __init__(
        self,
        llm_client: Optional[LLMClient] = None,
        memory_manager: Optional[MemoryManager] = None,
        state_manager: Optional[ConversationStateManager] = None,
        llm_router: Optional[LLMRouter] = None,
    ):
        # Use provided client, or build one wrapping the shared LLMRouter
        self.llm = llm_client or LLMClient(router=llm_router or get_llm_router())
        self.memory = memory_manager or MemoryManager()
        self.router = IntentRouter(llm_client=self.llm)
        self.prompt_builder = PromptBuilder()
        self.memory_watcher = MemoryWatcher(llm_client=self.llm)
        self.summarizer = ConversationSummarizer(llm_client=self.llm)
        self.state_manager = state_manager or ConversationStateManager()

        # Legacy in-memory conversation store (kept for backward compat)
        self._conversations: dict[str, list[dict]] = {}

        # Skill module registry
        self._skills: dict[str, Any] = {}

    def register_skill(self, skill_name: str, skill_instance: Any) -> None:
        """Register a skill module for the brain to invoke."""
        self._skills[skill_name] = skill_instance

    async def process_message(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        user_context: Optional[dict] = None,
    ) -> dict:
        """
        Process a user message through the full brain pipeline.

        Steps:
        1. Get or create conversation state.
        2. Classify intent via the Router.
        3. Check for active task slot-filling.
        4. Retrieve relevant memories from vector store.
        5. Summarise old conversation if needed.
        6. Build the prompt with all context layers.
        7. Generate a response via the LLM or skill module.
        8. Extract and store important facts.
        9. Update conversation state.
        10. Return the response with metadata.

        Args:
            message: The user's input text.
            conversation_id: Optional ID to continue an existing conversation.
            user_context: Additional context (user_id, project, etc.).

        Returns:
            Dict with reply, conversation_id, module_used, tokens_used,
            conversation_phase, and active_task info.
        """
        user_ctx = user_context or {}

        # ── Step 1: Conversation state ─────────────────────────────────
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        state = self.state_manager.get_or_create(
            conversation_id=conversation_id,
            user_id=user_ctx.get("user_id"),
        )
        state.add_message("user", message)

        # Legacy compat
        if conversation_id not in self._conversations:
            self._conversations[conversation_id] = []
        history = self._conversations[conversation_id]

        # ── Step 2: Classify intent ────────────────────────────────────
        classification = self.router.classify_with_confidence(message)
        intent = classification["skill"]
        confidence = classification["confidence"]
        state.current_module = intent

        # Update topic on first substantive message
        if state.topic is None and intent != SKILL_GENERAL:
            state.topic = intent.replace("_", " ").title()

        # ── Step 3: Check active task slot-filling ─────────────────────
        slot_filling_response = self._try_fill_slots(state, message)

        # ── Step 4: Retrieve relevant memories ─────────────────────────
        retrieved_memories = self.memory.retrieve_similar(message, k=5)
        memory_texts = [m["text"] for m in retrieved_memories if "text" in m]

        # ── Step 5: Summarise old conversation if needed ───────────────
        conversation_summary = state.summary
        if self.summarizer.should_summarize(len(state.messages), self.SUMMARIZE_THRESHOLD):
            older, recent = self.summarizer.split_conversation(
                state.messages, keep_recent=self.KEEP_RECENT_MESSAGES
            )
            if older:
                conversation_summary = self.summarizer.summarize(
                    older, existing_summary=state.summary
                )
                state.summary = conversation_summary

        # ── Step 6: Get structured knowledge ───────────────────────────
        project = user_ctx.get("project", "default")
        structured_knowledge = self.memory.get_project_context(project)
        structured_knowledge = {
            k: v for k, v in structured_knowledge.items() if v is not None
        }

        # ── Step 7: Build the prompt ───────────────────────────────────
        prompt_messages = self.prompt_builder.build(
            user_message=message,
            conversation_history=history[-self.KEEP_RECENT_MESSAGES * 2:],
            conversation_summary=conversation_summary,
            retrieved_memories=memory_texts,
            structured_knowledge=structured_knowledge,
            skill_context=intent,
        )

        # ── Step 8: Generate response ──────────────────────────────────
        response_text = ""

        # If we have a slot-filling response, use it
        if slot_filling_response:
            response_text = slot_filling_response

        # Check if a registered skill should handle this
        if not response_text and intent in self._skills and intent != SKILL_GENERAL:
            try:
                skill = self._skills[intent]
                skill_result = await skill.handle(message, user_ctx)
                response_text = skill_result.get("response", "")
            except Exception as e:
                response_text = f"[Skill Error: {str(e)}]"

        # Fall back to LLM
        if not response_text:
            response_text = await self.llm.generate(prompt_messages)

        # ── Step 9: Update state and history ───────────────────────────
        state.add_message("assistant", response_text)
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": response_text})

        # Keep legacy history manageable
        if len(history) > 40:
            self._conversations[conversation_id] = history[-40:]

        # Update conversation phase
        self.state_manager.update_phase(state)
        self.state_manager.save(state)

        # ── Step 10: Extract and store important facts ─────────────────
        recent_pair = [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response_text},
        ]
        facts = self.memory_watcher.extract_facts(
            recent_pair,
            conversation_id=conversation_id,
            user_id=user_ctx.get("user_id"),
        )
        for fact in facts:
            self.memory.store_embedding(fact["text"], metadata=fact["metadata"])

        # Also run the legacy watcher for backward compat
        snippets = self.memory.watch_conversation(recent_pair)
        for snippet in snippets:
            self.memory.store_embedding(
                snippet["text"],
                metadata={
                    "conversation_id": conversation_id,
                    "type": snippet["type"],
                    "timestamp": snippet["timestamp"],
                },
            )

        # ── Estimate token usage ───────────────────────────────────────
        tokens_used = self.prompt_builder.estimate_prompt_tokens(prompt_messages)
        tokens_used += len(response_text.split())

        # ── Build response ─────────────────────────────────────────────
        result = {
            "reply": response_text,
            "conversation_id": conversation_id,
            "module_used": intent,
            "classification_confidence": confidence,
            "classification_method": classification["method"],
            "tokens_used": tokens_used,
            "conversation_phase": state.phase.value,
            "turn_count": state.turn_count,
        }

        # Include active task info if present
        current_task = state.get_current_task()
        if current_task:
            result["active_task"] = {
                "task_id": current_task.task_id,
                "description": current_task.description,
                "status": current_task.status.value,
                "missing_slots": [
                    {"name": s.name, "description": s.description}
                    for s in current_task.missing_slots
                ],
            }

        return result

    # ------------------------------------------------------------------
    # Slot filling
    # ------------------------------------------------------------------

    def _try_fill_slots(self, state: ConversationState, message: str) -> Optional[str]:
        """
        If there is an active task with missing slots, try to fill them
        from the user's message.  Returns a follow-up question if slots
        remain, or None if no slot-filling is needed.
        """
        task = state.get_current_task()
        if task is None or not task.missing_slots:
            return None

        # Simple heuristic: assume the message fills the first missing slot
        first_missing = task.missing_slots[0]
        task.fill_slot(first_missing.name, message)
        task.updated_at = __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat()

        # Check if more slots are needed
        remaining = task.missing_slots
        if remaining:
            task.status = TaskStatus.WAITING_FOR_INPUT
            return (
                f"Got it! I've noted your {first_missing.name}: \"{message}\".\n\n"
                f"I still need the following information:\n"
                + "\n".join(f"- **{s.name}**: {s.description}" for s in remaining)
                + "\n\nPlease provide the next piece of information."
            )

        # All slots filled
        task.status = TaskStatus.IN_PROGRESS
        return None

    # ------------------------------------------------------------------
    # Task management helpers
    # ------------------------------------------------------------------

    def start_task(
        self,
        conversation_id: str,
        task_type: str,
        description: str = "",
    ) -> Optional[dict]:
        """
        Start a new task in the conversation using a slot template.

        Args:
            conversation_id: The conversation to add the task to.
            task_type: One of the keys in ``TASK_SLOT_TEMPLATES``.
            description: Human-readable task description.

        Returns:
            Task info dict, or None if the conversation doesn't exist.
        """
        state = self.state_manager.get(conversation_id)
        if state is None:
            return None

        slots = TASK_SLOT_TEMPLATES.get(task_type, [])
        module = self.router.classify_intent(description or task_type)
        task = state.start_task(description or task_type, module, slots)
        self.state_manager.save(state)

        return {
            "task_id": task.task_id,
            "description": task.description,
            "module": task.module,
            "status": task.status.value,
            "missing_slots": [
                {"name": s.name, "description": s.description}
                for s in task.missing_slots
            ],
        }

    # ------------------------------------------------------------------
    # Conversation management
    # ------------------------------------------------------------------

    def get_conversation(self, conversation_id: str) -> list[dict]:
        """Retrieve the conversation history for a given ID."""
        state = self.state_manager.get(conversation_id)
        if state:
            return state.messages
        return self._conversations.get(conversation_id, [])

    def get_conversation_state(self, conversation_id: str) -> Optional[dict]:
        """Retrieve the full conversation state as a dict."""
        state = self.state_manager.get(conversation_id)
        if state:
            return state.to_dict()
        return None

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a conversation from memory."""
        deleted = self.state_manager.delete(conversation_id)
        if conversation_id in self._conversations:
            del self._conversations[conversation_id]
            return True
        return deleted

    def list_conversations(self, user_id: Optional[str] = None) -> list[dict]:
        """List all conversations, optionally filtered by user_id."""
        return self.state_manager.list_conversations(user_id=user_id)

    def get_memory_stats(self) -> dict:
        """Return memory system statistics."""
        return self.memory.get_memory_stats()

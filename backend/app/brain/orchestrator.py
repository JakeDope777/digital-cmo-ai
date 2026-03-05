"""
Brain Orchestrator - the central coordinator of Digital CMO AI.

Receives user inputs, determines which module to invoke via the Router,
assembles context via the Prompt Builder, manages memory via the Memory Manager,
and dispatches tasks to the appropriate skill modules.
"""

import uuid
from typing import Optional, Any

from .router import IntentRouter, SKILL_GENERAL
from .prompt_builder import PromptBuilder
from .memory_manager import MemoryManager


class LLMClient:
    """
    Wrapper around an LLM API (OpenAI-compatible).
    Replace with actual implementation when API keys are configured.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4"):
        self.api_key = api_key
        self.model = model
        self._client = None

    async def generate(self, messages: list[dict]) -> str:
        """
        Send messages to the LLM and return the assistant's response.

        If no API key is configured, returns a placeholder response.
        """
        if self.api_key:
            try:
                from openai import AsyncOpenAI

                if self._client is None:
                    self._client = AsyncOpenAI(api_key=self.api_key)
                response = await self._client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                return f"[LLM Error: {str(e)}] Please configure a valid API key."
        else:
            # Placeholder response for demo/development
            user_msg = messages[-1]["content"] if messages else ""
            return (
                f"[Demo Mode] I received your message about: '{user_msg[:100]}...'\n\n"
                "To enable full AI responses, please configure your OPENAI_API_KEY "
                "in the .env file. The system has routed your request and is ready "
                "to process it once an LLM provider is connected."
            )


class BrainOrchestrator:
    """
    Central orchestrator that coordinates all components of the Brain module.
    """

    def __init__(
        self,
        llm_client: Optional[LLMClient] = None,
        memory_manager: Optional[MemoryManager] = None,
    ):
        self.llm = llm_client or LLMClient()
        self.memory = memory_manager or MemoryManager()
        self.router = IntentRouter(llm_client=self.llm)
        self.prompt_builder = PromptBuilder()

        # Conversation store (in-memory for MVP; persisted via DB in production)
        self._conversations: dict[str, list[dict]] = {}

        # Skill module registry
        self._skills: dict[str, Any] = {}

    def register_skill(self, skill_name: str, skill_instance: Any):
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
        1. Classify intent via the Router.
        2. Retrieve relevant memories.
        3. Build the prompt with all context layers.
        4. Generate a response via the LLM.
        5. Watch the conversation for important information.
        6. Return the response with metadata.

        Args:
            message: The user's input text.
            conversation_id: Optional ID to continue an existing conversation.
            user_context: Additional context (user_id, project, etc.).

        Returns:
            Dict with reply, conversation_id, module_used, and tokens_used.
        """
        # Ensure conversation ID
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Get or create conversation history
        if conversation_id not in self._conversations:
            self._conversations[conversation_id] = []
        history = self._conversations[conversation_id]

        # Step 1: Classify intent
        intent = self.router.classify_intent(message)

        # Step 2: Retrieve relevant memories
        retrieved_memories = self.memory.retrieve_similar(message, k=5)
        memory_texts = [m["text"] for m in retrieved_memories if "text" in m]

        # Step 3: Get structured knowledge
        project = (user_context or {}).get("project", "default")
        structured_knowledge = self.memory.get_project_context(project)
        # Filter out None values
        structured_knowledge = {
            k: v for k, v in structured_knowledge.items() if v is not None
        }

        # Step 4: Build the prompt
        skill_context = f"Routing to: {intent}"
        messages = self.prompt_builder.build(
            user_message=message,
            conversation_history=history,
            retrieved_memories=memory_texts,
            structured_knowledge=structured_knowledge,
            skill_context=skill_context,
        )

        # Step 5: Check if a registered skill should handle this
        response_text = ""
        if intent in self._skills and intent != SKILL_GENERAL:
            try:
                skill = self._skills[intent]
                skill_result = await skill.handle(message, user_context or {})
                response_text = skill_result.get("response", "")
            except Exception as e:
                response_text = f"[Skill Error: {str(e)}]"

        # If no skill handled it, or for general queries, use the LLM
        if not response_text:
            response_text = await self.llm.generate(messages)

        # Step 6: Update conversation history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": response_text})

        # Keep history manageable
        if len(history) > 40:
            self._conversations[conversation_id] = history[-40:]

        # Step 7: Watch conversation for important information
        snippets = self.memory.watch_conversation(history[-2:])
        for snippet in snippets:
            self.memory.store_embedding(
                snippet["text"],
                metadata={
                    "conversation_id": conversation_id,
                    "type": snippet["type"],
                    "timestamp": snippet["timestamp"],
                },
            )

        # Estimate token usage (simplified)
        tokens_used = len(message.split()) + len(response_text.split())

        return {
            "reply": response_text,
            "conversation_id": conversation_id,
            "module_used": intent,
            "tokens_used": tokens_used,
        }

    def get_conversation(self, conversation_id: str) -> list[dict]:
        """Retrieve the conversation history for a given ID."""
        return self._conversations.get(conversation_id, [])

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a conversation from memory."""
        if conversation_id in self._conversations:
            del self._conversations[conversation_id]
            return True
        return False

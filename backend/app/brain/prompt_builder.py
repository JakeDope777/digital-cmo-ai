"""
Prompt Builder - assembles structured prompts for the LLM.

Injects relevant context from:
- System instructions
- Conversation history (short-term)
- Retrieved memories from vector store (medium-term)
- Structured knowledge from persistent folders
- Database query results (long-term)
"""

from typing import Optional


SYSTEM_INSTRUCTION = """You are the Digital CMO AI, an AI-powered chief marketing officer.
You help users plan, execute, and analyse marketing campaigns. You have access to
business analysis, creative design, CRM management, analytics, and integration tools.

Guidelines:
- Be professional, concise, and data-driven.
- When providing analysis, cite sources where possible.
- Respect brand guidelines stored in memory.
- If you are unsure, ask clarifying questions.
- Always consider GDPR and privacy regulations.
"""


class PromptBuilder:
    """
    Constructs composite prompts by combining system instructions,
    conversation history, retrieved memories, structured knowledge,
    and database query results.
    """

    def __init__(self, system_instruction: Optional[str] = None):
        self.system_instruction = system_instruction or SYSTEM_INSTRUCTION

    def build(
        self,
        user_message: str,
        conversation_history: Optional[list[dict]] = None,
        retrieved_memories: Optional[list[str]] = None,
        structured_knowledge: Optional[dict[str, str]] = None,
        db_results: Optional[list[dict]] = None,
        skill_context: Optional[str] = None,
    ) -> list[dict]:
        """
        Build a list of messages suitable for an OpenAI-compatible chat API.

        Args:
            user_message: The current user input.
            conversation_history: List of prior messages [{role, content}].
            retrieved_memories: Top-k relevant snippets from vector store.
            structured_knowledge: Key-value pairs from persistent folders.
            db_results: Rows returned from SQLite queries.
            skill_context: Additional context about the target skill module.

        Returns:
            A list of message dicts with 'role' and 'content' keys.
        """
        messages: list[dict] = []

        # 1. System instructions
        system_parts = [self.system_instruction]

        if skill_context:
            system_parts.append(f"\n[Active Module]: {skill_context}")

        if structured_knowledge:
            knowledge_text = "\n[Structured Knowledge]:\n"
            for key, value in structured_knowledge.items():
                knowledge_text += f"- {key}: {value}\n"
            system_parts.append(knowledge_text)

        if retrieved_memories:
            memory_text = "\n[Retrieved Memories]:\n"
            for i, mem in enumerate(retrieved_memories, 1):
                memory_text += f"{i}. {mem}\n"
            system_parts.append(memory_text)

        if db_results:
            db_text = "\n[Database Results]:\n"
            for row in db_results[:10]:  # Limit to avoid token overflow
                db_text += f"- {row}\n"
            system_parts.append(db_text)

        messages.append({"role": "system", "content": "\n".join(system_parts)})

        # 2. Conversation history (short-term context)
        if conversation_history:
            for msg in conversation_history[-20:]:  # Keep last 20 messages
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })

        # 3. Current user message
        messages.append({"role": "user", "content": user_message})

        return messages

    def build_skill_prompt(
        self,
        skill_name: str,
        task_description: str,
        data: Optional[dict] = None,
    ) -> list[dict]:
        """
        Build a prompt specifically for a skill module to process.

        Args:
            skill_name: Name of the skill module.
            task_description: What the skill should do.
            data: Additional data for the skill to use.

        Returns:
            A list of message dicts.
        """
        system_msg = (
            f"You are the {skill_name} specialist within Digital CMO AI. "
            f"Complete the following task professionally and thoroughly."
        )
        user_content = task_description
        if data:
            user_content += f"\n\nAdditional data:\n{data}"

        return [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_content},
        ]

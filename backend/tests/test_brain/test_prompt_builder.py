"""
Unit tests for the Brain Prompt Builder.
"""

import pytest
from app.brain.prompt_builder import PromptBuilder


@pytest.fixture
def builder():
    return PromptBuilder()


class TestPromptBuilder:
    """Tests for prompt construction logic."""

    def test_basic_prompt_structure(self, builder):
        messages = builder.build("Hello")
        assert len(messages) >= 2
        assert messages[0]["role"] == "system"
        assert messages[-1]["role"] == "user"
        assert messages[-1]["content"] == "Hello"

    def test_system_instruction_included(self, builder):
        messages = builder.build("Test")
        assert "Digital CMO AI" in messages[0]["content"]

    def test_conversation_history_injected(self, builder):
        history = [
            {"role": "user", "content": "Previous question"},
            {"role": "assistant", "content": "Previous answer"},
        ]
        messages = builder.build("New question", conversation_history=history)
        contents = [m["content"] for m in messages]
        assert "Previous question" in contents
        assert "Previous answer" in contents

    def test_retrieved_memories_injected(self, builder):
        memories = ["Brand voice is professional", "Target audience is CTOs"]
        messages = builder.build("Write copy", retrieved_memories=memories)
        system_content = messages[0]["content"]
        assert "Brand voice is professional" in system_content

    def test_structured_knowledge_injected(self, builder):
        knowledge = {"goals": "Increase revenue by 20%", "preferences": "Use formal tone"}
        messages = builder.build("Plan campaign", structured_knowledge=knowledge)
        system_content = messages[0]["content"]
        assert "Increase revenue by 20%" in system_content

    def test_db_results_injected(self, builder):
        db_results = [{"name": "Campaign A", "status": "active"}]
        messages = builder.build("Show campaigns", db_results=db_results)
        system_content = messages[0]["content"]
        assert "Campaign A" in system_content

    def test_skill_context_injected(self, builder):
        messages = builder.build("Analyse market", skill_context="business_analysis")
        system_content = messages[0]["content"]
        assert "business_analysis" in system_content

    def test_history_truncation(self, builder):
        history = [{"role": "user", "content": f"Message {i}"} for i in range(50)]
        messages = builder.build("Latest", conversation_history=history)
        # System + last 20 history messages + current user message
        assert len(messages) <= 22

    def test_skill_prompt_builder(self, builder):
        messages = builder.build_skill_prompt(
            "Business Analysis", "Perform a SWOT analysis"
        )
        assert len(messages) == 2
        assert "Business Analysis" in messages[0]["content"]
        assert "SWOT" in messages[1]["content"]

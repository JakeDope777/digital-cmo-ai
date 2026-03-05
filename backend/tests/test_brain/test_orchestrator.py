"""
Unit tests for the Brain Orchestrator.
"""

import pytest
from app.brain.orchestrator import BrainOrchestrator, LLMClient
from app.brain.memory_manager import MemoryManager


@pytest.fixture
def orchestrator(temp_memory_dir):
    llm = LLMClient()  # No API key = demo mode
    memory = MemoryManager(memory_base_path=temp_memory_dir, db_path=":memory:")
    return BrainOrchestrator(llm_client=llm, memory_manager=memory)


class TestBrainOrchestrator:
    """Tests for the central orchestrator."""

    @pytest.mark.asyncio
    async def test_process_message_returns_reply(self, orchestrator):
        result = await orchestrator.process_message("Hello, what can you do?")
        assert "reply" in result
        assert "conversation_id" in result
        assert result["reply"] != ""

    @pytest.mark.asyncio
    async def test_conversation_id_persisted(self, orchestrator):
        result1 = await orchestrator.process_message("First message")
        conv_id = result1["conversation_id"]
        result2 = await orchestrator.process_message("Second message", conversation_id=conv_id)
        assert result2["conversation_id"] == conv_id

    @pytest.mark.asyncio
    async def test_module_routing(self, orchestrator):
        result = await orchestrator.process_message("Do a SWOT analysis for our product")
        assert result["module_used"] == "business_analysis"

    @pytest.mark.asyncio
    async def test_general_routing(self, orchestrator):
        result = await orchestrator.process_message("Hello there")
        assert result["module_used"] == "general"

    @pytest.mark.asyncio
    async def test_tokens_used_tracked(self, orchestrator):
        result = await orchestrator.process_message("Write some marketing copy")
        assert result["tokens_used"] > 0

    def test_get_conversation_empty(self, orchestrator):
        history = orchestrator.get_conversation("nonexistent")
        assert history == []

    @pytest.mark.asyncio
    async def test_clear_conversation(self, orchestrator):
        result = await orchestrator.process_message("Test message")
        conv_id = result["conversation_id"]
        assert orchestrator.clear_conversation(conv_id) is True
        assert orchestrator.get_conversation(conv_id) == []

    def test_register_skill(self, orchestrator):
        class MockSkill:
            async def handle(self, msg, ctx):
                return {"response": "mock response"}

        orchestrator.register_skill("test_skill", MockSkill())
        assert "test_skill" in orchestrator._skills


class TestLLMClient:
    """Tests for the LLM client wrapper."""

    @pytest.mark.asyncio
    async def test_demo_mode_response(self):
        client = LLMClient()  # No API key
        messages = [{"role": "user", "content": "Test"}]
        response = await client.generate(messages)
        assert "Demo Mode" in response

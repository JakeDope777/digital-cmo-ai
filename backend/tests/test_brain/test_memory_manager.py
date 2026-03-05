"""
Unit tests for the Brain Memory Manager.
"""

import os
import pytest
from app.brain.memory_manager import MemoryManager


@pytest.fixture
def memory(temp_memory_dir):
    return MemoryManager(memory_base_path=temp_memory_dir, db_path=":memory:")


class TestMemoryManagerFolders:
    """Tests for persistent folder operations (Layer 2)."""

    def test_folder_structure_created(self, memory, temp_memory_dir):
        assert os.path.isdir(os.path.join(temp_memory_dir, "projects", "default"))
        assert os.path.isdir(os.path.join(temp_memory_dir, "workspace"))
        assert os.path.isdir(os.path.join(temp_memory_dir, "preferences"))
        assert os.path.isdir(os.path.join(temp_memory_dir, "knowledge_base"))

    def test_save_and_read(self, memory):
        memory.save_to_folder("workspace/test.md", "Hello World")
        content = memory.read_from_folder("workspace/test.md")
        assert content == "Hello World"

    def test_save_append(self, memory):
        memory.save_to_folder("workspace/log.md", "Line 1")
        memory.save_to_folder("workspace/log.md", "Line 2", append=True)
        content = memory.read_from_folder("workspace/log.md")
        assert "Line 1" in content
        assert "Line 2" in content

    def test_read_nonexistent_returns_none(self, memory):
        result = memory.read_from_folder("nonexistent/file.md")
        assert result is None

    def test_list_folder(self, memory):
        memory.save_to_folder("projects/test/goals.md", "Goal 1")
        memory.save_to_folder("projects/test/decisions.md", "Decision 1")
        files = memory.list_folder("projects/test")
        assert len(files) == 2

    def test_delete_file(self, memory):
        memory.save_to_folder("workspace/temp.md", "Temporary")
        assert memory.delete_from_folder("workspace/temp.md") is True
        assert memory.read_from_folder("workspace/temp.md") is None

    def test_delete_nonexistent(self, memory):
        assert memory.delete_from_folder("nonexistent.md") is False


class TestMemoryManagerConvenience:
    """Tests for convenience methods."""

    def test_save_decision(self, memory):
        path = memory.save_decision("default", "Use FastAPI", "Better async support")
        content = memory.read_from_folder("projects/default/decisions.md")
        assert "Use FastAPI" in content
        assert "Better async support" in content

    def test_save_goal(self, memory):
        memory.save_goal("default", "Launch MVP in 2 weeks")
        content = memory.read_from_folder("projects/default/goals.md")
        assert "Launch MVP in 2 weeks" in content

    def test_update_status(self, memory):
        memory.update_status("All modules scaffolded")
        content = memory.read_from_folder("workspace/current_status.md")
        assert "All modules scaffolded" in content

    def test_get_project_context(self, memory):
        memory.save_goal("default", "Test goal")
        ctx = memory.get_project_context("default")
        assert "goals" in ctx
        assert ctx["goals"] is not None


class TestMemoryManagerVectorFallback:
    """Tests for the vector store fallback (Layer 3)."""

    def test_store_embedding_fallback(self, memory):
        result = memory.store_embedding("Test fact about marketing", {"tag": "test"})
        assert result is True

    def test_retrieve_similar_fallback(self, memory):
        memory.store_embedding("Marketing budget is $10,000", {"tag": "budget"})
        memory.store_embedding("Target audience is CTOs", {"tag": "audience"})
        results = memory.retrieve_similar("budget", k=5)
        assert len(results) >= 1
        assert any("budget" in r.get("text", "").lower() for r in results)

    def test_watch_conversation(self, memory):
        conversation = [
            {"role": "user", "content": "Our brand guideline is to use formal tone"},
            {"role": "assistant", "content": "Noted, I will use formal tone."},
            {"role": "user", "content": "What is the weather?"},
        ]
        snippets = memory.watch_conversation(conversation)
        assert len(snippets) >= 1  # "guideline" keyword should trigger extraction

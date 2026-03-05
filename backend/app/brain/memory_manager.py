"""
Memory Manager - handles the four memory layers:

1. Short-term: conversation context (managed externally via context window)
2. Persistent folders: structured files under memory/
3. Medium-term: vector embeddings for similarity search
4. Long-term: SQLite for structured data queries

Provides APIs to store decisions, update preferences, and retrieve
relevant content from any layer.
"""

import os
import json
import sqlite3
from pathlib import Path
from typing import Optional, Any
from datetime import datetime, timezone

from ..core.config import settings


class MemoryManager:
    """
    Unified interface for all four memory layers.
    """

    def __init__(
        self,
        memory_base_path: Optional[str] = None,
        db_path: Optional[str] = None,
        vector_store=None,
    ):
        self.memory_base_path = Path(memory_base_path or settings.MEMORY_BASE_PATH)
        self.db_path = db_path or settings.DATABASE_URL.replace("sqlite:///", "")
        self.vector_store = vector_store
        self._ensure_folder_structure()

    def _ensure_folder_structure(self):
        """Create the standard memory folder structure if it doesn't exist."""
        folders = [
            self.memory_base_path / "projects" / "default",
            self.memory_base_path / "workspace",
            self.memory_base_path / "preferences",
            self.memory_base_path / "knowledge_base",
        ]
        for folder in folders:
            folder.mkdir(parents=True, exist_ok=True)

    # ── Layer 2: Persistent Folders ──────────────────────────────────

    def save_to_folder(self, file_path: str, content: str, append: bool = False) -> str:
        """
        Save content to a structured memory file.

        Args:
            file_path: Relative path within the memory folder (e.g., 'projects/default/goals.md').
            content: Text content to write.
            append: If True, append to existing file; otherwise overwrite.

        Returns:
            The absolute path of the written file.
        """
        full_path = self.memory_base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        mode = "a" if append else "w"
        with open(full_path, mode, encoding="utf-8") as f:
            if append:
                f.write(f"\n\n---\n_Updated: {datetime.now(timezone.utc).isoformat()}_\n\n")
            f.write(content)

        return str(full_path)

    def read_from_folder(self, file_path: str) -> Optional[str]:
        """
        Read content from a structured memory file.

        Args:
            file_path: Relative path within the memory folder.

        Returns:
            File content as a string, or None if the file doesn't exist.
        """
        full_path = self.memory_base_path / file_path
        if full_path.exists():
            return full_path.read_text(encoding="utf-8")
        return None

    def list_folder(self, folder_path: str = "") -> list[str]:
        """
        List all files in a memory subfolder.

        Args:
            folder_path: Relative path within the memory folder.

        Returns:
            List of relative file paths.
        """
        target = self.memory_base_path / folder_path
        if not target.exists():
            return []
        files = []
        for item in target.rglob("*"):
            if item.is_file():
                files.append(str(item.relative_to(self.memory_base_path)))
        return sorted(files)

    def delete_from_folder(self, file_path: str) -> bool:
        """Delete a memory file. Returns True if the file was deleted."""
        full_path = self.memory_base_path / file_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False

    # ── Layer 3: Medium-term (Vector Store) ──────────────────────────

    def watch_conversation(self, conversation: list[dict]) -> list[dict]:
        """
        Analyse a conversation and extract salient information for embedding.

        Args:
            conversation: List of message dicts with 'role' and 'content'.

        Returns:
            List of extracted snippets with metadata.
        """
        snippets = []
        for msg in conversation:
            content = msg.get("content", "")
            # Extract messages that contain decisions, instructions, or key facts
            if any(
                keyword in content.lower()
                for keyword in [
                    "decide", "decision", "goal", "prefer", "always",
                    "never", "important", "remember", "brand", "guideline",
                    "budget", "target", "deadline", "strategy",
                ]
            ):
                snippets.append({
                    "text": content,
                    "role": msg.get("role", "unknown"),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "type": "conversation_extract",
                })
        return snippets

    def store_embedding(self, text: str, metadata: Optional[dict] = None) -> bool:
        """
        Store a text embedding in the vector database.

        Args:
            text: The text to embed and store.
            metadata: Additional metadata (conversation_id, tags, source).

        Returns:
            True if successfully stored, False otherwise.
        """
        if self.vector_store is None:
            # Fallback: store as a JSON line in a local file
            fallback_path = self.memory_base_path / "workspace" / "embeddings_log.jsonl"
            entry = {
                "text": text,
                "metadata": metadata or {},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            with open(fallback_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
            return True

        try:
            self.vector_store.add(text, metadata=metadata)
            return True
        except Exception:
            return False

    def retrieve_similar(self, query: str, k: int = 5) -> list[dict]:
        """
        Retrieve the top-k most similar memory snippets from the vector store.

        Args:
            query: The search query text.
            k: Number of results to return.

        Returns:
            List of dicts with 'text' and 'score' keys.
        """
        if self.vector_store is None:
            # Fallback: simple keyword search over the embeddings log
            return self._fallback_search(query, k)

        try:
            results = self.vector_store.search(query, k=k)
            return results
        except Exception:
            return self._fallback_search(query, k)

    def _fallback_search(self, query: str, k: int) -> list[dict]:
        """Simple keyword-based fallback search over stored snippets."""
        log_path = self.memory_base_path / "workspace" / "embeddings_log.jsonl"
        if not log_path.exists():
            return []

        results = []
        query_terms = set(query.lower().split())
        with open(log_path, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    text = entry.get("text", "").lower()
                    score = sum(1 for term in query_terms if term in text)
                    if score > 0:
                        results.append({"text": entry["text"], "score": score})
                except json.JSONDecodeError:
                    continue

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:k]

    # ── Layer 4: Long-term (SQLite) ──────────────────────────────────

    def query_sql(self, sql: str, params: Optional[tuple] = None) -> list[dict]:
        """
        Execute a read-only SQL query against the SQLite database.

        Args:
            sql: The SQL query string.
            params: Optional tuple of query parameters.

        Returns:
            List of row dicts.
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            return [{"error": str(e)}]

    # ── Convenience Methods ──────────────────────────────────────────

    def save_decision(self, project: str, decision: str, reasoning: str) -> str:
        """Save a key decision to the project's decisions file."""
        content = f"## Decision\n{decision}\n\n**Reasoning:** {reasoning}\n"
        return self.save_to_folder(
            f"projects/{project}/decisions.md", content, append=True
        )

    def save_goal(self, project: str, goal: str) -> str:
        """Save a goal to the project's goals file."""
        content = f"- {goal}\n"
        return self.save_to_folder(
            f"projects/{project}/goals.md", content, append=True
        )

    def update_status(self, status: str) -> str:
        """Update the current workspace status."""
        content = f"# Current Status\n\n{status}\n\n_Last updated: {datetime.now(timezone.utc).isoformat()}_\n"
        return self.save_to_folder("workspace/current_status.md", content)

    def get_project_context(self, project: str = "default") -> dict[str, Optional[str]]:
        """Retrieve all context for a given project."""
        return {
            "goals": self.read_from_folder(f"projects/{project}/goals.md"),
            "decisions": self.read_from_folder(f"projects/{project}/decisions.md"),
            "status": self.read_from_folder("workspace/current_status.md"),
            "preferences": self.read_from_folder("preferences/coding_style.md"),
            "knowledge": self.read_from_folder("knowledge_base/reference_data.md"),
        }

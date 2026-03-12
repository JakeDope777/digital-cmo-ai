"""
Tests for the chat endpoint.

Uses mocks aggressively — no real OpenAI calls, no real Redis.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import status


# Canned brain response returned by all mocked orchestrator calls
CANNED_BRAIN_RESPONSE = {
    "reply": "Hello! I am your Digital CMO AI assistant.",
    "conversation_id": "test-conv-id-1234",
    "module_used": "general",
    "tokens_used": 42,
}


class TestChatSendsMessage:
    """POST /chat — happy-path tests with mocked Brain."""

    def test_chat_sends_message_and_returns_expected_shape(self, client, auth_headers):
        """Mocked brain call returns a well-shaped ChatResponse."""
        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(return_value=CANNED_BRAIN_RESPONSE),
        ):
            response = client.post(
                "/chat",
                json={"message": "What is my CAC this month?"},
                headers=auth_headers,
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "reply" in data
        assert "conversation_id" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 0

    def test_chat_passes_conversation_id(self, client, auth_headers):
        """When a conversation_id is sent, it appears in the response."""
        conv_id = "my-existing-conv-abc"
        mock_response = {**CANNED_BRAIN_RESPONSE, "conversation_id": conv_id}

        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(return_value=mock_response),
        ):
            response = client.post(
                "/chat",
                json={"message": "Continue our chat", "conversation_id": conv_id},
                headers=auth_headers,
            )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["conversation_id"] == conv_id

    def test_chat_missing_message_field(self, client, auth_headers):
        """Sending an empty body should return 422 Unprocessable Entity."""
        response = client.post("/chat", json={}, headers=auth_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_chat_module_used_field_present(self, client, auth_headers):
        """module_used and tokens_used should be present in response."""
        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(return_value=CANNED_BRAIN_RESPONSE),
        ):
            response = client.post(
                "/chat",
                json={"message": "Analyse my marketing funnel"},
                headers=auth_headers,
            )

        data = response.json()
        assert "module_used" in data
        assert "tokens_used" in data
        assert isinstance(data["tokens_used"], int)


class TestChatRateLimited:
    """Tests that simulate a rate-limited Redis environment."""

    def test_chat_rate_limited_returns_429(self, client, auth_headers):
        """If the brain/rate-limiter raises an HTTP 429, the endpoint should surface it."""
        from fastapi import HTTPException

        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(
                side_effect=HTTPException(
                    status_code=429, detail="Rate limit exceeded"
                )
            ),
        ):
            response = client.post(
                "/chat",
                json={"message": "Send another message"},
                headers=auth_headers,
            )

        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_chat_brain_error_returns_500(self, client, auth_headers):
        """If the brain raises an unexpected exception, the endpoint should return 500."""
        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(side_effect=RuntimeError("LLM exploded")),
        ):
            response = client.post(
                "/chat",
                json={"message": "Trigger an error"},
                headers=auth_headers,
            )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


class TestChatRequiresAuth:
    """Ensure /chat is protected and cannot be called without auth."""

    def test_chat_requires_auth_no_header(self, client):
        """No Authorization header → 401."""
        response = client.post(
            "/chat",
            json={"message": "Am I authenticated?"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_chat_requires_auth_bad_token(self, client):
        """Garbage token → 401."""
        response = client.post(
            "/chat",
            json={"message": "Am I authenticated?"},
            headers={"Authorization": "Bearer garbage.token.here"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_chat_requires_verified_user(self, client, unverified_auth_headers):
        """An unverified user should be denied — 401 or 403."""
        with patch(
            "app.api.chat._brain.process_message",
            new=AsyncMock(return_value=CANNED_BRAIN_RESPONSE),
        ):
            response = client.post(
                "/chat",
                json={"message": "Can I chat without verifying?"},
                headers=unverified_auth_headers,
            )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

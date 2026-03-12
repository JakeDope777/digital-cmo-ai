"""
Tests for authentication endpoints.

Covers: signup, login, token refresh, duplicate emails, wrong passwords,
and protected endpoint access without token.
"""

import pytest
from fastapi import status


class TestRegister:
    """POST /auth/signup tests."""

    def test_register_success(self, client):
        """Happy-path registration returns 201 with access + refresh tokens."""
        response = client.post(
            "/auth/signup",
            json={"email": "newuser@example.com", "password": "securepassword123"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client):
        """Registering the same email twice returns 409 Conflict."""
        payload = {"email": "duplicate@example.com", "password": "password123"}
        first = client.post("/auth/signup", json=payload)
        assert first.status_code == status.HTTP_201_CREATED

        second = client.post("/auth/signup", json=payload)
        assert second.status_code == status.HTTP_409_CONFLICT
        assert "already" in second.json()["detail"].lower()

    def test_register_invalid_email(self, client):
        """Invalid email format should return 422 Unprocessable Entity."""
        response = client.post(
            "/auth/signup",
            json={"email": "not-an-email", "password": "password123"},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_missing_password(self, client):
        """Missing password field should return 422."""
        response = client.post(
            "/auth/signup",
            json={"email": "nopass@example.com"},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogin:
    """POST /auth/login tests."""

    def _create_user(self, client, email: str, password: str):
        """Helper: register a user and return the signup response."""
        return client.post("/auth/signup", json={"email": email, "password": password})

    def test_login_success(self, client):
        """Correct credentials return access + refresh tokens."""
        email = "logintest@example.com"
        password = "correctpass123"
        self._create_user(client, email, password)

        response = client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        """Wrong password returns 401 Unauthorized."""
        email = "wrongpass@example.com"
        self._create_user(client, email, "correctpass123")

        response = client.post(
            "/auth/login",
            json={"email": email, "password": "wrongpassword"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_unknown_email(self, client):
        """Login with an email that was never registered returns 401."""
        response = client.post(
            "/auth/login",
            json={"email": "ghost@example.com", "password": "anything"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, client):
        """Login without required fields returns 422."""
        response = client.post("/auth/login", json={"email": "only@example.com"})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestRefreshToken:
    """POST /auth/refresh tests."""

    def test_refresh_token(self, client):
        """A valid refresh token returns a new access token."""
        # Register + login to get tokens
        email = "refresh@example.com"
        payload = {"email": email, "password": "refreshpass123"}
        client.post("/auth/signup", json=payload)
        login_resp = client.post("/auth/login", json=payload)
        assert login_resp.status_code == 200

        refresh_token = login_resp.json()["refresh_token"]
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data

    def test_refresh_with_invalid_token(self, client):
        """An invalid/garbage refresh token should return 401 or 422."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "this.is.not.valid"},
        )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class TestProtectedEndpoints:
    """Tests for endpoints that require authentication."""

    def test_protected_endpoint_without_token(self, client):
        """Hitting a protected endpoint without a token returns 401."""
        response = client.post(
            "/chat",
            json={"message": "hello"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_with_garbage_token(self, client):
        """Sending a malformed Bearer token returns 401."""
        response = client.post(
            "/chat",
            json={"message": "hello"},
            headers={"Authorization": "Bearer not.a.real.token"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_with_valid_token(self, client, auth_headers):
        """A verified user with a valid token can call a protected endpoint."""
        # /chat requires email_verified; auth_headers fixture ensures that
        response = client.post(
            "/chat",
            json={"message": "What is your name?"},
            headers=auth_headers,
        )
        # Accept 200 (got response) or 429 (rate-limited) — not 401
        assert response.status_code not in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

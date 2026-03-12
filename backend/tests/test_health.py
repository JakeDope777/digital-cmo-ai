"""
Tests for health and metrics endpoints.

These tests are fast and have no external dependencies.
Redis/DB checks are mocked to prevent network calls.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch
from fastapi import status


class TestHealthEndpoint:
    """GET /health tests."""

    def test_health_returns_ok(self, client):
        """Health endpoint returns 200 with status field."""
        # Patch both async checks so we don't need Redis or a real DB
        with (
            patch(
                "app.main._check_redis",
                new=AsyncMock(return_value={"status": "ok"}),
            ),
            patch(
                "app.main._check_db",
                new=AsyncMock(return_value={"status": "ok"}),
            ),
        ):
            response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "status" in data
        assert data["status"] in ("healthy", "degraded")

    def test_health_returns_degraded_when_redis_down(self, client):
        """Health endpoint returns 503 when Redis is unreachable."""
        with (
            patch(
                "app.main._check_redis",
                new=AsyncMock(return_value={"status": "error", "detail": "Connection refused"}),
            ),
            patch(
                "app.main._check_db",
                new=AsyncMock(return_value={"status": "ok"}),
            ),
        ):
            response = client.get("/health")

        # Should be 503 when redis is down
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        data = response.json()
        assert data["status"] == "degraded"

    def test_health_contains_uptime(self, client):
        """Health response should include uptime_seconds."""
        with (
            patch("app.main._check_redis", new=AsyncMock(return_value={"status": "ok"})),
            patch("app.main._check_db", new=AsyncMock(return_value={"status": "ok"})),
        ):
            response = client.get("/health")

        data = response.json()
        assert "uptime_seconds" in data
        assert isinstance(data["uptime_seconds"], (int, float))
        assert data["uptime_seconds"] >= 0

    def test_health_contains_checks_dict(self, client):
        """Health response should contain a checks dict with redis and database keys."""
        with (
            patch("app.main._check_redis", new=AsyncMock(return_value={"status": "ok"})),
            patch("app.main._check_db", new=AsyncMock(return_value={"status": "ok"})),
        ):
            response = client.get("/health")

        data = response.json()
        assert "checks" in data
        checks = data["checks"]
        assert "redis" in checks
        assert "database" in checks


class TestMetricsEndpoint:
    """GET /metrics tests — Prometheus text format."""

    def test_metrics_endpoint_returns_prometheus_format(self, client):
        """Metrics endpoint responds with Prometheus-compatible text/plain content."""
        response = client.get("/metrics")

        assert response.status_code == status.HTTP_200_OK
        # Prometheus exposition format content type
        content_type = response.headers.get("content-type", "")
        assert "text/plain" in content_type

        body = response.text
        # Should contain at least one HELP line and one TYPE line
        assert "# HELP" in body
        assert "# TYPE" in body

    def test_metrics_contains_request_count(self, client):
        """Metrics output should contain the request_count_total counter."""
        response = client.get("/metrics")
        assert response.status_code == status.HTTP_200_OK
        assert "request_count_total" in response.text

    def test_metrics_contains_uptime(self, client):
        """Metrics output should report process uptime."""
        response = client.get("/metrics")
        assert response.status_code == status.HTTP_200_OK
        assert "process_uptime_seconds" in response.text

    def test_metrics_counter_values_are_numeric(self, client):
        """Each non-comment metric line should have a numeric value."""
        response = client.get("/metrics")
        assert response.status_code == status.HTTP_200_OK

        for line in response.text.splitlines():
            if line and not line.startswith("#"):
                parts = line.split()
                assert len(parts) >= 2, f"Malformed metric line: {line!r}"
                try:
                    float(parts[-1])
                except ValueError:
                    pytest.fail(f"Non-numeric metric value in line: {line!r}")


class TestApiHealthEndpoint:
    """GET /api/health tests."""

    def test_api_health_returns_ok(self, client):
        """API health check endpoint should return 200 with status 'ok'."""
        response = client.get("/api/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data.get("status") in ("ok", "healthy", "running")

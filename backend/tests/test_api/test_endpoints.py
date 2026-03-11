"""
Integration tests for API endpoints.
"""

import re

import pytest
from fastapi import status

from app import main as main_module


def _stub_launch_readiness(
    monkeypatch,
    *,
    pilot_connectors,
    smtp,
    stripe,
    growth,
):
    monkeypatch.setattr(
        main_module._integration_service,
        "get_pilot_readiness",
        lambda: pilot_connectors,
    )
    monkeypatch.setattr(main_module, "_smtp_readiness", lambda: smtp)
    monkeypatch.setattr(main_module, "_stripe_readiness", lambda: stripe)
    monkeypatch.setattr(main_module, "_growth_readiness", lambda: growth)


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "modules" in data
        assert "launch_readiness" in data

    def test_root_endpoint_redirects_html_to_frontend(self, client):
        response = client.get("/", headers={"accept": "text/html"}, follow_redirects=False)
        assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
        assert response.headers["location"] == "http://localhost:3000"

    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "launch_readiness" in data

    def test_launch_readiness_endpoint(self, client):
        response = client.get("/health/launch-readiness")
        assert response.status_code == 200
        data = response.json()
        assert "checks" in data
        assert "smtp" in data
        assert "stripe" in data
        assert "pilot_connectors" in data
        assert "growth" in data
        assert "public_status" in data
        assert {
            "pilot_state",
            "billing_state",
            "email_state",
            "analytics_state",
            "headline",
            "summary",
            "cta_label",
        } <= set(data["public_status"])

    def test_launch_readiness_public_status_when_all_core_systems_are_ready(
        self, client, monkeypatch
    ):
        _stub_launch_readiness(
            monkeypatch,
            pilot_connectors={
                "connectors": [
                    {
                        "key": "hubspot",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                    {
                        "key": "google_analytics",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                    {
                        "key": "stripe",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                ],
                "total": 3,
                "live_ready": 3,
                "demo_fallback": 0,
            },
            smtp={"configured": True},
            stripe={"ready": True},
            growth={"status": "ok"},
        )

        response = client.get("/health/launch-readiness")
        assert response.status_code == 200
        public_status = response.json()["public_status"]

        assert public_status["pilot_state"] == "live"
        assert public_status["billing_state"] == "ready"
        assert public_status["email_state"] == "ready"
        assert public_status["analytics_state"] == "observable"
        assert public_status["cta_label"] == "Open live workspace"

    def test_launch_readiness_public_status_uses_setup_in_progress_when_demo_fallback_is_active(
        self, client, monkeypatch
    ):
        _stub_launch_readiness(
            monkeypatch,
            pilot_connectors={
                "connectors": [
                    {
                        "key": "hubspot",
                        "workspace_level": True,
                        "configured": False,
                        "ready_for_live": False,
                        "demo_fallback": True,
                    },
                    {
                        "key": "google_analytics",
                        "workspace_level": True,
                        "configured": False,
                        "ready_for_live": False,
                        "demo_fallback": True,
                    },
                    {
                        "key": "stripe",
                        "workspace_level": True,
                        "configured": False,
                        "ready_for_live": False,
                        "demo_fallback": True,
                    },
                ],
                "total": 3,
                "live_ready": 0,
                "demo_fallback": 3,
            },
            smtp={"configured": True},
            stripe={"ready": True},
            growth={"status": "ok"},
        )

        response = client.get("/health/launch-readiness")
        assert response.status_code == 200
        public_status = response.json()["public_status"]

        assert public_status["pilot_state"] == "setup_in_progress"
        assert public_status["billing_state"] == "ready"
        assert public_status["email_state"] == "ready"
        assert public_status["analytics_state"] == "observable"
        assert public_status["cta_label"] == "Start with demo mode"

    def test_launch_readiness_public_status_tracks_billing_and_email_setup(
        self, client, monkeypatch
    ):
        _stub_launch_readiness(
            monkeypatch,
            pilot_connectors={
                "connectors": [
                    {
                        "key": "hubspot",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                    {
                        "key": "google_analytics",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                    {
                        "key": "stripe",
                        "workspace_level": True,
                        "configured": True,
                        "ready_for_live": True,
                        "demo_fallback": False,
                    },
                ],
                "total": 3,
                "live_ready": 3,
                "demo_fallback": 0,
            },
            smtp={"configured": False},
            stripe={"ready": False},
            growth={"status": "ok"},
        )

        response = client.get("/health/launch-readiness")
        assert response.status_code == 200
        public_status = response.json()["public_status"]

        assert public_status["pilot_state"] == "live"
        assert public_status["billing_state"] == "setup_in_progress"
        assert public_status["email_state"] == "setup_in_progress"
        assert public_status["analytics_state"] == "observable"

    def test_cors_origin_regex_supports_vercel_project_aliases(self, monkeypatch):
        monkeypatch.setattr(
            main_module.settings,
            "FRONTEND_BASE_URL",
            "https://digital-cmo-ai-live.vercel.app",
        )
        regex = main_module._cors_origin_regex()

        assert regex is not None
        assert re.match(regex, "https://digital-cmo-ai-live.vercel.app")
        assert re.match(
            regex,
            "https://digital-cmo-ai-live-2vx7bx8rr-artemivanytskyi-5767s-projects.vercel.app",
        )

    def test_cors_origin_regex_is_disabled_for_non_vercel_hosts(self, monkeypatch):
        monkeypatch.setattr(
            main_module.settings,
            "FRONTEND_BASE_URL",
            "https://app.digitalcmo.ai",
        )

        assert main_module._cors_origin_regex() is None


class TestAuthEndpoints:
    """Tests for authentication endpoints."""

    def test_signup(self, client):
        response = client.post(
            "/auth/signup",
            json={"email": "new_user@example.com", "password": "securepassword123"},
        )
        assert response.status_code in (201, 409)  # 409 if already exists
        if response.status_code == 201:
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data

    def test_login(self, client):
        # First signup
        client.post(
            "/auth/signup",
            json={"email": "login_test@example.com", "password": "testpass123"},
        )
        # Then login
        response = client.post(
            "/auth/login",
            json={"email": "login_test@example.com", "password": "testpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_wrong_password(self, client):
        client.post(
            "/auth/signup",
            json={"email": "wrongpass@example.com", "password": "correct"},
        )
        response = client.post(
            "/auth/login",
            json={"email": "wrongpass@example.com", "password": "incorrect"},
        )
        assert response.status_code == 401


class TestChatEndpoints:
    """Tests for chat endpoints."""

    def test_send_message(self, client, auth_headers):
        response = client.post(
            "/chat",
            json={"message": "Hello, what can you do?"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "conversation_id" in data

    def test_send_message_with_conversation_id(self, client, auth_headers):
        # First message
        r1 = client.post("/chat", json={"message": "First message"}, headers=auth_headers)
        conv_id = r1.json()["conversation_id"]
        # Follow-up
        r2 = client.post(
            "/chat",
            json={"message": "Follow up", "conversation_id": conv_id},
            headers=auth_headers,
        )
        assert r2.json()["conversation_id"] == conv_id

    def test_get_conversation(self, client, auth_headers):
        r1 = client.post("/chat", json={"message": "Test"}, headers=auth_headers)
        conv_id = r1.json()["conversation_id"]
        response = client.get(f"/chat/{conv_id}", headers=auth_headers)
        assert response.status_code == 200

    def test_get_nonexistent_conversation(self, client, auth_headers):
        response = client.get("/chat/nonexistent-id", headers=auth_headers)
        assert response.status_code == 404


class TestAnalysisEndpoints:
    """Tests for business analysis endpoints."""

    def test_market_analysis(self, client, auth_headers):
        response = client.post(
            "/analysis/market",
            json={"query": "SaaS market in Europe"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_swot_analysis(self, client, auth_headers):
        response = client.post(
            "/analysis/swot",
            json={"subject": "Our product launch"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_pestel_analysis(self, client, auth_headers):
        response = client.post(
            "/analysis/pestel",
            json={"subject": "European tech market"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_competitor_analysis(self, client, auth_headers):
        response = client.post(
            "/analysis/competitors",
            json={"company_names": ["Company A", "Company B"]},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_persona_generation(self, client, auth_headers):
        response = client.post(
            "/analysis/personas",
            json={"data_source": "general", "num_personas": 2},
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestCreativeEndpoints:
    """Tests for creative & design endpoints."""

    def test_generate_copy(self, client, auth_headers):
        response = client.post(
            "/creative/generate",
            json={"brief": "Write a LinkedIn post about AI"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_generate_image(self, client, auth_headers):
        response = client.post(
            "/creative/image",
            json={"description": "Modern tech banner"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_ab_test(self, client, auth_headers):
        response = client.post(
            "/creative/ab-test",
            json={"base_copy": "Buy now and save 20%!"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_content_schedule(self, client, auth_headers):
        response = client.post(
            "/creative/schedule",
            json={"events": []},
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestCRMEndpoints:
    """Tests for CRM & campaign endpoints."""

    def test_create_lead(self, client, auth_headers):
        response = client.post(
            "/crm/lead",
            json={"lead_id": "lead-api-001", "attributes": {"name": "Test Lead"}},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "success"

    def test_create_campaign(self, client, auth_headers):
        response = client.post(
            "/crm/campaign",
            json={"name": "Test Campaign", "channel": "email"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_trigger_workflow(self, client, auth_headers):
        response = client.post(
            "/crm/workflow",
            json={"workflow_id": "welcome_series", "lead_id": "lead-wf-001"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_check_compliance(self, client, auth_headers):
        response = client.post(
            "/crm/compliance",
            json={"message": "Buy now!", "channel": "email"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_list_leads(self, client, auth_headers):
        response = client.get("/crm/leads", headers=auth_headers)
        assert response.status_code == 200

    def test_list_campaigns(self, client, auth_headers):
        response = client.get("/crm/campaigns", headers=auth_headers)
        assert response.status_code == 200


class TestAnalyticsEndpoints:
    """Tests for analytics & reporting endpoints."""

    def test_get_dashboard(self, client, auth_headers):
        response = client.get("/analytics/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data

    def test_get_forecast(self, client, auth_headers):
        response = client.post(
            "/analytics/forecast",
            json={"metric": "revenue", "horizon": 14},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_record_experiment(self, client, auth_headers):
        response = client.post(
            "/analytics/experiment",
            json={
                "experiment_id": "exp-api-001",
                "variants": [
                    {"name": "Control", "sample_size": 1000, "conversions": 50},
                    {"name": "Variant A", "sample_size": 1000, "conversions": 70},
                ],
            },
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestMemoryEndpoints:
    """Tests for memory endpoints."""

    def test_store_memory(self, client, auth_headers):
        response = client.post(
            "/memory/store",
            json={"file_path": "workspace/test.md", "content": "Test content"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_list_memory_files(self, client, auth_headers):
        response = client.get("/memory/files", headers=auth_headers)
        assert response.status_code == 200

    def test_retrieve_memories(self, client, auth_headers):
        response = client.post(
            "/memory/retrieve",
            json={"query": "marketing budget"},
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestProtectedRouteAccess:
    @pytest.mark.parametrize(
        "method,path,payload",
        [
            ("post", "/chat", {"message": "hello"}),
            ("post", "/analysis/market", {"query": "saas"}),
            ("post", "/creative/generate", {"brief": "launch email"}),
            ("post", "/crm/lead", {"lead_id": "lead-1", "attributes": {"name": "Lead"}}),
            ("get", "/analytics/dashboard", None),
            ("get", "/integrations/catalog", None),
            ("post", "/memory/store", {"file_path": "workspace/x.md", "content": "x"}),
        ],
    )
    def test_protected_routes_require_auth(self, client, method, path, payload):
        response = getattr(client, method)(path, json=payload) if payload is not None else getattr(client, method)(path)
        assert response.status_code == 401

    @pytest.mark.parametrize(
        "method,path,payload",
        [
            ("post", "/chat", {"message": "hello"}),
            ("post", "/analysis/market", {"query": "saas"}),
            ("post", "/creative/generate", {"brief": "launch email"}),
            ("post", "/crm/lead", {"lead_id": "lead-1", "attributes": {"name": "Lead"}}),
            ("get", "/analytics/dashboard", None),
            ("get", "/integrations/catalog", None),
            ("post", "/memory/store", {"file_path": "workspace/x.md", "content": "x"}),
        ],
    )
    def test_protected_routes_require_verified_user(
        self,
        client,
        unverified_auth_headers,
        method,
        path,
        payload,
    ):
        request_fn = getattr(client, method)
        if payload is not None:
            response = request_fn(path, json=payload, headers=unverified_auth_headers)
        else:
            response = request_fn(path, headers=unverified_auth_headers)
        assert response.status_code == 403

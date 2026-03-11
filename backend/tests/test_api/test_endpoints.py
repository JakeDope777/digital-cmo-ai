"""
Integration tests for API endpoints.
"""

import pytest


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "modules" in data
        assert "launch_readiness" in data

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

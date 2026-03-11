"""
API tests for integrations endpoints.
"""

from app.db import models


class TestIntegrationsAPI:
    def test_catalog(self, client, auth_headers):
        response = client.get("/integrations/catalog", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        keys = {item["key"] for item in data["connectors"]}
        assert "hubspot" in keys
        assert "n8n" in keys
        assert "marketplace" in data
        assert data["marketplace"]["snapshot_connectors"] >= 200
        integrations = {item["name"]: item for item in data["integrations"]}
        assert integrations["hubspot"]["owner_scope"] == "workspace"
        assert "mode_label" in integrations["hubspot"]
        assert "ready_for_live" in integrations["hubspot"]

    def test_marketplace_default(self, client, auth_headers):
        response = client.get("/integrations/marketplace", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] == 200
        assert len(data["connectors"]) == 200
        assert data["offset"] == 0
        assert data["total_filtered"] >= 200

    def test_marketplace_pagination(self, client, auth_headers):
        response = client.get("/integrations/marketplace?provider=n8n&limit=15&offset=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] == 15
        assert data["offset"] == 10
        assert data["next_offset"] == 25
        assert len(data["connectors"]) == 15
        assert all(row["provider"] == "n8n" for row in data["connectors"])

    def test_marketplace_search(self, client, auth_headers):
        response = client.get("/integrations/marketplace?search=hubspot&limit=20", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] <= 20
        for row in data["connectors"]:
            assert "hubspot" in row["key"] or "hubspot" in row["name"].lower()

    def test_marketplace_provider_native(self, client, auth_headers):
        response = client.get("/integrations/marketplace?provider=native&limit=50", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] >= 1
        assert all(row["provider"] == "native" for row in data["connectors"])

    def test_marketplace_provider_n8n_category(self, client, auth_headers):
        response = client.get(
            "/integrations/marketplace?provider=n8n&category=triggers&limit=50",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] >= 1
        assert all(row["provider"] == "n8n" for row in data["connectors"])
        assert all(row["category"] == "triggers" for row in data["connectors"])

    def test_marketplace_providers(self, client, auth_headers):
        response = client.get("/integrations/marketplace/providers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        provider_keys = {item["key"] for item in data["providers"]}
        assert "native" in provider_keys
        assert "n8n" in provider_keys
        assert data["total_visible"] >= 200

    def test_marketplace_summary(self, client, auth_headers):
        response = client.get("/integrations/marketplace/summary?provider=all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_filtered"] >= 200
        assert isinstance(data["providers"], list)
        assert any(row["key"] == "n8n" for row in data["providers"])
        assert isinstance(data["categories"], list)

    def test_marketplace_connector_detail(self, client, auth_headers):
        response = client.get("/integrations/marketplace/connectors/n8n", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["key"] == "n8n"
        assert "suggested_actions" in data
        assert "trigger_workflow" in data["suggested_actions"]
        assert data["connection"]["owner_scope"] == "workspace"
        assert "mode_label" in data["connection"]

    def test_n8n_trigger_workflow_demo(self, client, auth_headers):
        response = client.post(
            "/integrations/n8n/action",
            json={
                "action": "trigger_workflow",
                "payload": {"payload": {"source": "test"}},
                "credentials": {},
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["details"]["result"]["demo"] is True
        assert data["demo_fallback"] is True
        assert data["mode_label"] == "Demo fallback"

    def test_connector_runs_feed(self, client, auth_headers):
        warmup = client.get("/integrations/n8n/status", headers=auth_headers)
        assert warmup.status_code == 200
        response = client.get("/integrations/runs?limit=20", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] >= 1
        assert len(data["runs"]) >= 1
        latest = data["runs"][0]
        assert "connector" in latest
        assert "status" in latest
        assert "duration_ms" in latest

    def test_connector_runs_summary(self, client, auth_headers):
        warmup = client.get("/integrations/n8n/status", headers=auth_headers)
        assert warmup.status_code == 200
        response = client.get("/integrations/runs/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_runs"] >= 1
        assert data["success_count"] >= 1
        assert "avg_duration_ms" in data

    def test_n8n_action_idempotency_replay(self, client, auth_headers):
        payload = {
            "action": "trigger_workflow",
            "payload": {"payload": {"source": "test-idempotency"}},
            "idempotency_key": "idem-001",
        }
        first = client.post("/integrations/n8n/action", json=payload, headers=auth_headers)
        assert first.status_code == 200
        first_data = first.json()
        assert first_data["details"]["idempotency"]["enabled"] is True
        assert first_data["details"]["idempotency"]["replayed"] is False

        second = client.post("/integrations/n8n/action", json=payload, headers=auth_headers)
        assert second.status_code == 200
        second_data = second.json()
        assert second_data["details"]["idempotency"]["enabled"] is True
        assert second_data["details"]["idempotency"]["replayed"] is True
        assert (
            second_data["details"]["result"]["execution_id"]
            == first_data["details"]["result"]["execution_id"]
        )

    def test_pilot_readiness_exposes_connection_contract(self, client, auth_headers):
        response = client.get("/integrations/pilot-readiness", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        hubspot = next(row for row in data["connectors"] if row["key"] == "hubspot")
        assert hubspot["owner_scope"] == "workspace"
        assert "auth_mode" in hubspot
        assert "mode_label" in hubspot
        assert "capability" in hubspot

    def test_status_persists_connection_record(self, client, auth_headers, db_session):
        response = client.get("/integrations/n8n/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["owner_scope"] == "workspace"
        assert data["demo_fallback"] is True
        row = (
            db_session.query(models.IntegrationConnection)
            .filter(
                models.IntegrationConnection.connector == "n8n",
                models.IntegrationConnection.owner_scope == "workspace",
                models.IntegrationConnection.owner_id == "default",
            )
            .one()
        )
        assert row.status in {"demo", "live", "error", "pending"}
        assert row.last_tested_at is not None

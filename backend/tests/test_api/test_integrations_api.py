"""
API tests for integrations endpoints.
"""


class TestIntegrationsAPI:
    def test_catalog(self, client):
        response = client.get("/integrations/catalog")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        keys = {item["key"] for item in data["connectors"]}
        assert "hubspot" in keys
        assert "n8n" in keys
        assert "marketplace" in data
        assert data["marketplace"]["snapshot_connectors"] >= 200

    def test_marketplace_default(self, client):
        response = client.get("/integrations/marketplace")
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] == 200
        assert len(data["connectors"]) == 200

    def test_marketplace_search(self, client):
        response = client.get("/integrations/marketplace?search=hubspot&limit=20")
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] <= 20
        for row in data["connectors"]:
            assert "hubspot" in row["key"] or "hubspot" in row["name"].lower()

    def test_marketplace_provider_native(self, client):
        response = client.get("/integrations/marketplace?provider=native&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] >= 1
        assert all(row["provider"] == "native" for row in data["connectors"])

    def test_marketplace_provider_n8n_category(self, client):
        response = client.get(
            "/integrations/marketplace?provider=n8n&category=triggers&limit=50"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["returned"] >= 1
        assert all(row["provider"] == "n8n" for row in data["connectors"])
        assert all(row["category"] == "triggers" for row in data["connectors"])

    def test_n8n_trigger_workflow_demo(self, client):
        response = client.post(
            "/integrations/n8n/action",
            json={
                "action": "trigger_workflow",
                "payload": {"payload": {"source": "test"}},
                "credentials": {},
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["details"]["result"]["demo"] is True

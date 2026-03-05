"""
Unit tests for the CRM & Campaign Management Module.
"""

import pytest
from app.modules.crm_campaign import CRMCampaignModule


@pytest.fixture
def module():
    return CRMCampaignModule()


class TestCRMCampaignModule:
    """Tests for CRM and campaign management functions."""

    @pytest.mark.asyncio
    async def test_update_lead_create(self, module):
        result = await module.update_lead("lead-001", {"name": "Jane Doe", "email": "jane@example.com"})
        assert result["status"] == "success"
        assert result["details"]["id"] == "lead-001"

    @pytest.mark.asyncio
    async def test_update_lead_update(self, module):
        await module.update_lead("lead-002", {"name": "John"})
        result = await module.update_lead("lead-002", {"name": "John Smith"})
        assert result["status"] == "success"
        assert result["details"]["name"] == "John Smith"

    @pytest.mark.asyncio
    async def test_create_campaign(self, module):
        result = await module.create_campaign(
            name="Spring Sale",
            channel="email",
            content={"subject": "Spring Sale!", "body": "Don't miss out"},
        )
        assert result["status"] == "success"
        assert "id" in result["details"]
        assert result["details"]["name"] == "Spring Sale"

    @pytest.mark.asyncio
    async def test_trigger_workflow_welcome(self, module):
        result = await module.trigger_workflow("welcome_series", "lead-100")
        assert result["status"] == "success"
        assert result["details"]["workflow"] == "welcome_series"

    @pytest.mark.asyncio
    async def test_trigger_workflow_progression(self, module):
        await module.trigger_workflow("welcome_series", "lead-200")
        result = await module.trigger_workflow("welcome_series", "lead-200")
        assert result["status"] == "success"
        assert result["details"]["step_executed"]["action"] == "send_email"

    @pytest.mark.asyncio
    async def test_trigger_workflow_unknown(self, module):
        result = await module.trigger_workflow("nonexistent_workflow", "lead-300")
        assert result["status"] == "error"

    @pytest.mark.asyncio
    async def test_check_compliance_email_pass(self, module):
        message = "Check out our offer! unsubscribe link sender address company name"
        result = await module.check_compliance(message, "email")
        assert result["details"]["is_compliant"] is True

    @pytest.mark.asyncio
    async def test_check_compliance_email_fail(self, module):
        message = "Buy now!"
        result = await module.check_compliance(message, "email")
        assert result["status"] == "non_compliant"
        assert len(result["details"]["issues"]) > 0

    @pytest.mark.asyncio
    async def test_check_compliance_social(self, module):
        result = await module.check_compliance("Great content!", "social")
        assert result["details"]["is_compliant"] is True

    def test_get_leads_empty(self, module):
        # Fresh module has no leads
        fresh = CRMCampaignModule()
        assert fresh.get_leads() == []

    def test_get_campaigns_empty(self, module):
        fresh = CRMCampaignModule()
        assert fresh.get_campaigns() == []

    @pytest.mark.asyncio
    async def test_handle_lead(self, module):
        result = await module.handle("Tell me about lead management", {})
        assert "response" in result

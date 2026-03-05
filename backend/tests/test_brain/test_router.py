"""
Unit tests for the Brain Intent Router.
"""

import pytest
from app.brain.router import IntentRouter, SKILL_BUSINESS_ANALYSIS, SKILL_CREATIVE_DESIGN, \
    SKILL_CRM_CAMPAIGN, SKILL_ANALYTICS_REPORTING, SKILL_INTEGRATIONS, SKILL_SYSTEM, SKILL_GENERAL


@pytest.fixture
def router():
    return IntentRouter()


class TestIntentRouter:
    """Tests for keyword-based intent classification."""

    def test_business_analysis_intent(self, router):
        assert router.classify_intent("Do a SWOT analysis for our product") == SKILL_BUSINESS_ANALYSIS

    def test_competitor_intent(self, router):
        assert router.classify_intent("Analyse our competitor landscape") == SKILL_BUSINESS_ANALYSIS

    def test_persona_intent(self, router):
        assert router.classify_intent("Create buyer personas for our target audience") == SKILL_BUSINESS_ANALYSIS

    def test_creative_copy_intent(self, router):
        assert router.classify_intent("Write a blog post about our new feature") == SKILL_CREATIVE_DESIGN

    def test_creative_image_intent(self, router):
        assert router.classify_intent("Generate a banner image for our campaign") == SKILL_CREATIVE_DESIGN

    def test_ab_test_intent(self, router):
        assert router.classify_intent("Suggest A/B test variations for this headline") == SKILL_CREATIVE_DESIGN

    def test_crm_lead_intent(self, router):
        assert router.classify_intent("Update the lead status in our CRM") == SKILL_CRM_CAMPAIGN

    def test_campaign_intent(self, router):
        assert router.classify_intent("Create an email campaign for new users") == SKILL_CRM_CAMPAIGN

    def test_compliance_intent(self, router):
        assert router.classify_intent("Check GDPR compliance for this message") == SKILL_CRM_CAMPAIGN

    def test_analytics_dashboard_intent(self, router):
        assert router.classify_intent("Show me the analytics dashboard") == SKILL_ANALYTICS_REPORTING

    def test_metrics_intent(self, router):
        assert router.classify_intent("What is our current CAC and LTV?") == SKILL_ANALYTICS_REPORTING

    def test_forecast_intent(self, router):
        assert router.classify_intent("Forecast our conversion rate for next month") == SKILL_ANALYTICS_REPORTING

    def test_integration_intent(self, router):
        assert router.classify_intent("Connect our Google Ads account via OAuth") == SKILL_INTEGRATIONS

    def test_system_intent(self, router):
        assert router.classify_intent("Change my account settings and preferences") == SKILL_SYSTEM

    def test_general_intent(self, router):
        assert router.classify_intent("Hello, how are you today?") == SKILL_GENERAL

    def test_ambiguous_defaults_to_general(self, router):
        assert router.classify_intent("Tell me something interesting") == SKILL_GENERAL

    def test_available_skills(self, router):
        skills = router.get_available_skills()
        assert SKILL_BUSINESS_ANALYSIS in skills
        assert SKILL_CREATIVE_DESIGN in skills
        assert SKILL_GENERAL in skills

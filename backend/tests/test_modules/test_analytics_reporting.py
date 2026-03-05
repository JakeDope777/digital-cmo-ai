"""
Unit tests for the Analytics & Reporting Module.
"""

import pytest
from app.modules.analytics_reporting import AnalyticsReportingModule


@pytest.fixture
def module():
    return AnalyticsReportingModule()


class TestAnalyticsReportingModule:
    """Tests for analytics and reporting functions."""

    @pytest.mark.asyncio
    async def test_get_dashboard(self, module):
        result = await module.get_dashboard()
        assert "metrics" in result
        assert "charts" in result
        assert "metadata" in result
        assert result["metrics"]["total_leads"] > 0

    @pytest.mark.asyncio
    async def test_get_dashboard_with_params(self, module):
        result = await module.get_dashboard(params={"days": 7})
        assert result["metadata"]["period_days"] == 7

    @pytest.mark.asyncio
    async def test_get_forecast(self, module):
        result = await module.get_forecast("revenue", 30)
        assert "forecast" in result
        forecast = result["forecast"]
        assert forecast["metric"] == "revenue"
        assert forecast["horizon_days"] == 30
        assert len(forecast["predictions"]) == 30

    @pytest.mark.asyncio
    async def test_get_forecast_leads(self, module):
        result = await module.get_forecast("leads", 14)
        assert result["forecast"]["metric"] == "leads"
        assert len(result["forecast"]["predictions"]) == 14

    @pytest.mark.asyncio
    async def test_record_experiment(self, module):
        variants = [
            {"name": "Control", "sample_size": 1000, "conversions": 50},
            {"name": "Variant A", "sample_size": 1000, "conversions": 70},
        ]
        result = await module.record_experiment("exp-001", variants)
        assert "experiment_results" in result
        exp = result["experiment_results"]
        assert exp["id"] == "exp-001"
        assert len(exp["variants"]) == 2
        assert exp["recommendation"] != ""

    @pytest.mark.asyncio
    async def test_record_experiment_insufficient_variants(self, module):
        result = await module.record_experiment("exp-002", [{"name": "Only one"}])
        assert "error" in result["experiment_results"]

    @pytest.mark.asyncio
    async def test_record_experiment_significance(self, module):
        variants = [
            {"name": "Control", "sample_size": 10000, "conversions": 500},
            {"name": "Variant A", "sample_size": 10000, "conversions": 700},
        ]
        result = await module.record_experiment("exp-003", variants)
        exp = result["experiment_results"]
        variant_a = [v for v in exp["variants"] if v["name"] == "Variant A"][0]
        assert variant_a["is_significant"] is True

    @pytest.mark.asyncio
    async def test_handle_dashboard(self, module):
        result = await module.handle("Show me the dashboard metrics", {})
        assert "response" in result

    @pytest.mark.asyncio
    async def test_handle_forecast(self, module):
        result = await module.handle("Forecast our revenue for next month", {})
        assert "response" in result

    def test_generate_chart_data(self, module):
        charts = module._generate_chart_data(30)
        assert len(charts) == 3
        assert charts[0]["type"] == "line"
        assert charts[1]["type"] == "bar"
        assert charts[2]["type"] == "funnel"

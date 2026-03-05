"""
Analytics & Reporting Module

Aggregates data from multiple sources, computes marketing metrics,
generates visualisations, provides forecasts, and tracks experiments.
"""

import math
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional


class AnalyticsReportingModule:
    """
    Provides analytics dashboards, metric computation, forecasting,
    and A/B experiment tracking.
    """

    def __init__(self, integrator=None, db=None, memory_manager=None):
        self.integrator = integrator
        self.db = db
        self.memory = memory_manager

        # In-memory experiment store for MVP
        self._experiments: dict[str, dict] = {}

    async def handle(self, message: str, context: dict) -> dict:
        """Generic handler called by the Brain orchestrator."""
        message_lower = message.lower()

        if "dashboard" in message_lower or "metric" in message_lower:
            result = await self.get_dashboard(context=context)
            metrics = result.get("metrics", {})
            summary = "\n".join(f"- {k}: {v}" for k, v in metrics.items())
            return {"response": f"Dashboard Metrics:\n{summary}"}
        elif "forecast" in message_lower:
            result = await self.get_forecast("revenue", 30)
            return {"response": str(result.get("forecast", {}))}
        elif "experiment" in message_lower or "a/b" in message_lower:
            return {"response": "Experiment tracking is available. Use /analytics/experiment to record results."}
        else:
            result = await self.get_dashboard(context=context)
            metrics = result.get("metrics", {})
            summary = "\n".join(f"- {k}: {v}" for k, v in metrics.items())
            return {"response": f"Analytics Overview:\n{summary}"}

    async def get_dashboard(
        self, params: Optional[dict] = None, context: Optional[dict] = None
    ) -> dict:
        """
        Aggregate data and return metrics and charts for the dashboard.

        Args:
            params: Filter parameters (date_range, channels, campaign_ids).
            context: Additional context (user_id, project_id).

        Returns:
            Dict with metrics, charts, and metadata.
        """
        params = params or {}
        context = context or {}

        # Generate sample metrics (replace with real data from integrations)
        now = datetime.now(timezone.utc)
        days = params.get("days", 30)

        metrics = {
            "total_leads": random.randint(150, 500),
            "new_leads_period": random.randint(20, 80),
            "total_spend": round(random.uniform(5000, 25000), 2),
            "conversions": random.randint(10, 50),
            "conversion_rate": round(random.uniform(1.5, 8.0), 2),
            "cac": round(random.uniform(50, 200), 2),
            "ltv": round(random.uniform(500, 2000), 2),
            "roas": round(random.uniform(2.0, 8.0), 2),
            "ctr": round(random.uniform(1.0, 5.0), 2),
            "impressions": random.randint(50000, 200000),
            "clicks": random.randint(1000, 10000),
            "email_open_rate": round(random.uniform(15, 35), 1),
            "email_click_rate": round(random.uniform(2, 8), 1),
        }

        # Generate chart data (Plotly-compatible JSON)
        charts = self._generate_chart_data(days)

        return {
            "metrics": metrics,
            "charts": charts,
            "metadata": {
                "period_days": days,
                "generated_at": now.isoformat(),
                "data_source": "sample_data",
            },
        }

    async def get_forecast(
        self,
        metric: str,
        horizon: int = 30,
        params: Optional[dict] = None,
    ) -> dict:
        """
        Generate a forecast for the specified metric over a time horizon.

        Uses a simple moving average / linear trend for the MVP.

        Args:
            metric: The metric to forecast (e.g., 'revenue', 'leads', 'spend').
            horizon: Number of days to forecast.
            params: Additional parameters.

        Returns:
            Dict with forecast values and confidence intervals.
        """
        # Generate historical data points
        now = datetime.now(timezone.utc)
        historical = []
        base_value = {"revenue": 1000, "leads": 10, "spend": 500}.get(metric, 100)

        for i in range(30):
            date = now - timedelta(days=30 - i)
            value = base_value + random.uniform(-base_value * 0.2, base_value * 0.3)
            historical.append({"date": date.strftime("%Y-%m-%d"), "value": round(value, 2)})

        # Simple linear trend forecast
        values = [h["value"] for h in historical]
        avg = sum(values) / len(values)
        trend = (values[-1] - values[0]) / len(values) if len(values) > 1 else 0

        forecast_points = []
        for i in range(1, horizon + 1):
            date = now + timedelta(days=i)
            predicted = avg + trend * (len(values) + i)
            lower = predicted * 0.85
            upper = predicted * 1.15
            forecast_points.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted": round(predicted, 2),
                "lower_bound": round(lower, 2),
                "upper_bound": round(upper, 2),
            })

        return {
            "forecast": {
                "metric": metric,
                "horizon_days": horizon,
                "method": "linear_trend",
                "historical": historical[-7:],  # Last 7 days
                "predictions": forecast_points,
            },
        }

    async def record_experiment(
        self,
        experiment_id: str,
        variants: list[dict],
        results: Optional[dict] = None,
    ) -> dict:
        """
        Store A/B test results and calculate uplift and significance.

        Args:
            experiment_id: Unique experiment identifier.
            variants: List of variant dicts with name, sample_size, conversions.
            results: Optional pre-computed results.

        Returns:
            Dict with experiment statistics and recommendations.
        """
        if not variants or len(variants) < 2:
            return {
                "experiment_results": {
                    "error": "At least 2 variants are required for an experiment."
                }
            }

        # Calculate conversion rates and uplift
        control = variants[0]
        control_rate = (
            control.get("conversions", 0) / max(control.get("sample_size", 1), 1)
        )

        variant_results = []
        for v in variants:
            rate = v.get("conversions", 0) / max(v.get("sample_size", 1), 1)
            uplift = ((rate - control_rate) / max(control_rate, 0.001)) * 100

            # Simplified z-test for significance
            n1 = max(control.get("sample_size", 1), 1)
            n2 = max(v.get("sample_size", 1), 1)
            p_pooled = (
                (control.get("conversions", 0) + v.get("conversions", 0)) / (n1 + n2)
            )
            se = math.sqrt(max(p_pooled * (1 - p_pooled) * (1 / n1 + 1 / n2), 1e-10))
            z_score = (rate - control_rate) / max(se, 1e-10)
            is_significant = abs(z_score) > 1.96  # 95% confidence

            variant_results.append({
                "name": v.get("name", "Unknown"),
                "sample_size": v.get("sample_size", 0),
                "conversions": v.get("conversions", 0),
                "conversion_rate": round(rate * 100, 2),
                "uplift_percent": round(uplift, 2),
                "z_score": round(z_score, 4),
                "is_significant": is_significant,
            })

        # Determine winner
        best = max(variant_results, key=lambda x: x["conversion_rate"])
        recommendation = (
            f"Variant '{best['name']}' has the highest conversion rate "
            f"({best['conversion_rate']}%)."
        )
        if best["is_significant"]:
            recommendation += " The result is statistically significant at 95% confidence."
        else:
            recommendation += " However, the result is not yet statistically significant. Consider collecting more data."

        experiment = {
            "id": experiment_id,
            "variants": variant_results,
            "recommendation": recommendation,
            "status": "completed",
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }
        self._experiments[experiment_id] = experiment

        return {"experiment_results": experiment}

    def _generate_chart_data(self, days: int) -> list[dict]:
        """Generate sample chart data in Plotly-compatible format."""
        now = datetime.now(timezone.utc)
        dates = [(now - timedelta(days=days - i)).strftime("%Y-%m-%d") for i in range(days)]

        # Spend over time
        spend_chart = {
            "id": "spend_over_time",
            "type": "line",
            "title": "Marketing Spend Over Time",
            "data": {
                "x": dates,
                "y": [round(random.uniform(100, 800), 2) for _ in dates],
            },
            "layout": {"xaxis_title": "Date", "yaxis_title": "Spend ($)"},
        }

        # Conversions by channel
        channels = ["Email", "Social", "Paid Search", "Display", "Organic"]
        channel_chart = {
            "id": "conversions_by_channel",
            "type": "bar",
            "title": "Conversions by Channel",
            "data": {
                "x": channels,
                "y": [random.randint(5, 50) for _ in channels],
            },
            "layout": {"xaxis_title": "Channel", "yaxis_title": "Conversions"},
        }

        # Funnel chart
        funnel_chart = {
            "id": "conversion_funnel",
            "type": "funnel",
            "title": "Conversion Funnel",
            "data": {
                "labels": ["Impressions", "Clicks", "Leads", "MQLs", "Customers"],
                "values": [100000, 5000, 500, 100, 25],
            },
        }

        return [spend_chart, channel_chart, funnel_chart]

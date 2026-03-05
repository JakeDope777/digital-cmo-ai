"""
Analytics & Reporting API endpoints.

GET/POST /analytics/dashboard  - Get dashboard metrics and charts
POST     /analytics/forecast   - Generate metric forecasts
POST     /analytics/experiment - Record and analyse A/B experiments
"""

from fastapi import APIRouter, Depends

from ..db.schemas import (
    DashboardRequest,
    ForecastRequest,
    ExperimentRecordRequest,
    AnalyticsResponse,
)
from ..modules.analytics_reporting import AnalyticsReportingModule

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

_module = AnalyticsReportingModule()


def get_module() -> AnalyticsReportingModule:
    return _module


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard(
    module: AnalyticsReportingModule = Depends(get_module),
):
    """Retrieve dashboard metrics and chart data."""
    result = await module.get_dashboard()
    return AnalyticsResponse(
        metrics=result.get("metrics"),
        charts=result.get("charts"),
    )


@router.post("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_filtered(
    request: DashboardRequest,
    module: AnalyticsReportingModule = Depends(get_module),
):
    """Retrieve filtered dashboard metrics and chart data."""
    result = await module.get_dashboard(params=request.params, context=request.context)
    return AnalyticsResponse(
        metrics=result.get("metrics"),
        charts=result.get("charts"),
    )


@router.post("/forecast", response_model=AnalyticsResponse)
async def get_forecast(
    request: ForecastRequest,
    module: AnalyticsReportingModule = Depends(get_module),
):
    """Generate a forecast for a specified metric."""
    result = await module.get_forecast(
        metric=request.metric,
        horizon=request.horizon,
        params=request.params,
    )
    return AnalyticsResponse(forecast=result.get("forecast"))


@router.post("/experiment", response_model=AnalyticsResponse)
async def record_experiment(
    request: ExperimentRecordRequest,
    module: AnalyticsReportingModule = Depends(get_module),
):
    """Record A/B test results and calculate uplift/significance."""
    result = await module.record_experiment(
        experiment_id=request.experiment_id,
        variants=request.variants,
        results=request.results,
    )
    return AnalyticsResponse(experiment_results=result.get("experiment_results"))

"""
TablePilot restaurant operations API.

Endpoints:
- POST /restaurant/ingest/pos-csv
- POST /restaurant/ingest/purchases-csv
- POST /restaurant/ingest/labor-csv
- POST /restaurant/ingest/recipes
- GET  /restaurant/control-tower/daily?date=YYYY-MM-DD
- GET  /restaurant/finance/margin?from=...&to=...
- GET  /restaurant/inventory/alerts?date=YYYY-MM-DD
- GET  /restaurant/recommendations/daily?date=YYYY-MM-DD
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from ..db.schemas import (
    RecipeIngestRequest,
    RestaurantControlTowerResponse,
    RestaurantFinanceMarginResponse,
    RestaurantIngestResponse,
    RestaurantInventoryAlertsResponse,
    RestaurantRecommendationsResponse,
)
from ..db.session import get_db
from ..modules.restaurant_ops import RestaurantOpsModule

router = APIRouter(prefix="/restaurant", tags=["Restaurant Ops"])

_module = RestaurantOpsModule()


def get_module() -> RestaurantOpsModule:
    return _module


@router.post("/ingest/pos-csv", response_model=RestaurantIngestResponse)
async def ingest_pos_csv(
    file: UploadFile = File(...),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        payload = await file.read()
        return module.ingest_pos_csv(db, payload, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/ingest/purchases-csv", response_model=RestaurantIngestResponse)
async def ingest_purchases_csv(
    file: UploadFile = File(...),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        payload = await file.read()
        return module.ingest_purchases_csv(db, payload, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/ingest/labor-csv", response_model=RestaurantIngestResponse)
async def ingest_labor_csv(
    file: UploadFile = File(...),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        payload = await file.read()
        return module.ingest_labor_csv(db, payload, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/ingest/recipes", response_model=RestaurantIngestResponse)
async def ingest_recipes(
    request: RecipeIngestRequest,
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        return module.ingest_recipes(db, [r.model_dump() for r in request.recipes], request.venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/control-tower/daily", response_model=RestaurantControlTowerResponse)
async def control_tower_daily(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        return module.get_control_tower_daily(db, date, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/finance/margin", response_model=RestaurantFinanceMarginResponse)
async def finance_margin(
    from_date: str = Query(..., alias="from", description="Start date YYYY-MM-DD"),
    to_date: str = Query(..., alias="to", description="End date YYYY-MM-DD"),
    fixed_cost: float = Query(default=3000.0, ge=0),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        return module.get_finance_margin(db, from_date, to_date, venue_id, fixed_cost)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/inventory/alerts", response_model=RestaurantInventoryAlertsResponse)
async def inventory_alerts(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        return module.get_inventory_alerts(db, date, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/recommendations/daily", response_model=RestaurantRecommendationsResponse)
async def daily_recommendations(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    venue_id: Optional[str] = Query(default=None),
    module: RestaurantOpsModule = Depends(get_module),
    db: Session = Depends(get_db),
):
    try:
        return module.get_daily_recommendations(db, date, venue_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

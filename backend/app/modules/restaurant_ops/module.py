"""
Restaurant Operations module for TablePilot week-1 pilot.

Capabilities:
- Ingest CSV data for POS sales, purchases, and labor shifts
- Ingest recipe definitions for dish margin analysis
- Compute daily control tower KPIs and anomalies
- Compute finance and margin insights by dish/channel
- Compute inventory and waste alerts
- Generate prescriptive daily recommendations
"""

from __future__ import annotations

import csv
import io
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterable

from sqlalchemy.orm import Session

from ...db.models import (
    RestaurantAnomaly,
    RestaurantLaborShift,
    RestaurantPurchase,
    RestaurantRecipe,
    RestaurantRecipeIngredient,
    RestaurantRecommendation,
    RestaurantReview,
    RestaurantSale,
    RestaurantStockSnapshot,
    RestaurantVenue,
)
from ...db.session import SessionLocal


@dataclass
class DateRange:
    start: str
    end: str


class RestaurantOpsModule:
    """Core restaurant operations engine used by API endpoints and AI chat skill."""

    DEFAULT_CURRENCY = "EUR"
    DEFAULT_TIMEZONE = "Europe/Madrid"

    def _parse_float(self, value: Any, default: float = 0.0) -> float:
        if value in (None, ""):
            return default
        try:
            return float(str(value).strip().replace(",", ""))
        except (TypeError, ValueError):
            return default

    def _parse_int(self, value: Any, default: int = 0) -> int:
        if value in (None, ""):
            return default
        try:
            return int(float(str(value).strip().replace(",", "")))
        except (TypeError, ValueError):
            return default

    def _normalize_date(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise ValueError("date is required")
        if len(value) >= 10:
            candidate = value[:10]
        else:
            candidate = value
        # Accept common formats and normalize to YYYY-MM-DD.
        formats = ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"]
        for fmt in formats:
            try:
                return datetime.strptime(candidate, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
        raise ValueError(f"invalid date: {value}")

    def _get_or_create_venue(self, db: Session, venue_id: str | None = None) -> RestaurantVenue:
        if venue_id:
            venue = db.query(RestaurantVenue).filter(RestaurantVenue.id == venue_id).first()
            if venue:
                return venue

        venue = db.query(RestaurantVenue).first()
        if venue:
            return venue

        venue = RestaurantVenue(
            name="TablePilot Demo Venue",
            currency=self.DEFAULT_CURRENCY,
            timezone=self.DEFAULT_TIMEZONE,
        )
        db.add(venue)
        db.commit()
        db.refresh(venue)
        return venue

    def _read_csv(self, file_bytes: bytes) -> list[dict[str, str]]:
        text = file_bytes.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row")
        return [
            {(k or "").strip(): (v or "").strip() for k, v in row.items()}
            for row in reader
        ]

    def _recipe_cost_map(self, db: Session, venue_id: str) -> dict[str, float]:
        recipes = db.query(RestaurantRecipe).filter(RestaurantRecipe.venue_id == venue_id).all()
        recipe_cost: dict[str, float] = {}
        for recipe in recipes:
            total_cost = 0.0
            for ingredient in recipe.ingredients:
                total_cost += ingredient.quantity_per_dish * ingredient.unit_cost
            recipe_cost[recipe.dish_name.lower()] = total_cost
        return recipe_cost

    def _range_filter(self, query, column, date_range: DateRange):
        return query.filter(column >= date_range.start, column <= date_range.end)

    def ingest_pos_csv(self, db: Session, file_bytes: bytes, venue_id: str | None = None) -> dict:
        rows = self._read_csv(file_bytes)
        required = {"date", "menu_item", "quantity", "net_sales"}
        fieldnames = set((rows[0].keys() if rows else []))
        missing = sorted(required - fieldnames)
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")

        venue = self._get_or_create_venue(db, venue_id)
        created = 0
        dates: list[str] = []
        revenue = 0.0
        covers = 0

        for row in rows:
            sale_date = self._normalize_date(row.get("date", ""))
            quantity = self._parse_int(row.get("quantity"), 0)
            net_sales = self._parse_float(row.get("net_sales"), 0.0)
            covers_row = self._parse_int(row.get("covers"), 0)
            forecast = self._parse_float(row.get("forecast_revenue"), net_sales)

            db.add(
                RestaurantSale(
                    venue_id=venue.id,
                    sale_date=sale_date,
                    channel=row.get("channel") or "in_store",
                    menu_item=row.get("menu_item") or "Unknown item",
                    quantity=quantity,
                    covers=covers_row,
                    net_sales=net_sales,
                    forecast_revenue=forecast,
                )
            )
            created += 1
            dates.append(sale_date)
            revenue += net_sales
            covers += covers_row

        db.commit()

        return {
            "status": "success",
            "rows_ingested": created,
            "venue_id": venue.id,
            "date_range": {"from": min(dates) if dates else None, "to": max(dates) if dates else None},
            "totals": {"revenue": round(revenue, 2), "covers": covers},
        }

    def ingest_purchases_csv(self, db: Session, file_bytes: bytes, venue_id: str | None = None) -> dict:
        rows = self._read_csv(file_bytes)
        required = {"date", "item_name", "quantity", "unit_cost"}
        fieldnames = set((rows[0].keys() if rows else []))
        missing = sorted(required - fieldnames)
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")

        venue = self._get_or_create_venue(db, venue_id)
        created = 0
        total_cost = 0.0
        dates: list[str] = []

        for row in rows:
            purchase_date = self._normalize_date(row.get("date", ""))
            quantity = self._parse_float(row.get("quantity"), 0.0)
            unit_cost = self._parse_float(row.get("unit_cost"), 0.0)
            computed_total = quantity * unit_cost
            row_total = self._parse_float(row.get("total_cost"), computed_total)

            db.add(
                RestaurantPurchase(
                    venue_id=venue.id,
                    purchase_date=purchase_date,
                    item_name=row.get("item_name") or "Unknown ingredient",
                    supplier=row.get("supplier") or "Unknown supplier",
                    quantity=quantity,
                    unit_cost=unit_cost,
                    total_cost=row_total,
                )
            )

            # Optional stock snapshot columns can be provided in the same CSV.
            if row.get("on_hand_qty") or row.get("par_level") or row.get("waste_qty") or row.get("theoretical_usage") or row.get("actual_usage"):
                db.add(
                    RestaurantStockSnapshot(
                        venue_id=venue.id,
                        snapshot_date=purchase_date,
                        item_name=row.get("item_name") or "Unknown ingredient",
                        on_hand_qty=self._parse_float(row.get("on_hand_qty"), 0.0),
                        par_level=self._parse_float(row.get("par_level"), 0.0),
                        waste_qty=self._parse_float(row.get("waste_qty"), 0.0),
                        theoretical_usage=self._parse_float(row.get("theoretical_usage"), 0.0),
                        actual_usage=self._parse_float(row.get("actual_usage"), 0.0),
                    )
                )

            created += 1
            total_cost += row_total
            dates.append(purchase_date)

        db.commit()

        return {
            "status": "success",
            "rows_ingested": created,
            "venue_id": venue.id,
            "date_range": {"from": min(dates) if dates else None, "to": max(dates) if dates else None},
            "totals": {"purchase_cost": round(total_cost, 2)},
        }

    def ingest_labor_csv(self, db: Session, file_bytes: bytes, venue_id: str | None = None) -> dict:
        rows = self._read_csv(file_bytes)
        required = {"date", "staff_name", "role", "hours_worked", "hourly_rate"}
        fieldnames = set((rows[0].keys() if rows else []))
        missing = sorted(required - fieldnames)
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")

        venue = self._get_or_create_venue(db, venue_id)
        created = 0
        total_labor_cost = 0.0
        dates: list[str] = []

        for row in rows:
            shift_date = self._normalize_date(row.get("date", ""))
            hours = self._parse_float(row.get("hours_worked"), 0.0)
            hourly = self._parse_float(row.get("hourly_rate"), 0.0)
            labor_cost = self._parse_float(row.get("labor_cost"), hours * hourly)

            db.add(
                RestaurantLaborShift(
                    venue_id=venue.id,
                    shift_date=shift_date,
                    staff_name=row.get("staff_name") or "Unknown staff",
                    role=row.get("role") or "staff",
                    hours_worked=hours,
                    hourly_rate=hourly,
                    labor_cost=labor_cost,
                    scheduled_covers=self._parse_int(row.get("scheduled_covers"), 0),
                )
            )
            created += 1
            total_labor_cost += labor_cost
            dates.append(shift_date)

        db.commit()

        return {
            "status": "success",
            "rows_ingested": created,
            "venue_id": venue.id,
            "date_range": {"from": min(dates) if dates else None, "to": max(dates) if dates else None},
            "totals": {"labor_cost": round(total_labor_cost, 2)},
        }

    def ingest_recipes(self, db: Session, recipes: list[dict], venue_id: str | None = None) -> dict:
        venue = self._get_or_create_venue(db, venue_id)
        upserted = 0

        for payload in recipes:
            dish_name = (payload.get("dish_name") or "").strip()
            if not dish_name:
                raise ValueError("dish_name is required for every recipe")

            recipe = (
                db.query(RestaurantRecipe)
                .filter(RestaurantRecipe.venue_id == venue.id, RestaurantRecipe.dish_name == dish_name)
                .first()
            )
            if recipe is None:
                recipe = RestaurantRecipe(
                    venue_id=venue.id,
                    dish_name=dish_name,
                )
                db.add(recipe)
                db.flush()

            recipe.selling_price = self._parse_float(payload.get("selling_price"), 0.0)
            recipe.portion_price = self._parse_float(payload.get("portion_price"), 0.0)

            # Replace ingredients atomically.
            db.query(RestaurantRecipeIngredient).filter(
                RestaurantRecipeIngredient.recipe_id == recipe.id
            ).delete()

            for ingredient in payload.get("ingredients", []):
                db.add(
                    RestaurantRecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_name=ingredient.get("name") or ingredient.get("ingredient_name") or "Unknown ingredient",
                        quantity_per_dish=self._parse_float(ingredient.get("quantity"), self._parse_float(ingredient.get("quantity_per_dish"), 0.0)),
                        unit_cost=self._parse_float(ingredient.get("unit_cost"), 0.0),
                    )
                )

            upserted += 1

        db.commit()
        return {"status": "success", "recipes_upserted": upserted, "venue_id": venue.id}

    def _inventory_alerts_internal(self, db: Session, venue_id: str, for_date: str) -> list[dict]:
        alerts: list[dict] = []

        stock_rows = (
            db.query(RestaurantStockSnapshot)
            .filter(RestaurantStockSnapshot.venue_id == venue_id, RestaurantStockSnapshot.snapshot_date == for_date)
            .all()
        )

        for row in stock_rows:
            if row.par_level > 0 and row.on_hand_qty < row.par_level:
                shortage = row.par_level - row.on_hand_qty
                alerts.append(
                    {
                        "category": "low_stock",
                        "severity": "high" if shortage / max(row.par_level, 1) >= 0.25 else "medium",
                        "title": f"Low stock: {row.item_name}",
                        "why": f"On hand is {row.on_hand_qty:.2f} vs par level {row.par_level:.2f}.",
                        "metric": round(shortage, 2),
                        "next_action": f"Reorder {row.item_name} to restore par level.",
                    }
                )

            if row.theoretical_usage > 0 and row.actual_usage > row.theoretical_usage * 1.1:
                variance_pct = ((row.actual_usage - row.theoretical_usage) / row.theoretical_usage) * 100
                alerts.append(
                    {
                        "category": "usage_variance",
                        "severity": "high" if variance_pct >= 20 else "medium",
                        "title": f"Usage variance: {row.item_name}",
                        "why": f"Actual usage is {variance_pct:.1f}% above theoretical.",
                        "metric": round(variance_pct, 2),
                        "next_action": f"Audit prep and portioning for {row.item_name}.",
                    }
                )

        # Supplier price change alerts from latest two purchase entries per ingredient.
        recent_purchases = (
            db.query(RestaurantPurchase)
            .filter(RestaurantPurchase.venue_id == venue_id, RestaurantPurchase.purchase_date <= for_date)
            .order_by(RestaurantPurchase.item_name.asc(), RestaurantPurchase.purchase_date.desc(), RestaurantPurchase.created_at.desc())
            .all()
        )

        seen_items: set[str] = set()
        grouped: dict[str, list[RestaurantPurchase]] = defaultdict(list)
        for p in recent_purchases:
            key = p.item_name.lower()
            if len(grouped[key]) < 2:
                grouped[key].append(p)

        for item_key, entries in grouped.items():
            if len(entries) < 2:
                continue
            latest, previous = entries[0], entries[1]
            if previous.unit_cost <= 0:
                continue
            delta_pct = ((latest.unit_cost - previous.unit_cost) / previous.unit_cost) * 100
            if abs(delta_pct) >= 8:
                direction = "rose" if delta_pct > 0 else "fell"
                severity = "high" if delta_pct >= 12 else "medium"
                alerts.append(
                    {
                        "category": "supplier_price",
                        "severity": severity,
                        "title": f"Supplier price {direction}: {latest.item_name}",
                        "why": f"Unit cost changed {delta_pct:+.1f}% ({previous.unit_cost:.2f} -> {latest.unit_cost:.2f}).",
                        "metric": round(delta_pct, 2),
                        "next_action": "Review alternative suppliers or renegotiate pricing.",
                    }
                )

        return alerts

    def get_inventory_alerts(self, db: Session, for_date: str, venue_id: str | None = None) -> dict:
        venue = self._get_or_create_venue(db, venue_id)
        normalized_date = self._normalize_date(for_date)
        alerts = self._inventory_alerts_internal(db, venue.id, normalized_date)

        waste_rows = (
            db.query(RestaurantStockSnapshot)
            .filter(RestaurantStockSnapshot.venue_id == venue.id, RestaurantStockSnapshot.snapshot_date == normalized_date)
            .all()
        )
        estimated_waste_qty = sum(max(r.waste_qty, 0.0) for r in waste_rows)

        # Estimate waste cost using latest known purchase cost per item.
        latest_cost: dict[str, float] = {}
        recent_prices = (
            db.query(RestaurantPurchase)
            .filter(RestaurantPurchase.venue_id == venue.id, RestaurantPurchase.purchase_date <= normalized_date)
            .order_by(RestaurantPurchase.item_name.asc(), RestaurantPurchase.purchase_date.desc())
            .all()
        )
        for row in recent_prices:
            key = row.item_name.lower()
            if key not in latest_cost:
                latest_cost[key] = row.unit_cost

        estimated_waste_cost = 0.0
        for row in waste_rows:
            estimated_waste_cost += max(row.waste_qty, 0.0) * latest_cost.get(row.item_name.lower(), 0.0)

        return {
            "date": normalized_date,
            "venue_id": venue.id,
            "alerts": alerts,
            "summary": {
                "alert_count": len(alerts),
                "estimated_waste_qty": round(estimated_waste_qty, 2),
                "estimated_waste_cost": round(estimated_waste_cost, 2),
            },
        }

    def get_finance_margin(
        self,
        db: Session,
        start_date: str,
        end_date: str,
        venue_id: str | None = None,
        fixed_cost: float = 3000.0,
    ) -> dict:
        venue = self._get_or_create_venue(db, venue_id)
        date_range = DateRange(start=self._normalize_date(start_date), end=self._normalize_date(end_date))

        sales_q = self._range_filter(
            db.query(RestaurantSale).filter(RestaurantSale.venue_id == venue.id),
            RestaurantSale.sale_date,
            date_range,
        )
        sales = sales_q.all()

        recipe_cost = self._recipe_cost_map(db, venue.id)

        by_item: dict[str, dict[str, float]] = {}
        by_channel: dict[str, float] = defaultdict(float)

        total_revenue = 0.0
        total_cogs = 0.0

        for row in sales:
            key = row.menu_item
            item = by_item.setdefault(
                key,
                {
                    "menu_item": key,
                    "quantity": 0,
                    "revenue": 0.0,
                    "estimated_cogs": 0.0,
                    "gross_margin": 0.0,
                    "margin_pct": 0.0,
                },
            )
            recipe_unit_cost = recipe_cost.get((row.menu_item or "").lower(), 0.0)
            cogs = recipe_unit_cost * row.quantity

            item["quantity"] += row.quantity
            item["revenue"] += row.net_sales
            item["estimated_cogs"] += cogs

            total_revenue += row.net_sales
            total_cogs += cogs
            by_channel[row.channel or "unknown"] += row.net_sales

        margin_items = []
        for item in by_item.values():
            gm = item["revenue"] - item["estimated_cogs"]
            margin_pct = (gm / item["revenue"] * 100) if item["revenue"] > 0 else 0.0
            item["gross_margin"] = round(gm, 2)
            item["margin_pct"] = round(margin_pct, 2)
            item["revenue"] = round(item["revenue"], 2)
            item["estimated_cogs"] = round(item["estimated_cogs"], 2)
            margin_items.append(item)

        margin_items.sort(key=lambda x: x["revenue"], reverse=True)

        gross_margin = total_revenue - total_cogs
        gross_margin_pct = (gross_margin / total_revenue * 100) if total_revenue > 0 else 0.0

        day_count = max((datetime.strptime(date_range.end, "%Y-%m-%d") - datetime.strptime(date_range.start, "%Y-%m-%d")).days + 1, 1)
        break_even_revenue = fixed_cost * day_count
        progress_to_break_even = (total_revenue / break_even_revenue * 100) if break_even_revenue > 0 else 0.0

        return {
            "date_range": {"from": date_range.start, "to": date_range.end},
            "venue_id": venue.id,
            "summary": {
                "revenue": round(total_revenue, 2),
                "estimated_cogs": round(total_cogs, 2),
                "gross_margin": round(gross_margin, 2),
                "gross_margin_pct": round(gross_margin_pct, 2),
                "break_even_revenue": round(break_even_revenue, 2),
                "break_even_progress_pct": round(progress_to_break_even, 2),
            },
            "items": margin_items,
            "channel_sales": [
                {"channel": channel, "revenue": round(revenue, 2)}
                for channel, revenue in sorted(by_channel.items(), key=lambda kv: kv[1], reverse=True)
            ],
        }

    def get_control_tower_daily(self, db: Session, date: str, venue_id: str | None = None) -> dict:
        venue = self._get_or_create_venue(db, venue_id)
        for_date = self._normalize_date(date)

        sales = (
            db.query(RestaurantSale)
            .filter(RestaurantSale.venue_id == venue.id, RestaurantSale.sale_date == for_date)
            .all()
        )
        labor = (
            db.query(RestaurantLaborShift)
            .filter(RestaurantLaborShift.venue_id == venue.id, RestaurantLaborShift.shift_date == for_date)
            .all()
        )
        reviews = (
            db.query(RestaurantReview)
            .filter(RestaurantReview.venue_id == venue.id, RestaurantReview.review_date == for_date)
            .all()
        )

        revenue = sum(s.net_sales for s in sales)
        forecast = sum(s.forecast_revenue if s.forecast_revenue is not None else s.net_sales for s in sales)
        covers = sum(s.covers for s in sales)
        avg_check = revenue / covers if covers > 0 else 0.0

        labor_cost = sum(s.labor_cost for s in labor)
        labor_pct = (labor_cost / revenue * 100) if revenue > 0 else 0.0

        recipe_cost = self._recipe_cost_map(db, venue.id)
        food_cost = 0.0
        for row in sales:
            food_cost += recipe_cost.get((row.menu_item or "").lower(), 0.0) * row.quantity

        # Fallback to purchases of the day when recipes are not yet defined.
        if food_cost == 0.0:
            food_cost = sum(
                r.total_cost
                for r in db.query(RestaurantPurchase)
                .filter(RestaurantPurchase.venue_id == venue.id, RestaurantPurchase.purchase_date == for_date)
                .all()
            )

        food_cost_pct = (food_cost / revenue * 100) if revenue > 0 else 0.0

        revenue_vs_forecast_pct = ((revenue - forecast) / forecast * 100) if forecast > 0 else 0.0
        sentiment_avg = sum(r.sentiment_score for r in reviews) / len(reviews) if reviews else 0.0

        anomalies: list[dict] = []

        if forecast > 0 and revenue < forecast * 0.9:
            anomalies.append(
                {
                    "category": "sales_gap",
                    "severity": "high",
                    "title": "Sales below forecast",
                    "why": f"Revenue is {abs(revenue_vs_forecast_pct):.1f}% below forecast.",
                    "metric": round(revenue_vs_forecast_pct, 2),
                }
            )

        if labor_pct > 35:
            anomalies.append(
                {
                    "category": "labor_cost",
                    "severity": "high",
                    "title": "Labor cost above target",
                    "why": f"Labor cost is {labor_pct:.1f}% vs target 30.0%.",
                    "metric": round(labor_pct, 2),
                }
            )

        if food_cost_pct > 32:
            anomalies.append(
                {
                    "category": "food_cost",
                    "severity": "medium",
                    "title": "Food cost above target",
                    "why": f"Food cost is {food_cost_pct:.1f}% vs target 30.0%.",
                    "metric": round(food_cost_pct, 2),
                }
            )

        inv = self._inventory_alerts_internal(db, venue.id, for_date)
        for alert in inv:
            if alert["category"] == "usage_variance":
                anomalies.append(
                    {
                        "category": "over_portioning",
                        "severity": alert["severity"],
                        "title": alert["title"],
                        "why": alert["why"],
                        "metric": alert["metric"],
                    }
                )

        # Persist anomalies for audit/history.
        for a in anomalies:
            exists = (
                db.query(RestaurantAnomaly)
                .filter(
                    RestaurantAnomaly.venue_id == venue.id,
                    RestaurantAnomaly.anomaly_date == for_date,
                    RestaurantAnomaly.title == a["title"],
                )
                .first()
            )
            if not exists:
                db.add(
                    RestaurantAnomaly(
                        venue_id=venue.id,
                        anomaly_date=for_date,
                        category=a["category"],
                        severity=a["severity"],
                        title=a["title"],
                        why=a["why"],
                        metric_value=a["metric"],
                        threshold=0.0,
                    )
                )
        db.commit()

        return {
            "date": for_date,
            "venue_id": venue.id,
            "kpis": {
                "revenue": round(revenue, 2),
                "forecast_revenue": round(forecast, 2),
                "revenue_vs_forecast_pct": round(revenue_vs_forecast_pct, 2),
                "covers": covers,
                "avg_check": round(avg_check, 2),
                "labor_cost": round(labor_cost, 2),
                "labor_cost_pct": round(labor_pct, 2),
                "food_cost": round(food_cost, 2),
                "food_cost_pct": round(food_cost_pct, 2),
                "review_sentiment": round(sentiment_avg, 2),
            },
            "anomalies": anomalies,
            "stock_alerts": inv,
        }

    def get_daily_recommendations(self, db: Session, date: str, venue_id: str | None = None) -> dict:
        venue = self._get_or_create_venue(db, venue_id)
        for_date = self._normalize_date(date)

        control = self.get_control_tower_daily(db, for_date, venue.id)
        margin = self.get_finance_margin(db, for_date, for_date, venue.id)
        inventory = self.get_inventory_alerts(db, for_date, venue.id)

        kpis = control["kpis"]
        recs: list[dict] = []

        if kpis["revenue_vs_forecast_pct"] < -10:
            recs.append(
                {
                    "category": "sales_recovery",
                    "title": "Sales are below expected demand",
                    "warning": f"Revenue is {abs(kpis['revenue_vs_forecast_pct']):.1f}% below forecast.",
                    "why": "Demand is tracking under baseline for this service period.",
                    "next_action": "Run a same-day promotion on top-selling dishes and adjust labor for late shift.",
                    "automatable": True,
                }
            )

        if kpis["labor_cost_pct"] > 30:
            recs.append(
                {
                    "category": "labor_optimization",
                    "title": "Labor pressure detected",
                    "warning": f"Labor is {kpis['labor_cost_pct']:.1f}% vs target 30.0%.",
                    "why": "Staffing is currently above demand-adjusted target.",
                    "next_action": "Offer voluntary early release for one FOH shift and rebalance tomorrow's roster.",
                    "automatable": True,
                }
            )

        if kpis["food_cost_pct"] > 30:
            recs.append(
                {
                    "category": "food_cost",
                    "title": "Food cost above healthy range",
                    "warning": f"Food cost is {kpis['food_cost_pct']:.1f}% vs target 30.0%.",
                    "why": "Recipe cost and usage variance are diluting gross margin.",
                    "next_action": "Audit portioning on top 3 dishes and test a 3-5% repricing where demand is inelastic.",
                    "automatable": False,
                }
            )

        low_margin_items = [i for i in margin["items"] if i["revenue"] > 0 and i["margin_pct"] < 40]
        if low_margin_items:
            worst = low_margin_items[0]
            recs.append(
                {
                    "category": "menu_margin",
                    "title": f"Low-margin dish: {worst['menu_item']}",
                    "warning": f"Margin is {worst['margin_pct']:.1f}% on a high-volume item.",
                    "why": "Current price-to-cost ratio is under target for this dish.",
                    "next_action": f"Test incremental repricing or bundle strategy for {worst['menu_item']}.",
                    "automatable": False,
                }
            )

        inv_high = [a for a in inventory["alerts"] if a["severity"] == "high"]
        if inv_high:
            top = inv_high[0]
            recs.append(
                {
                    "category": "inventory_risk",
                    "title": top["title"],
                    "warning": top["why"],
                    "why": "Inventory risk may cause stockouts, over-portioning, or COGS inflation.",
                    "next_action": top["next_action"],
                    "automatable": True,
                }
            )

        if not recs:
            recs.append(
                {
                    "category": "steady_state",
                    "title": "Operations on track",
                    "warning": "No critical anomalies detected for this date.",
                    "why": "Current KPIs are inside configured guardrails.",
                    "next_action": "Monitor evening service and keep tomorrow's prep plan unchanged.",
                    "automatable": False,
                }
            )

        # Persist recommendations (idempotent by date/title).
        for rec in recs:
            exists = (
                db.query(RestaurantRecommendation)
                .filter(
                    RestaurantRecommendation.venue_id == venue.id,
                    RestaurantRecommendation.rec_date == for_date,
                    RestaurantRecommendation.title == rec["title"],
                )
                .first()
            )
            if not exists:
                db.add(
                    RestaurantRecommendation(
                        venue_id=venue.id,
                        rec_date=for_date,
                        category=rec["category"],
                        title=rec["title"],
                        warning=rec["warning"],
                        why=rec["why"],
                        next_action=rec["next_action"],
                        automatable=rec["automatable"],
                        status="open",
                    )
                )
        db.commit()

        return {
            "date": for_date,
            "venue_id": venue.id,
            "recommendations": recs,
            "kpi_snapshot": kpis,
        }

    async def handle(self, message: str, context: dict) -> dict:
        """Skill handler used by Brain orchestrator for restaurant-oriented prompts."""
        db = SessionLocal()
        try:
            venue_id = context.get("venue_id") if context else None
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            msg = (message or "").lower()

            if any(k in msg for k in ["profit", "margin", "dish", "menu"]):
                margin = self.get_finance_margin(db, today, today, venue_id)
                low = [i for i in margin["items"] if i["margin_pct"] < 40]
                if low:
                    worst = low[0]
                    return {
                        "response": (
                            f"Margin update: {worst['menu_item']} is under target at {worst['margin_pct']}% margin. "
                            "Recommend repricing or bundle optimization to protect gross margin."
                        )
                    }
                return {"response": "Margin update: no low-margin dish detected in today's data."}

            if any(k in msg for k in ["order", "reorder", "stock", "waste", "inventory"]):
                inv = self.get_inventory_alerts(db, today, venue_id)
                if inv["alerts"]:
                    top = inv["alerts"][0]
                    return {"response": f"Inventory alert: {top['title']}. {top['why']} Next action: {top['next_action']}"}
                return {"response": "Inventory looks stable for today. No urgent stock or waste alerts."}

            if any(k in msg for k in ["shift", "labor", "staff", "covers"]):
                ct = self.get_control_tower_daily(db, today, venue_id)
                return {
                    "response": (
                        f"Labor is currently {ct['kpis']['labor_cost_pct']}% of revenue with "
                        f"{ct['kpis']['covers']} covers. "
                        "If demand stays below forecast, consider reducing one late shift role."
                    )
                }

            recs = self.get_daily_recommendations(db, today, venue_id)
            top = recs["recommendations"][0]
            return {
                "response": (
                    f"Daily recommendation: {top['title']}. {top['warning']} "
                    f"Why: {top['why']} Next action: {top['next_action']}"
                )
            }
        finally:
            db.close()

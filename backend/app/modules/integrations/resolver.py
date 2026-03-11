"""Persistent connector ownership and credential resolution for MVP 2.0."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.exc import SQLAlchemyError

from ...core.catalog import PILOT_CONNECTORS
from ...core.config import settings
from ...db import models
from ...db.session import SessionLocal

WORKSPACE_OWNER_SCOPE = "workspace"
DEFAULT_WORKSPACE_OWNER_ID = "default"

CAPABILITY_MANAGED_PILOT = "managed_pilot"
CAPABILITY_FUTURE_SELF_SERVE = "future_self_serve"
CAPABILITY_DEMO_ONLY = "demo_only"

FUTURE_SELF_SERVE_CONNECTORS = {
    "google_ads",
    "meta_ads",
    "tiktok_ads",
    "linkedin",
    "salesforce",
    "zoho_crm",
    "shopify",
    "facebook_pages",
    "twitter",
}


@dataclass
class ResolvedConnection:
    connector: str
    owner_scope: str
    owner_id: str
    auth_mode: str
    capability: str
    credentials: dict[str, Any]
    configured: bool
    last_tested_at: Optional[datetime]


class ConnectionResolver:
    """Resolve managed workspace credentials and persist connection state."""

    def capability_for(self, connector: str) -> str:
        if connector in PILOT_CONNECTORS:
            return CAPABILITY_MANAGED_PILOT
        if connector in FUTURE_SELF_SERVE_CONNECTORS:
            return CAPABILITY_FUTURE_SELF_SERVE
        return CAPABILITY_DEMO_ONLY

    def resolve(
        self,
        connector: str,
        credential_overrides: Optional[dict[str, Any]] = None,
    ) -> ResolvedConnection:
        capability = self.capability_for(connector)
        credentials: dict[str, Any] = {}
        if capability == CAPABILITY_MANAGED_PILOT:
            credentials.update(self._workspace_default_credentials(connector))
        if credential_overrides:
            credentials.update(credential_overrides)

        auth_mode = self._derive_auth_mode(connector, capability, credential_overrides)
        configured = self._is_live_configured(connector, credentials) if credentials else False
        record = self._ensure_record(
            connector=connector,
            owner_scope=WORKSPACE_OWNER_SCOPE,
            owner_id=DEFAULT_WORKSPACE_OWNER_ID,
            auth_mode=auth_mode,
            configured=configured,
        )
        return ResolvedConnection(
            connector=connector,
            owner_scope=record.owner_scope,
            owner_id=record.owner_id,
            auth_mode=auth_mode,
            capability=capability,
            credentials=credentials,
            configured=configured,
            last_tested_at=record.last_tested_at,
        )

    def describe(
        self,
        connector: str,
        credential_overrides: Optional[dict[str, Any]] = None,
        *,
        connector_status: Optional[dict[str, Any]] = None,
        error: Optional[str] = None,
        mark_tested: bool = False,
    ) -> dict[str, Any]:
        resolved = self.resolve(connector, credential_overrides=credential_overrides)
        return self.describe_from_resolved(
            resolved,
            connector_status=connector_status,
            error=error,
            mark_tested=mark_tested,
        )

    def describe_from_resolved(
        self,
        resolved: ResolvedConnection,
        *,
        connector_status: Optional[dict[str, Any]] = None,
        error: Optional[str] = None,
        mark_tested: bool = False,
    ) -> dict[str, Any]:
        if connector_status is not None:
            demo_fallback = bool(connector_status.get("demo_mode", False))
        else:
            demo_fallback = not resolved.configured or resolved.capability != CAPABILITY_MANAGED_PILOT
        ready_for_live = resolved.configured and not demo_fallback
        if error:
            status = "error"
        elif ready_for_live:
            status = "live"
        elif demo_fallback:
            status = "demo"
        else:
            status = "pending"

        tested_at = datetime.now(timezone.utc) if mark_tested else resolved.last_tested_at
        stored = self._update_record(
            connector=resolved.connector,
            owner_scope=resolved.owner_scope,
            owner_id=resolved.owner_id,
            auth_mode=resolved.auth_mode,
            status=status,
            configured=resolved.configured,
            demo_fallback=demo_fallback,
            last_tested_at=tested_at,
        )
        return {
            "id": stored.id,
            "connector": resolved.connector,
            "owner_scope": stored.owner_scope,
            "owner_id": stored.owner_id,
            "auth_mode": stored.auth_mode,
            "status": stored.status,
            "configured": stored.configured,
            "ready_for_live": ready_for_live,
            "demo_fallback": stored.demo_fallback,
            "last_tested_at": stored.last_tested_at.isoformat() if stored.last_tested_at else None,
            "capability": resolved.capability,
            "mode_label": self.mode_label(
                capability=resolved.capability,
                status=stored.status,
                auth_mode=stored.auth_mode,
            ),
            "authenticated": bool(connector_status.get("authenticated", False)) if connector_status else False,
        }

    def list_catalog_items(self, connectors: list[str]) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for connector in connectors:
            details = self.describe(connector)
            rows.append(details | {"name": connector, "demo_mode": details["demo_fallback"]})
        return rows

    @staticmethod
    def mode_label(*, capability: str, status: str, auth_mode: str) -> str:
        if status == "live":
            if capability == CAPABILITY_MANAGED_PILOT:
                return "Live via managed workspace connection"
            return "Live connection"
        if capability == CAPABILITY_FUTURE_SELF_SERVE:
            return "Self-serve OAuth coming soon"
        if auth_mode == "managed" and capability == CAPABILITY_MANAGED_PILOT:
            return "Demo fallback"
        return "Demo fallback"

    @staticmethod
    def _derive_auth_mode(
        connector: str,
        capability: str,
        credential_overrides: Optional[dict[str, Any]],
    ) -> str:
        if capability == CAPABILITY_MANAGED_PILOT and not credential_overrides:
            return "managed"
        overrides = credential_overrides or {}
        if overrides.get("access_token") or overrides.get("refresh_token"):
            return "oauth"
        if overrides.get("api_key") or overrides.get("property_id") or overrides.get("shop"):
            return "api_key"
        if capability == CAPABILITY_FUTURE_SELF_SERVE:
            return "oauth"
        if capability == CAPABILITY_MANAGED_PILOT:
            return "managed"
        return "api_key"

    @staticmethod
    def _workspace_default_credentials(connector: str) -> dict[str, Any]:
        if connector == "hubspot":
            defaults: dict[str, Any] = {}
            if settings.HUBSPOT_API_KEY:
                defaults["api_key"] = settings.HUBSPOT_API_KEY
            if settings.HUBSPOT_ACCESS_TOKEN:
                defaults["access_token"] = settings.HUBSPOT_ACCESS_TOKEN
            return defaults
        if connector == "google_analytics":
            defaults = {}
            if settings.GOOGLE_ANALYTICS_PROPERTY_ID:
                defaults["property_id"] = settings.GOOGLE_ANALYTICS_PROPERTY_ID
            if settings.GOOGLE_ANALYTICS_ACCESS_TOKEN:
                defaults["access_token"] = settings.GOOGLE_ANALYTICS_ACCESS_TOKEN
            return defaults
        if connector == "stripe":
            return {"api_key": settings.STRIPE_SECRET_KEY} if settings.STRIPE_SECRET_KEY else {}
        return {}

    @staticmethod
    def _is_live_configured(connector: str, credentials: dict[str, Any]) -> bool:
        if connector == "hubspot":
            return bool(credentials.get("api_key") or credentials.get("access_token"))
        if connector == "google_analytics":
            return bool(credentials.get("property_id") and credentials.get("access_token"))
        if connector == "stripe":
            return bool(credentials.get("api_key"))
        if connector == "n8n":
            return bool(credentials.get("base_url"))
        return bool(credentials)

    @staticmethod
    def _ensure_record(
        *,
        connector: str,
        owner_scope: str,
        owner_id: str,
        auth_mode: str,
        configured: bool,
    ) -> models.IntegrationConnection:
        try:
            with SessionLocal() as db:
                row = (
                    db.query(models.IntegrationConnection)
                    .filter(
                        models.IntegrationConnection.connector == connector,
                        models.IntegrationConnection.owner_scope == owner_scope,
                        models.IntegrationConnection.owner_id == owner_id,
                    )
                    .first()
                )
                if row is None:
                    row = models.IntegrationConnection(
                        connector=connector,
                        owner_scope=owner_scope,
                        owner_id=owner_id,
                        auth_mode=auth_mode,
                        configured=configured,
                        demo_fallback=not configured,
                        status="pending",
                    )
                    db.add(row)
                    db.commit()
                    db.refresh(row)
                else:
                    changed = False
                    if row.auth_mode != auth_mode:
                        row.auth_mode = auth_mode
                        changed = True
                    if row.configured != configured:
                        row.configured = configured
                        changed = True
                    if changed:
                        db.commit()
                        db.refresh(row)
                db.expunge(row)
                return row
        except SQLAlchemyError:
            return models.IntegrationConnection(
                connector=connector,
                owner_scope=owner_scope,
                owner_id=owner_id,
                auth_mode=auth_mode,
                configured=configured,
                demo_fallback=not configured,
                status="pending",
            )

    @staticmethod
    def _update_record(
        *,
        connector: str,
        owner_scope: str,
        owner_id: str,
        auth_mode: str,
        status: str,
        configured: bool,
        demo_fallback: bool,
        last_tested_at: Optional[datetime],
    ) -> models.IntegrationConnection:
        try:
            with SessionLocal() as db:
                row = (
                    db.query(models.IntegrationConnection)
                    .filter(
                        models.IntegrationConnection.connector == connector,
                        models.IntegrationConnection.owner_scope == owner_scope,
                        models.IntegrationConnection.owner_id == owner_id,
                    )
                    .first()
                )
                if row is None:
                    row = models.IntegrationConnection(
                        connector=connector,
                        owner_scope=owner_scope,
                        owner_id=owner_id,
                    )
                    db.add(row)
                row.auth_mode = auth_mode
                row.status = status
                row.configured = configured
                row.demo_fallback = demo_fallback
                if last_tested_at is not None:
                    row.last_tested_at = last_tested_at
                db.commit()
                db.refresh(row)
                db.expunge(row)
                return row
        except SQLAlchemyError:
            return models.IntegrationConnection(
                connector=connector,
                owner_scope=owner_scope,
                owner_id=owner_id,
                auth_mode=auth_mode,
                status=status,
                configured=configured,
                demo_fallback=demo_fallback,
                last_tested_at=last_tested_at,
            )

"""
Integration service layer for connector lifecycle and execution.
"""

from __future__ import annotations

import inspect
from typing import Any, Optional

from ...core.config import settings
from . import ConnectorRegistry
from .base import ConnectorInterface
from .n8n_catalog import list_n8n_connectors, n8n_catalog_stats


class IntegrationService:
    """Coordinates connector discovery, auth, status checks, and actions."""

    def __init__(self) -> None:
        self.registry = ConnectorRegistry()
        self._active_connectors: dict[str, ConnectorInterface] = {}

    def list_catalog(self) -> dict[str, Any]:
        marketplace = n8n_catalog_stats()
        return {
            "connectors": self.registry.list_connectors(),
            "categories": self.registry.list_categories(),
            "total": len(self.registry.CONNECTOR_MAP),
            "marketplace": {
                "source": "n8n_snapshot",
                **marketplace,
            },
        }

    def list_marketplace_catalog(
        self,
        limit: int = 200,
        search: Optional[str] = None,
        provider: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict[str, Any]:
        requested_provider = (provider or "all").strip().lower()
        requested_category = (category or "").strip().lower()

        rows: list[dict[str, Any]] = []
        if requested_provider in {"all", "native"}:
            rows.extend(
                self._list_native_marketplace(
                    search=search,
                    category=requested_category or None,
                )
            )
        if requested_provider in {"all", "n8n", "n8n_snapshot"}:
            rows.extend(
                list_n8n_connectors(
                    limit=limit,
                    search=search,
                    category=requested_category or None,
                )
            )

        max_rows = max(1, min(limit, len(rows)))
        clipped = rows[:max_rows]
        return {
            "connectors": clipped,
            "returned": len(clipped),
            "search": search or "",
            "provider": requested_provider,
            "category": requested_category,
            "stats": {
                "source": "mixed_catalog",
                "native_total_connectors": len(self.registry.CONNECTOR_MAP),
                "available_providers": ["all", "native", "n8n"],
                **n8n_catalog_stats(),
            },
        }

    def _list_native_marketplace(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        query = (search or "").strip().lower()
        category_filter = (category or "").strip().lower()

        rows: list[dict[str, Any]] = []
        for idx, connector in enumerate(self.registry.list_connectors(), start=1):
            key = connector["key"]
            name = self._humanize_connector_key(key)
            connector_category = connector.get("category", "")

            if category_filter and connector_category != category_filter:
                continue
            if query and query not in key and query not in name.lower():
                continue

            rows.append(
                {
                    "id": f"native-{idx:04d}",
                    "key": key,
                    "name": name,
                    "provider": "native",
                    "type": "connector_native",
                    "category": connector_category,
                    "source_url": None,
                }
            )
        return rows

    @staticmethod
    def _humanize_connector_key(key: str) -> str:
        if key == "n8n":
            return "n8n"
        return " ".join(part.upper() if part == "crm" else part.capitalize() for part in key.split("_"))

    def _resolve(
        self,
        name: str,
        credentials: Optional[dict[str, Any]] = None,
    ) -> ConnectorInterface:
        if credentials is None and name in self._active_connectors:
            return self._active_connectors[name]

        resolved_credentials = self._default_credentials(name)
        if credentials:
            resolved_credentials.update(credentials)

        connector = self.registry.get(name, **resolved_credentials)
        self._active_connectors[name] = connector
        return connector

    @staticmethod
    def _default_credentials(name: str) -> dict[str, Any]:
        """Default connector credentials sourced from app settings."""
        if name == "n8n":
            defaults: dict[str, Any] = {"base_url": settings.N8N_BASE_URL}
            if settings.N8N_API_KEY:
                defaults["api_key"] = settings.N8N_API_KEY
            if settings.N8N_DEFAULT_WEBHOOK_URL:
                defaults["default_webhook_url"] = settings.N8N_DEFAULT_WEBHOOK_URL
            if settings.N8N_DEFAULT_WEBHOOK_PATH:
                defaults["default_webhook_path"] = settings.N8N_DEFAULT_WEBHOOK_PATH
            return defaults
        return {}

    async def connect(
        self,
        name: str,
        credentials: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        connector = self._resolve(name, credentials)
        await connector.authenticate()
        return connector.get_status()

    async def status(self, name: str) -> dict[str, Any]:
        connector = self._resolve(name)
        if not connector.get_status().get("authenticated") and not connector.demo_mode:
            await connector.authenticate()
        return connector.get_status()

    async def test(
        self,
        name: str,
        credentials: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        connector = self._resolve(name, credentials)
        await connector.authenticate()
        return {
            "status": "ok",
            "connector_status": connector.get_status(),
            "message": "Connection test completed",
        }

    async def run_action(
        self,
        name: str,
        action: Optional[str] = None,
        payload: Optional[dict[str, Any]] = None,
        endpoint: Optional[str] = None,
        method: str = "GET",
        params: Optional[dict[str, Any]] = None,
        data: Optional[dict[str, Any]] = None,
        credentials: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        connector = self._resolve(name, credentials)
        await connector.authenticate()

        result: Any
        if action:
            if not hasattr(connector, action):
                raise ValueError(f"Unsupported action '{action}' for connector '{name}'.")
            fn = getattr(connector, action)
            if not callable(fn):
                raise ValueError(f"Connector action '{action}' is not callable.")
            result = fn(**(payload or {}))
            if inspect.isawaitable(result):
                result = await result
        else:
            if not endpoint:
                raise ValueError("Either 'action' or 'endpoint' must be provided.")
            upper_method = method.upper()
            if upper_method == "GET":
                result = await connector.get_data(endpoint, params=params)
            elif upper_method == "POST":
                request_body = data if data is not None else payload
                result = await connector.post_data(endpoint, data=request_body)
            else:
                raise ValueError(
                    f"Unsupported method '{method}'. Supported methods: GET, POST."
                )

        return {
            "status": "success",
            "connector_status": connector.get_status(),
            "result": result,
        }

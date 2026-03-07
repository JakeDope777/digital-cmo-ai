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
        offset: int = 0,
        search: Optional[str] = None,
        provider: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict[str, Any]:
        requested_provider = (provider or "all").strip().lower()
        requested_category = (category or "").strip().lower()

        rows = self._collect_marketplace_rows(
            search=search,
            provider=requested_provider,
            category=requested_category or None,
        )
        safe_offset = max(0, offset)
        safe_limit = max(1, limit)
        clipped = rows[safe_offset : safe_offset + safe_limit]
        next_offset = safe_offset + len(clipped)
        return {
            "connectors": clipped,
            "returned": len(clipped),
            "offset": safe_offset,
            "next_offset": next_offset,
            "has_more": next_offset < len(rows),
            "total_filtered": len(rows),
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

    def get_marketplace_summary(
        self,
        search: Optional[str] = None,
        provider: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict[str, Any]:
        requested_provider = (provider or "all").strip().lower()
        requested_category = (category or "").strip().lower()
        rows = self._collect_marketplace_rows(
            search=search,
            provider=requested_provider,
            category=requested_category or None,
        )
        provider_counts: dict[str, int] = {}
        category_counts: dict[str, int] = {}
        for row in rows:
            provider_key = row.get("provider") or "unknown"
            provider_counts[provider_key] = provider_counts.get(provider_key, 0) + 1
            category_key = row.get("category") or "other"
            category_counts[category_key] = category_counts.get(category_key, 0) + 1

        top_categories = sorted(
            (
                {"key": key, "count": count}
                for key, count in category_counts.items()
            ),
            key=lambda item: item["count"],
            reverse=True,
        )
        return {
            "provider": requested_provider,
            "category": requested_category,
            "search": search or "",
            "total_filtered": len(rows),
            "providers": sorted(
                (
                    {"key": key, "count": count}
                    for key, count in provider_counts.items()
                ),
                key=lambda item: item["key"],
            ),
            "categories": top_categories,
        }

    def list_marketplace_providers(self) -> dict[str, Any]:
        native_rows = self._list_native_marketplace()
        n8n_rows = list_n8n_connectors(limit=5000)
        native_categories = sorted({row["category"] for row in native_rows if row.get("category")})
        n8n_categories = sorted({row["category"] for row in n8n_rows if row.get("category")})
        return {
            "providers": [
                {
                    "key": "native",
                    "name": "Native Connectors",
                    "count": len(native_rows),
                    "categories": native_categories,
                },
                {
                    "key": "n8n",
                    "name": "n8n Templates",
                    "count": len(n8n_rows),
                    "categories": n8n_categories,
                    "source": n8n_catalog_stats(),
                },
            ],
            "total_visible": len(native_rows) + len(n8n_rows),
        }

    def get_marketplace_connector_detail(
        self,
        connector_key: str,
        provider: Optional[str] = None,
    ) -> dict[str, Any]:
        requested_provider = (provider or "all").strip().lower()
        key = (connector_key or "").strip().lower()
        if not key:
            raise ValueError("Connector key is required.")

        matches: list[dict[str, Any]] = []
        if requested_provider in {"all", "native"}:
            matches.extend(
                [row for row in self._list_native_marketplace() if row["key"].lower() == key]
            )
        if requested_provider in {"all", "n8n", "n8n_snapshot"}:
            matches.extend(
                [row for row in list_n8n_connectors(limit=5000) if row["key"].lower() == key]
            )

        if not matches:
            raise ValueError(f"Unknown marketplace connector '{connector_key}'.")

        primary = matches[0]
        native_variant = next((row for row in matches if row["provider"] == "native"), None)
        n8n_variant = next((row for row in matches if row["provider"] == "n8n"), None)
        return {
            "key": key,
            "display_name": primary["name"],
            "requested_provider": requested_provider,
            "providers_available": sorted({row["provider"] for row in matches}),
            "category": primary.get("category"),
            "native_connector": native_variant,
            "n8n_template": n8n_variant,
            "suggested_actions": self._suggested_actions(key, providers=matches),
            "variants": matches,
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
                    "class": connector.get("class"),
                    "base_url": connector.get("base_url"),
                    "source_url": None,
                }
            )
        return rows

    def _collect_marketplace_rows(
        self,
        search: Optional[str] = None,
        provider: str = "all",
        category: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        if provider in {"all", "native"}:
            rows.extend(
                self._list_native_marketplace(
                    search=search,
                    category=category,
                )
            )
        if provider in {"all", "n8n", "n8n_snapshot"}:
            rows.extend(
                list_n8n_connectors(
                    limit=5000,
                    search=search,
                    category=category,
                )
            )
        return rows

    @staticmethod
    def _humanize_connector_key(key: str) -> str:
        if key == "n8n":
            return "n8n"
        return " ".join(part.upper() if part == "crm" else part.capitalize() for part in key.split("_"))

    @staticmethod
    def _suggested_actions(key: str, providers: list[dict[str, Any]]) -> list[str]:
        suggestions: list[str] = []
        if any(row.get("provider") == "native" for row in providers):
            suggestions.extend(["connect", "test", "status", "action"])
        if key == "n8n":
            suggestions.extend(
                [
                    "trigger_workflow",
                    "send_event",
                    "sync_contact",
                    "sync_campaign_metrics",
                ]
            )
        if any(row.get("provider") == "n8n" for row in providers):
            suggestions.append("create workflow in n8n")
        # preserve order, remove duplicates
        return list(dict.fromkeys(suggestions))

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

"""Canonical frontend/backend catalog for domains, modules, and pilot connectors."""

from __future__ import annotations

from typing import Optional

PUBLIC_MODULES = [
    "dashboard",
    "chat",
    "analysis",
    "creative",
    "crm",
    "growth",
    "integrations",
    "billing",
    "profile",
    "settings",
]

PUBLIC_DOMAINS = [
    "ecommerce",
    "saas",
    "fintech",
    "igaming",
    "healthtech",
    "proptech",
    "edtech",
    "agency",
]

PUBLIC_DOMAIN_METADATA = {
    "ecommerce": {
        "label": "Ecommerce",
        "description": "Online retail, D2C, marketplaces, and omnichannel growth teams.",
    },
    "saas": {
        "label": "SaaS",
        "description": "B2B and B2C software, cloud platforms, AI tools, and recurring revenue products.",
    },
    "fintech": {
        "label": "Fintech",
        "description": "Payments, banking, wealth, lending, and financial software operators.",
    },
    "igaming": {
        "label": "iGaming",
        "description": "Sports betting, casino, sportsbook, and regulated gaming operators.",
    },
    "healthtech": {
        "label": "Healthtech",
        "description": "Digital health, telemedicine, care operations, and regulated patient acquisition teams.",
    },
    "proptech": {
        "label": "Proptech",
        "description": "Real estate platforms, brokerages, listings, and property operations teams.",
    },
    "edtech": {
        "label": "Edtech",
        "description": "Learning platforms, schools, cohort products, and learner lifecycle teams.",
    },
    "agency": {
        "label": "Agency",
        "description": "Service businesses managing multi-client acquisition, reporting, and creative delivery.",
    },
}

LEGACY_DOMAIN_ALIASES = {
    "tech_saas": "saas",
    "ecommerce_retail": "ecommerce",
    "finance_fintech": "fintech",
    "healthcare": "healthtech",
    "real_estate": "proptech",
    "education": "edtech",
}

PILOT_CONNECTORS = ["hubspot", "google_analytics", "stripe"]


def resolve_domain_id(domain_id: Optional[str]) -> Optional[str]:
    """Resolve canonical public domain ids from canonical or legacy values."""
    if domain_id is None:
        return None
    normalized = domain_id.strip().lower()
    if not normalized:
        return None
    if normalized in PUBLIC_DOMAINS:
        return normalized
    return LEGACY_DOMAIN_ALIASES.get(normalized)


def is_public_module(module_id: Optional[str]) -> bool:
    return bool(module_id and module_id in PUBLIC_MODULES)


def list_public_domains() -> list[dict[str, str]]:
    return [
        {
            "id": domain_id,
            "label": PUBLIC_DOMAIN_METADATA[domain_id]["label"],
            "description": PUBLIC_DOMAIN_METADATA[domain_id]["description"],
        }
        for domain_id in PUBLIC_DOMAINS
    ]

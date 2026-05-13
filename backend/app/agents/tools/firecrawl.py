"""
Firecrawl connector — scrapes competitor sites and extracts structured content.
Env var: FIRECRAWL_API_KEY
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

FIRECRAWL_API = "https://api.firecrawl.dev/v1"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {getattr(settings, 'FIRECRAWL_API_KEY', '')}",
        "Content-Type": "application/json",
    }


async def scrape_url(inputs: dict) -> dict[str, Any]:
    """
    Tool: scrape_competitor_page
    Scrapes a single URL and returns clean markdown content.
    inputs: { url: str, extract_schema: dict (optional) }
    """
    url = inputs.get("url", "")
    if not url:
        return {"error": "url is required"}

    key = getattr(settings, "FIRECRAWL_API_KEY", "")
    if not key:
        return _demo_scrape(url)

    payload: dict = {
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
    }

    # Optional structured extraction
    extract_schema = inputs.get("extract_schema")
    if extract_schema:
        payload["extract"] = {"schema": extract_schema}

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{FIRECRAWL_API}/scrape",
                headers=_headers(),
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        return {
            "url": url,
            "content": data.get("data", {}).get("markdown", ""),
            "metadata": data.get("data", {}).get("metadata", {}),
        }
    except Exception as exc:
        logger.error("Firecrawl scrape failed for %s: %s", url, exc)
        return {"error": str(exc), "url": url}


async def crawl_site(inputs: dict) -> dict[str, Any]:
    """
    Tool: crawl_competitor_site
    Crawls up to N pages of a competitor site (pricing, blog, features).
    inputs: { base_url: str, max_pages: int = 5, include_paths: list[str] }
    """
    base_url = inputs.get("base_url", "")
    max_pages = int(inputs.get("max_pages", 5))
    include_paths = inputs.get("include_paths", ["/pricing", "/blog", "/features"])

    key = getattr(settings, "FIRECRAWL_API_KEY", "")
    if not key:
        return _demo_crawl(base_url)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            # Start crawl
            resp = await client.post(
                f"{FIRECRAWL_API}/crawl",
                headers=_headers(),
                json={
                    "url": base_url,
                    "limit": max_pages,
                    "includePaths": include_paths,
                    "scrapeOptions": {"formats": ["markdown"], "onlyMainContent": True},
                },
            )
            resp.raise_for_status()
            crawl_id = resp.json().get("id")

            if not crawl_id:
                return {"error": "No crawl ID returned"}

            # Poll for results (simplified — in prod use webhook)
            import asyncio
            for _ in range(10):
                await asyncio.sleep(3)
                status_resp = await client.get(
                    f"{FIRECRAWL_API}/crawl/{crawl_id}",
                    headers=_headers(),
                )
                status_resp.raise_for_status()
                status_data = status_resp.json()

                if status_data.get("status") == "completed":
                    pages = status_data.get("data", [])
                    return {
                        "base_url": base_url,
                        "pages_crawled": len(pages),
                        "pages": [
                            {
                                "url": p.get("metadata", {}).get("sourceURL", ""),
                                "content": p.get("markdown", "")[:2000],  # truncate
                            }
                            for p in pages
                        ],
                    }

            return {"error": "Crawl timed out", "crawl_id": crawl_id}
    except Exception as exc:
        logger.error("Firecrawl crawl failed for %s: %s", base_url, exc)
        return {"error": str(exc)}


TOOL_DEFS = [
    {
        "name": "scrape_competitor_page",
        "description": "Scrape a single competitor URL and return clean content (pricing, landing page, blog post).",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "Full URL to scrape"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "crawl_competitor_site",
        "description": "Crawl multiple pages of a competitor site to extract pricing, features, and blog content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "base_url": {"type": "string", "description": "Base URL of competitor site"},
                "max_pages": {"type": "integer", "default": 5},
                "include_paths": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "URL path prefixes to crawl",
                    "default": ["/pricing", "/blog", "/features"],
                },
            },
            "required": ["base_url"],
        },
    },
]

TOOL_REGISTRY = {
    "scrape_competitor_page": scrape_url,
    "crawl_competitor_site": crawl_site,
}


def _demo_scrape(url: str) -> dict:
    return {
        "url": url,
        "content": f"# Demo Content for {url}\n\nThis is demo content. Configure FIRECRAWL_API_KEY to get real data.\n\n## Pricing\n- Plan A: $49/mo\n- Plan B: $99/mo",
        "note": "DEMO DATA — configure FIRECRAWL_API_KEY",
    }


def _demo_crawl(base_url: str) -> dict:
    return {
        "base_url": base_url,
        "pages_crawled": 3,
        "pages": [
            {"url": f"{base_url}/pricing", "content": "## Pricing\nStarter: $49/mo, Pro: $149/mo"},
            {"url": f"{base_url}/blog", "content": "## Latest Posts\n- How we grew 3x in Q1\n- New feature: AI reports"},
        ],
        "note": "DEMO DATA — configure FIRECRAWL_API_KEY",
    }

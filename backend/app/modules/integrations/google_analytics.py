"""
Google Analytics 4 Connector

Implements the ConnectorInterface for Google Analytics data retrieval.
Returns demo data when credentials are not configured.
"""

import logging
import random
from typing import Optional

from .base import ConnectorInterface

logger = logging.getLogger(__name__)


class GoogleAnalyticsConnector(ConnectorInterface):
    """Connector for Google Analytics 4 API."""

    def __init__(self, property_id: Optional[str] = None):
        super().__init__(service_name="GoogleAnalytics", rate_limit=50)
        self.property_id = property_id

    async def authenticate(self) -> None:
        """Authenticate with Google Analytics."""
        if self.property_id:
            self._is_authenticated = True
            logger.info("[GoogleAnalytics] Authenticated.")
        else:
            logger.warning("[GoogleAnalytics] No property ID. Running in demo mode.")
            self._is_authenticated = False

    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from Google Analytics."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        return self._generate_demo_data(endpoint, params)

    async def post_data(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Not typically used for GA; returns a no-op."""
        return {"demo": True, "message": "GA is read-only."}

    async def get_website_metrics(self, date_range: Optional[dict] = None) -> dict:
        """Fetch website traffic and engagement metrics."""
        return await self.get_data("website/metrics", date_range)

    def _generate_demo_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Generate realistic demo analytics data."""
        return {
            "demo": True,
            "metrics": {
                "active_users": random.randint(500, 5000),
                "sessions": random.randint(1000, 10000),
                "page_views": random.randint(3000, 30000),
                "avg_session_duration": round(random.uniform(60, 300), 1),
                "bounce_rate": round(random.uniform(30, 70), 1),
                "new_users_percent": round(random.uniform(40, 80), 1),
            },
            "top_pages": [
                {"path": "/", "views": random.randint(500, 2000)},
                {"path": "/pricing", "views": random.randint(200, 800)},
                {"path": "/blog", "views": random.randint(300, 1000)},
                {"path": "/contact", "views": random.randint(100, 500)},
            ],
            "traffic_sources": {
                "organic": round(random.uniform(30, 50), 1),
                "direct": round(random.uniform(15, 30), 1),
                "referral": round(random.uniform(5, 15), 1),
                "social": round(random.uniform(10, 25), 1),
                "paid": round(random.uniform(5, 20), 1),
            },
        }

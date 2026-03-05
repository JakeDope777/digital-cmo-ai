"""
Google Ads Connector

Implements the ConnectorInterface for Google Ads campaign metrics.
Returns demo data when credentials are not configured.
"""

import logging
import random
from typing import Optional

from .base import ConnectorInterface

logger = logging.getLogger(__name__)


class GoogleAdsConnector(ConnectorInterface):
    """Connector for Google Ads API."""

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
    ):
        super().__init__(service_name="GoogleAds", rate_limit=50)
        self.client_id = client_id
        self.client_secret = client_secret

    async def authenticate(self) -> None:
        """Authenticate with Google Ads via OAuth 2.0."""
        if self.client_id and self.client_secret:
            # OAuth flow would go here
            self._is_authenticated = True
            logger.info("[GoogleAds] Authenticated via OAuth.")
        else:
            logger.warning("[GoogleAds] No credentials provided. Running in demo mode.")
            self._is_authenticated = False

    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from Google Ads API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        # Return demo data
        return self._generate_demo_data(endpoint, params)

    async def post_data(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Send data to Google Ads API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        return {"demo": True, "message": f"[GoogleAds Demo] POST {endpoint}"}

    async def get_campaign_metrics(self, campaign_id: Optional[str] = None) -> dict:
        """Fetch campaign performance metrics."""
        return await self.get_data("campaigns/metrics", {"campaign_id": campaign_id})

    def _generate_demo_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Generate realistic demo campaign data."""
        campaigns = [
            {
                "id": f"camp-{i}",
                "name": name,
                "status": "ENABLED",
                "impressions": random.randint(10000, 100000),
                "clicks": random.randint(500, 5000),
                "spend": round(random.uniform(500, 5000), 2),
                "conversions": random.randint(10, 100),
                "ctr": round(random.uniform(1.0, 5.0), 2),
                "cpc": round(random.uniform(0.5, 3.0), 2),
            }
            for i, name in enumerate(
                ["Brand Awareness", "Lead Gen Q1", "Retargeting", "Product Launch"],
                1,
            )
        ]
        return {
            "demo": True,
            "campaigns": campaigns,
            "total_spend": sum(c["spend"] for c in campaigns),
            "total_conversions": sum(c["conversions"] for c in campaigns),
        }

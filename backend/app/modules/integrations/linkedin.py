"""
LinkedIn Connector

Implements the ConnectorInterface for LinkedIn content posting
and analytics retrieval.
"""

import logging
from typing import Optional

from .base import ConnectorInterface

logger = logging.getLogger(__name__)


class LinkedInConnector(ConnectorInterface):
    """Connector for LinkedIn API."""

    BASE_URL = "https://api.linkedin.com/v2"

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
    ):
        super().__init__(service_name="LinkedIn", rate_limit=50)
        self.client_id = client_id
        self.client_secret = client_secret

    async def authenticate(self) -> None:
        """Authenticate with LinkedIn via OAuth 2.0."""
        if self.client_id and self.client_secret:
            self._is_authenticated = True
            logger.info("[LinkedIn] Authenticated via OAuth.")
        else:
            logger.warning("[LinkedIn] No credentials provided. Running in demo mode.")
            self._is_authenticated = False

    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from LinkedIn API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        return {"demo": True, "message": f"[LinkedIn Demo] GET {endpoint}"}

    async def post_data(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Post data to LinkedIn API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        return {"demo": True, "message": f"[LinkedIn Demo] POST {endpoint}", "data": data}

    async def create_post(self, text: str, author_id: Optional[str] = None) -> dict:
        """Create a text post on LinkedIn."""
        payload = {
            "author": f"urn:li:person:{author_id or 'demo'}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": text},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        return await self.post_data("ugcPosts", data=payload)

    async def get_post_analytics(self, post_id: str) -> dict:
        """Fetch analytics for a specific LinkedIn post."""
        return await self.get_data(
            f"organizationalEntityShareStatistics",
            params={"shares": f"urn:li:share:{post_id}"},
        )

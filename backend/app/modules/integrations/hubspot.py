"""
HubSpot CRM Connector

Implements the ConnectorInterface for HubSpot CRM operations:
authentication, contact management, and deal tracking.
"""

import logging
from typing import Optional

from .base import ConnectorInterface

logger = logging.getLogger(__name__)


class HubSpotConnector(ConnectorInterface):
    """Connector for HubSpot CRM API."""

    BASE_URL = "https://api.hubapi.com"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(service_name="HubSpot", api_key=api_key, rate_limit=100)

    async def authenticate(self) -> None:
        """Authenticate with HubSpot using API key or OAuth."""
        if self.api_key:
            self._access_token = self.api_key
            self._is_authenticated = True
            logger.info("[HubSpot] Authenticated with API key.")
        else:
            logger.warning("[HubSpot] No API key provided. Running in demo mode.")
            self._is_authenticated = False

    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from HubSpot API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        if not self._is_authenticated:
            return self._demo_response(endpoint, params)

        try:
            import httpx
            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {self._access_token}"}
                response = await client.get(
                    f"{self.BASE_URL}/{endpoint}",
                    headers=headers,
                    params=params or {},
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            raise self.handle_error({
                "status_code": 500,
                "message": str(e),
                "error_code": "REQUEST_FAILED",
            })

    async def post_data(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Send data to HubSpot API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        if not self._is_authenticated:
            return self._demo_response(endpoint, data)

        try:
            import httpx
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {self._access_token}",
                    "Content-Type": "application/json",
                }
                response = await client.post(
                    f"{self.BASE_URL}/{endpoint}",
                    headers=headers,
                    json=data or {},
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            raise self.handle_error({
                "status_code": 500,
                "message": str(e),
                "error_code": "REQUEST_FAILED",
            })

    async def get_contacts(self, limit: int = 10) -> dict:
        """Fetch contacts from HubSpot."""
        return await self.get_data(
            "crm/v3/objects/contacts", params={"limit": limit}
        )

    async def update_contact(self, contact_id: str, properties: dict) -> dict:
        """Update a contact in HubSpot."""
        return await self.post_data(
            f"crm/v3/objects/contacts/{contact_id}",
            data={"properties": properties},
        )

    async def create_contact(self, properties: dict) -> dict:
        """Create a new contact in HubSpot."""
        return await self.post_data(
            "crm/v3/objects/contacts",
            data={"properties": properties},
        )

    def _demo_response(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Return demo data when not authenticated."""
        return {
            "demo": True,
            "message": f"[HubSpot Demo] Endpoint: {endpoint}",
            "data": data or {},
            "results": [
                {
                    "id": "demo-001",
                    "properties": {
                        "firstname": "Jane",
                        "lastname": "Doe",
                        "email": "jane@example.com",
                        "company": "Acme Corp",
                    },
                }
            ],
        }

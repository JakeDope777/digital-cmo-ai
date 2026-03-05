"""
SendGrid Email Connector

Implements the ConnectorInterface for SendGrid email operations.
"""

import logging
from typing import Optional

from .base import ConnectorInterface

logger = logging.getLogger(__name__)


class SendGridConnector(ConnectorInterface):
    """Connector for SendGrid email API."""

    BASE_URL = "https://api.sendgrid.com/v3"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(service_name="SendGrid", api_key=api_key, rate_limit=100)

    async def authenticate(self) -> None:
        """Authenticate with SendGrid using API key."""
        if self.api_key:
            self._access_token = self.api_key
            self._is_authenticated = True
            logger.info("[SendGrid] Authenticated with API key.")
        else:
            logger.warning("[SendGrid] No API key provided. Running in demo mode.")
            self._is_authenticated = False

    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from SendGrid API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        if not self._is_authenticated:
            return {"demo": True, "message": f"[SendGrid Demo] GET {endpoint}"}

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
        """Send data to SendGrid API."""
        await self._ensure_authenticated()
        await self._check_rate_limit()

        if not self._is_authenticated:
            return {"demo": True, "message": f"[SendGrid Demo] POST {endpoint}", "data": data}

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
                return response.json() if response.content else {"status": "sent"}
        except Exception as e:
            raise self.handle_error({
                "status_code": 500,
                "message": str(e),
                "error_code": "REQUEST_FAILED",
            })

    async def send_email(
        self,
        to_email: str,
        from_email: str,
        subject: str,
        html_content: str,
    ) -> dict:
        """Send an email via SendGrid."""
        payload = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": from_email},
            "subject": subject,
            "content": [{"type": "text/html", "value": html_content}],
        }
        return await self.post_data("mail/send", data=payload)

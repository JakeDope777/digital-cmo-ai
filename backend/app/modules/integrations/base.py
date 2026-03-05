"""
Base Connector Interface

All integration connectors inherit from this abstract class, ensuring
a consistent API for authentication, data retrieval, data posting,
error handling, and token refresh.
"""

import time
import logging
from abc import ABC, abstractmethod
from typing import Optional

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple in-memory rate limiter with exponential backoff."""

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: list[float] = []

    def can_proceed(self) -> bool:
        """Check if a request can proceed within the rate limit."""
        now = time.time()
        self._requests = [t for t in self._requests if now - t < self.window_seconds]
        return len(self._requests) < self.max_requests

    def record_request(self):
        """Record that a request was made."""
        self._requests.append(time.time())

    def wait_time(self) -> float:
        """Calculate how long to wait before the next request."""
        if self.can_proceed():
            return 0
        oldest = min(self._requests)
        return max(0, self.window_seconds - (time.time() - oldest))


class ConnectorInterface(ABC):
    """
    Abstract base class for all external service connectors.

    Provides a unified interface for authentication, data operations,
    error handling, and rate limiting.
    """

    def __init__(
        self,
        service_name: str,
        api_key: Optional[str] = None,
        rate_limit: int = 100,
    ):
        self.service_name = service_name
        self.api_key = api_key
        self.rate_limiter = RateLimiter(max_requests=rate_limit)
        self._access_token: Optional[str] = None
        self._refresh_token: Optional[str] = None
        self._token_expires_at: Optional[float] = None
        self._is_authenticated = False

    @abstractmethod
    async def authenticate(self) -> None:
        """Handle authentication and set internal tokens."""
        pass

    @abstractmethod
    async def get_data(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Fetch data from a specific API endpoint."""
        pass

    @abstractmethod
    async def post_data(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Send data to a specific API endpoint."""
        pass

    def handle_error(self, response: dict) -> Exception:
        """Convert API error responses into standardised exceptions."""
        status = response.get("status_code", 500)
        message = response.get("message", "Unknown error")
        error_code = response.get("error_code", "UNKNOWN")

        error = ConnectorError(
            service=self.service_name,
            status_code=status,
            message=message,
            error_code=error_code,
        )
        logger.error(f"[{self.service_name}] Error {status}: {message}")
        return error

    async def refresh_access_token(self) -> None:
        """Refresh the access token if expired. Override in subclasses."""
        logger.info(f"[{self.service_name}] Token refresh not implemented.")

    def is_token_expired(self) -> bool:
        """Check if the current access token has expired."""
        if self._token_expires_at is None:
            return True
        return time.time() >= self._token_expires_at

    async def _ensure_authenticated(self):
        """Ensure the connector is authenticated before making requests."""
        if not self._is_authenticated or self.is_token_expired():
            await self.authenticate()

    async def _check_rate_limit(self):
        """Check rate limit and wait if necessary."""
        if not self.rate_limiter.can_proceed():
            wait = self.rate_limiter.wait_time()
            logger.warning(
                f"[{self.service_name}] Rate limit reached. Waiting {wait:.1f}s."
            )
            import asyncio
            await asyncio.sleep(wait)
        self.rate_limiter.record_request()


class ConnectorError(Exception):
    """Standardised error for connector failures."""

    def __init__(
        self,
        service: str,
        status_code: int,
        message: str,
        error_code: str = "UNKNOWN",
    ):
        self.service = service
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(f"[{service}] {status_code} - {error_code}: {message}")

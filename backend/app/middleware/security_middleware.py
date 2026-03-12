"""
Security middleware for Digital CMO AI.

Provides:
- Security headers (OWASP recommended set)
- Request ID injection (uuid4, added to both request state and response)
- Slow request logging (warn when processing exceeds SLOW_REQUEST_THRESHOLD_S)

CORS is handled by FastAPI's CORSMiddleware in main.py using settings.CORS_ORIGINS
(never wildcard in production — enforced via _configured_cors_origins()).
"""

import logging
import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

# Requests slower than this threshold emit a WARNING log
SLOW_REQUEST_THRESHOLD_S: float = 2.0

# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

# Content-Security-Policy: restrictive baseline, relax in app-specific config
_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: https:; "
    "font-src 'self'; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

_SECURITY_HEADERS: dict[str, str] = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": _CSP,
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
}


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Single middleware that handles:
      1. Request ID (X-Request-ID) — injected into state and response header
      2. Security response headers
      3. Slow-request logging
    """

    def __init__(self, app: ASGIApp, slow_threshold: float = SLOW_REQUEST_THRESHOLD_S) -> None:
        super().__init__(app)
        self.slow_threshold = slow_threshold

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # ── 1. Request ID ────────────────────────────────────────────────
        # Honour a forwarded request ID (e.g. from load balancer / gateway),
        # otherwise generate a fresh one.
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # ── 2. Timing ────────────────────────────────────────────────────
        start = time.perf_counter()

        response: Response = await call_next(request)

        elapsed = time.perf_counter() - start

        # ── 3. Slow request warning ──────────────────────────────────────
        if elapsed > self.slow_threshold:
            logger.warning(
                "Slow request detected",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "elapsed_s": round(elapsed, 3),
                    "status_code": response.status_code,
                },
            )

        # ── 4. Inject headers into response ─────────────────────────────
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{elapsed:.4f}s"

        for header, value in _SECURITY_HEADERS.items():
            # Don't override headers already set by the application
            if header not in response.headers:
                response.headers[header] = value

        return response

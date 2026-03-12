"""
Security utilities: JWT token creation/verification and password hashing.

Design decisions:
- bcrypt cost factor 12 (NIST recommended minimum for modern hardware)
- Distinct exceptions for expired vs invalid/tampered tokens
- NEVER log raw tokens or passwords — only safe metadata (user_id, exp)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext

from .config import settings

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

# Cost factor 12 gives ~250ms on modern hardware — good balance vs brute-force
_BCRYPT_ROUNDS: int = max(12, getattr(settings, "BCRYPT_ROUNDS", 12))

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=_BCRYPT_ROUNDS,
)


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt (cost ≥ 12).

    Never log the input or output of this function.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash.

    Returns False on any error (including malformed hash).
    Never log the plain_password.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Absorb library errors (e.g. malformed hash) without leaking details
        return False


# ---------------------------------------------------------------------------
# JWT token creation
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived JWT access token (default: 30 min).

    Args:
        data: Payload dict.  Must NOT contain raw passwords or secrets.
        expires_delta: Override the default expiry.

    Returns:
        Signed JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    # Do NOT log to_encode — it contains user identity data
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a long-lived JWT refresh token (default: 7 days).

    Args:
        data: Payload dict.  Must NOT contain raw passwords or secrets.

    Returns:
        Signed JWT string.
    """
    import uuid as _uuid
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    # jti (JWT ID) ensures uniqueness even for the same user within the same second
    to_encode.update({"exp": expire, "type": "refresh", "jti": str(_uuid.uuid4())})
    # Do NOT log to_encode — it contains user identity data
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ---------------------------------------------------------------------------
# JWT token verification — typed exceptions for caller control
# ---------------------------------------------------------------------------

class TokenExpiredError(Exception):
    """Raised when a JWT has a valid signature but is past its expiry."""


class TokenInvalidError(Exception):
    """Raised when a JWT signature check fails or the token is malformed/tampered."""


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token.

    Returns:
        Verified payload dict.

    Raises:
        TokenExpiredError: Token was well-formed but has expired.
        TokenInvalidError: Token was malformed, tampered, or uses wrong algorithm.

    Never log the raw token — log only safe metadata after successful decode.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],  # whitelist — no 'none' algorithm
        )
        return payload
    except ExpiredSignatureError:
        # Expired but otherwise valid signature — caller decides how to respond
        raise TokenExpiredError("Token has expired")
    except JWTError as exc:
        # Invalid signature, wrong algorithm, malformed header/payload, etc.
        raise TokenInvalidError(f"Token is invalid: {type(exc).__name__}") from exc


def decode_token_safe(token: str) -> Optional[dict]:
    """Convenience wrapper that returns None on any error (legacy compatibility).

    Prefer decode_token() in new code for granular error handling.
    """
    try:
        return decode_token(token)
    except (TokenExpiredError, TokenInvalidError):
        return None

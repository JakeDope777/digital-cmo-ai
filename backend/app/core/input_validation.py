"""
Input validation and sanitization helpers for Digital CMO AI.

All helpers are standalone functions usable inside Pydantic validators
or FastAPI endpoint dependencies.

Design principles:
- Fail closed: when in doubt, reject input
- No HTML parsing libraries required: regex-based stripping is sufficient
  for the threat model here (stored XSS prevention on text fields)
- SQLi guard is advisory — the ORM (SQLAlchemy) is the primary defence
"""

import re
from typing import Optional
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_STRING_LENGTH: int = 10_000       # generic text fields
MAX_NAME_LENGTH: int = 255            # names, titles, slugs
MAX_EMAIL_LENGTH: int = 254           # RFC 5321 SMTP limit
MAX_URL_LENGTH: int = 2_048           # common browser/server limit
MAX_SHORT_TEXT_LENGTH: int = 500      # descriptions, short inputs

ALLOWED_URL_SCHEMES = {"http", "https"}

# Common SQL injection pattern fragments — not exhaustive, but catches obvious attacks
_SQLI_PATTERNS: list[re.Pattern] = [
    re.compile(r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT|GRANT|REVOKE|BACKUP)\b)", re.IGNORECASE),
    re.compile(r"(--|;|/\*|\*/|xp_|0x[0-9a-fA-F]+)", re.IGNORECASE),
    re.compile(r"(\bOR\b\s+[\w'\"]+\s*=\s*[\w'\"]+)", re.IGNORECASE),  # OR 1=1 style
    re.compile(r"(\bAND\b\s+[\w'\"]+\s*=\s*[\w'\"]+)", re.IGNORECASE),  # AND 1=1 style
]

# HTML tag stripper (both open and self-closing tags)
_HTML_TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)
# Dangerous event attributes (onclick=, onerror=, etc.)
_HTML_ATTR_RE = re.compile(r"\bon\w+\s*=", re.IGNORECASE)
# javascript: / data: URI schemes
_JS_URI_RE = re.compile(r"(javascript|data|vbscript)\s*:", re.IGNORECASE)

# Basic email regex (RFC 5322 simplified)
_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
)

# ---------------------------------------------------------------------------
# HTML sanitization
# ---------------------------------------------------------------------------

def sanitize_html(text: Optional[str]) -> str:
    """Strip all HTML tags and dangerous attributes from a string.

    Returns empty string for None input.
    This is NOT a rich-text sanitizer — it removes ALL tags.
    Use bleach or a dedicated library if you need to allow a safe subset.
    """
    if text is None:
        return ""
    # Remove dangerous URI schemes first (before stripping tags)
    cleaned = _JS_URI_RE.sub("BLOCKED:", text)
    # Remove event handlers
    cleaned = _HTML_ATTR_RE.sub("", cleaned)
    # Strip all HTML tags
    cleaned = _HTML_TAG_RE.sub("", cleaned)
    return cleaned.strip()


# ---------------------------------------------------------------------------
# URL validation
# ---------------------------------------------------------------------------

class ValidationError(ValueError):
    """Raised when an input fails validation."""


def validate_url(url: Optional[str], *, max_length: int = MAX_URL_LENGTH) -> str:
    """Validate that a URL uses an allowed scheme (http or https only).

    Args:
        url: The URL string to validate.
        max_length: Maximum allowed URL length.

    Returns:
        The validated URL string (stripped).

    Raises:
        ValidationError: If the URL is invalid, too long, or uses a disallowed scheme.
    """
    if not url:
        raise ValidationError("URL must not be empty")

    url = url.strip()

    if len(url) > max_length:
        raise ValidationError(f"URL exceeds maximum length of {max_length} characters")

    try:
        parsed = urlparse(url)
    except Exception as exc:
        raise ValidationError("URL could not be parsed") from exc

    if parsed.scheme.lower() not in ALLOWED_URL_SCHEMES:
        raise ValidationError(
            f"URL scheme '{parsed.scheme}' is not allowed. "
            f"Only {sorted(ALLOWED_URL_SCHEMES)} schemes are permitted."
        )

    if not parsed.netloc:
        raise ValidationError("URL is missing a host")

    return url


# ---------------------------------------------------------------------------
# Email validation
# ---------------------------------------------------------------------------

def validate_email_safe(email: Optional[str]) -> str:
    """Validate an email address: format check + length limit.

    Args:
        email: The email string to validate.

    Returns:
        Lowercased, stripped email address.

    Raises:
        ValidationError: If the email is empty, too long, or malformed.
    """
    if not email:
        raise ValidationError("Email must not be empty")

    email = email.strip().lower()

    if len(email) > MAX_EMAIL_LENGTH:
        raise ValidationError(
            f"Email exceeds maximum length of {MAX_EMAIL_LENGTH} characters"
        )

    if not _EMAIL_RE.match(email):
        raise ValidationError("Email address format is invalid")

    return email


# ---------------------------------------------------------------------------
# SQLi guard
# ---------------------------------------------------------------------------

def guard_sqli(value: Optional[str], field_name: str = "input") -> str:
    """Reject strings that contain common SQL injection patterns.

    This is a defence-in-depth measure — the ORM is the primary protection.
    Do NOT rely on this as the sole SQLi defence.

    Args:
        value: The string to check.
        field_name: Used in the error message for context.

    Returns:
        The original value if no patterns found.

    Raises:
        ValidationError: If a suspicious SQL pattern is detected.
    """
    if not value:
        return value or ""

    for pattern in _SQLI_PATTERNS:
        if pattern.search(value):
            # Log at warning level — do NOT log the actual value (could be PII)
            raise ValidationError(
                f"Field '{field_name}' contains disallowed characters or keywords"
            )

    return value


# ---------------------------------------------------------------------------
# Generic string validators
# ---------------------------------------------------------------------------

def validate_string_length(
    value: Optional[str],
    *,
    field_name: str = "field",
    max_length: int = MAX_STRING_LENGTH,
    min_length: int = 0,
    required: bool = False,
) -> Optional[str]:
    """Validate a string's length.

    Args:
        value: The string to validate.
        field_name: Used in error messages.
        max_length: Maximum allowed length.
        min_length: Minimum required length.
        required: If True, None or empty string raises ValidationError.

    Returns:
        Stripped string, or None if value was None and not required.

    Raises:
        ValidationError: If length constraints are violated.
    """
    if value is None:
        if required:
            raise ValidationError(f"'{field_name}' is required")
        return None

    value = value.strip()

    if required and not value:
        raise ValidationError(f"'{field_name}' must not be empty")

    if len(value) < min_length:
        raise ValidationError(
            f"'{field_name}' must be at least {min_length} characters"
        )

    if len(value) > max_length:
        raise ValidationError(
            f"'{field_name}' exceeds maximum length of {max_length} characters"
        )

    return value


def sanitize_and_validate(
    value: Optional[str],
    *,
    field_name: str = "field",
    max_length: int = MAX_STRING_LENGTH,
    strip_html: bool = True,
    check_sqli: bool = True,
) -> Optional[str]:
    """Convenience wrapper: sanitize HTML + check SQLi + enforce length.

    Suitable for use as a Pydantic field_validator.
    """
    if value is None:
        return None

    if strip_html:
        value = sanitize_html(value)

    if check_sqli:
        value = guard_sqli(value, field_name=field_name)

    return validate_string_length(value, field_name=field_name, max_length=max_length)

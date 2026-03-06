"""
SQLAlchemy ORM models for Digital CMO AI.

Schema as defined in the specification:
- users, tokens, usage_logs, contexts, memory_files, api_credentials
- Additional tables: campaigns, contacts, api_endpoints, experiments
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Boolean,
    Enum,
)
from sqlalchemy.orm import relationship

from .session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(
        Enum("admin", "manager", "analyst", "user", name="user_role"),
        default="user",
        nullable=False,
    )
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    stripe_customer_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    token_account = relationship("TokenAccount", back_populates="user", uselist=False)
    usage_logs = relationship("UsageLog", back_populates="user")
    contexts = relationship("Context", back_populates="user")
    memory_files = relationship("MemoryFile", back_populates="user")
    api_credentials = relationship("ApiCredential", back_populates="user")


class TokenAccount(Base):
    __tablename__ = "tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Integer, default=10000, nullable=False)
    tier = Column(
        Enum("free", "pro", "enterprise", name="tier_type"),
        default="free",
        nullable=False,
    )
    reset_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="token_account")


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    module_name = Column(String, nullable=False)
    tokens_used = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="usage_logs")


class Context(Base):
    __tablename__ = "contexts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    conversation_id = Column(String, nullable=False, index=True)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="contexts")


class MemoryFile(Base):
    __tablename__ = "memory_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    last_updated = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="memory_files")


class ApiCredential(Base):
    __tablename__ = "api_credentials"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    service_name = Column(String, nullable=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="api_credentials")


# --- Additional domain tables ---


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    status = Column(
        Enum("draft", "active", "paused", "completed", name="campaign_status"),
        default="draft",
    )
    budget = Column(Float, nullable=True)
    audience_query = Column(JSON, nullable=True)
    content = Column(JSON, nullable=True)
    schedule = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, index=True)
    company = Column(String, nullable=True)
    status = Column(String, default="new")
    attributes = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ApiEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(String, primary_key=True, default=generate_uuid)
    method = Column(String, nullable=False)
    path = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    variants = Column(JSON, nullable=False)
    results = Column(JSON, nullable=True)
    status = Column(String, default="running")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    consumed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    consumed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class BillingSubscription(Base):
    __tablename__ = "billing_subscriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    stripe_subscription_id = Column(String, nullable=True, index=True)
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_price_id = Column(String, nullable=True)
    status = Column(String, default="inactive", nullable=False)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class BillingInvoice(Base):
    __tablename__ = "billing_invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    stripe_invoice_id = Column(String, nullable=True, unique=True, index=True)
    amount_due = Column(Integer, default=0, nullable=False)
    amount_paid = Column(Integer, default=0, nullable=False)
    currency = Column(String, default="usd", nullable=False)
    status = Column(String, default="draft", nullable=False)
    hosted_invoice_url = Column(Text, nullable=True)
    invoice_pdf = Column(Text, nullable=True)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class GrowthEvent(Base):
    __tablename__ = "growth_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    event_name = Column(String, nullable=False, index=True)
    source = Column(String, default="web", nullable=False)
    properties = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class WaitlistLead(Base):
    __tablename__ = "waitlist_leads"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    company = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    source = Column(String, default="landing_page", nullable=False)
    utm_source = Column(String, nullable=True)
    utm_medium = Column(String, nullable=True)
    utm_campaign = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

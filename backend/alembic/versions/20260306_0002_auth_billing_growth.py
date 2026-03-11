"""Auth, billing, and growth schema updates.

Revision ID: 20260306_0002
Revises: 20260306_0001
Create Date: 2026-03-06
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "20260306_0002"
down_revision: Union[str, None] = "20260306_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _column_exists(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _index_exists(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    user_columns = {
        "full_name": sa.Column("full_name", sa.String(), nullable=True),
        "company": sa.Column("company", sa.String(), nullable=True),
        "timezone": sa.Column("timezone", sa.String(), nullable=True),
        "is_email_verified": sa.Column(
            "is_email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        "stripe_customer_id": sa.Column("stripe_customer_id", sa.String(), nullable=True),
    }
    for column_name, column in user_columns.items():
        if not _column_exists(inspector, "users", column_name):
            op.add_column("users", column)
            inspector = inspect(bind)
    if not _index_exists(inspector, "users", op.f("ix_users_stripe_customer_id")):
        op.create_index(op.f("ix_users_stripe_customer_id"), "users", ["stripe_customer_id"], unique=False)
        inspector = inspect(bind)

    if not _table_exists(inspector, "email_verification_tokens"):
        op.create_table(
            "email_verification_tokens",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("token", sa.String(), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("consumed_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "email_verification_tokens", op.f("ix_email_verification_tokens_user_id")):
        op.create_index(op.f("ix_email_verification_tokens_user_id"), "email_verification_tokens", ["user_id"], unique=False)
    if not _index_exists(inspector, "email_verification_tokens", op.f("ix_email_verification_tokens_token")):
        op.create_index(op.f("ix_email_verification_tokens_token"), "email_verification_tokens", ["token"], unique=True)

    if not _table_exists(inspector, "password_reset_tokens"):
        op.create_table(
            "password_reset_tokens",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("token", sa.String(), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("consumed_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "password_reset_tokens", op.f("ix_password_reset_tokens_user_id")):
        op.create_index(op.f("ix_password_reset_tokens_user_id"), "password_reset_tokens", ["user_id"], unique=False)
    if not _index_exists(inspector, "password_reset_tokens", op.f("ix_password_reset_tokens_token")):
        op.create_index(op.f("ix_password_reset_tokens_token"), "password_reset_tokens", ["token"], unique=True)

    if not _table_exists(inspector, "billing_subscriptions"):
        op.create_table(
            "billing_subscriptions",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("stripe_subscription_id", sa.String(), nullable=True),
            sa.Column("stripe_customer_id", sa.String(), nullable=True),
            sa.Column("stripe_price_id", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("current_period_start", sa.DateTime(), nullable=True),
            sa.Column("current_period_end", sa.DateTime(), nullable=True),
            sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "billing_subscriptions", op.f("ix_billing_subscriptions_user_id")):
        op.create_index(op.f("ix_billing_subscriptions_user_id"), "billing_subscriptions", ["user_id"], unique=True)
    if not _index_exists(inspector, "billing_subscriptions", op.f("ix_billing_subscriptions_stripe_subscription_id")):
        op.create_index(op.f("ix_billing_subscriptions_stripe_subscription_id"), "billing_subscriptions", ["stripe_subscription_id"], unique=False)
    if not _index_exists(inspector, "billing_subscriptions", op.f("ix_billing_subscriptions_stripe_customer_id")):
        op.create_index(op.f("ix_billing_subscriptions_stripe_customer_id"), "billing_subscriptions", ["stripe_customer_id"], unique=False)

    if not _table_exists(inspector, "billing_invoices"):
        op.create_table(
            "billing_invoices",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=False),
            sa.Column("stripe_invoice_id", sa.String(), nullable=True),
            sa.Column("amount_due", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("amount_paid", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("currency", sa.String(), nullable=False, server_default="usd"),
            sa.Column("status", sa.String(), nullable=False, server_default="draft"),
            sa.Column("hosted_invoice_url", sa.Text(), nullable=True),
            sa.Column("invoice_pdf", sa.Text(), nullable=True),
            sa.Column("period_start", sa.DateTime(), nullable=True),
            sa.Column("period_end", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "billing_invoices", op.f("ix_billing_invoices_user_id")):
        op.create_index(op.f("ix_billing_invoices_user_id"), "billing_invoices", ["user_id"], unique=False)
    if not _index_exists(inspector, "billing_invoices", op.f("ix_billing_invoices_stripe_invoice_id")):
        op.create_index(op.f("ix_billing_invoices_stripe_invoice_id"), "billing_invoices", ["stripe_invoice_id"], unique=True)

    if not _table_exists(inspector, "growth_events"):
        op.create_table(
            "growth_events",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("event_name", sa.String(), nullable=False),
            sa.Column("source", sa.String(), nullable=False),
            sa.Column("properties", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "growth_events", op.f("ix_growth_events_user_id")):
        op.create_index(op.f("ix_growth_events_user_id"), "growth_events", ["user_id"], unique=False)
    if not _index_exists(inspector, "growth_events", op.f("ix_growth_events_event_name")):
        op.create_index(op.f("ix_growth_events_event_name"), "growth_events", ["event_name"], unique=False)
    if not _index_exists(inspector, "growth_events", op.f("ix_growth_events_created_at")):
        op.create_index(op.f("ix_growth_events_created_at"), "growth_events", ["created_at"], unique=False)

    if not _table_exists(inspector, "waitlist_leads"):
        op.create_table(
            "waitlist_leads",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("company", sa.String(), nullable=True),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("source", sa.String(), nullable=False),
            sa.Column("utm_source", sa.String(), nullable=True),
            sa.Column("utm_medium", sa.String(), nullable=True),
            sa.Column("utm_campaign", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = inspect(bind)
    if not _index_exists(inspector, "waitlist_leads", op.f("ix_waitlist_leads_email")):
        op.create_index(op.f("ix_waitlist_leads_email"), "waitlist_leads", ["email"], unique=True)
    if not _index_exists(inspector, "waitlist_leads", op.f("ix_waitlist_leads_created_at")):
        op.create_index(op.f("ix_waitlist_leads_created_at"), "waitlist_leads", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_waitlist_leads_created_at"), table_name="waitlist_leads")
    op.drop_index(op.f("ix_waitlist_leads_email"), table_name="waitlist_leads")
    op.drop_table("waitlist_leads")

    op.drop_index(op.f("ix_growth_events_created_at"), table_name="growth_events")
    op.drop_index(op.f("ix_growth_events_event_name"), table_name="growth_events")
    op.drop_index(op.f("ix_growth_events_user_id"), table_name="growth_events")
    op.drop_table("growth_events")

    op.drop_index(op.f("ix_billing_invoices_stripe_invoice_id"), table_name="billing_invoices")
    op.drop_index(op.f("ix_billing_invoices_user_id"), table_name="billing_invoices")
    op.drop_table("billing_invoices")

    op.drop_index(op.f("ix_billing_subscriptions_stripe_customer_id"), table_name="billing_subscriptions")
    op.drop_index(op.f("ix_billing_subscriptions_stripe_subscription_id"), table_name="billing_subscriptions")
    op.drop_index(op.f("ix_billing_subscriptions_user_id"), table_name="billing_subscriptions")
    op.drop_table("billing_subscriptions")

    op.drop_index(op.f("ix_password_reset_tokens_token"), table_name="password_reset_tokens")
    op.drop_index(op.f("ix_password_reset_tokens_user_id"), table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")

    op.drop_index(op.f("ix_email_verification_tokens_token"), table_name="email_verification_tokens")
    op.drop_index(op.f("ix_email_verification_tokens_user_id"), table_name="email_verification_tokens")
    op.drop_table("email_verification_tokens")

    op.drop_index(op.f("ix_users_stripe_customer_id"), table_name="users")
    op.drop_column("users", "stripe_customer_id")
    op.drop_column("users", "is_email_verified")
    op.drop_column("users", "timezone")
    op.drop_column("users", "company")
    op.drop_column("users", "full_name")

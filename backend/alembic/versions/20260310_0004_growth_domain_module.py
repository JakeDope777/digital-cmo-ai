"""Add domain/module attribution to growth and waitlist records.

Revision ID: 20260310_0004
Revises: 20260306_0003
Create Date: 2026-03-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "20260310_0004"
down_revision: Union[str, None] = "20260306_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    growth_columns = {column["name"] for column in inspector.get_columns("growth_events")}
    if "domain" not in growth_columns:
        op.add_column("growth_events", sa.Column("domain", sa.String(), nullable=True))
    if "module_id" not in growth_columns:
        op.add_column("growth_events", sa.Column("module_id", sa.String(), nullable=True))
    if "anonymous_id" not in growth_columns:
        op.add_column("growth_events", sa.Column("anonymous_id", sa.String(), nullable=True))

    growth_indexes = {index["name"] for index in inspect(bind).get_indexes("growth_events")}
    if op.f("ix_growth_events_domain") not in growth_indexes:
        op.create_index(op.f("ix_growth_events_domain"), "growth_events", ["domain"], unique=False)
    if op.f("ix_growth_events_module_id") not in growth_indexes:
        op.create_index(op.f("ix_growth_events_module_id"), "growth_events", ["module_id"], unique=False)
    if op.f("ix_growth_events_anonymous_id") not in growth_indexes:
        op.create_index(op.f("ix_growth_events_anonymous_id"), "growth_events", ["anonymous_id"], unique=False)

    waitlist_columns = {column["name"] for column in inspect(bind).get_columns("waitlist_leads")}
    if "domain" not in waitlist_columns:
        op.add_column("waitlist_leads", sa.Column("domain", sa.String(), nullable=True))
    if "module_id" not in waitlist_columns:
        op.add_column("waitlist_leads", sa.Column("module_id", sa.String(), nullable=True))
    if "anonymous_id" not in waitlist_columns:
        op.add_column("waitlist_leads", sa.Column("anonymous_id", sa.String(), nullable=True))

    waitlist_indexes = {index["name"] for index in inspect(bind).get_indexes("waitlist_leads")}
    if op.f("ix_waitlist_leads_domain") not in waitlist_indexes:
        op.create_index(op.f("ix_waitlist_leads_domain"), "waitlist_leads", ["domain"], unique=False)
    if op.f("ix_waitlist_leads_module_id") not in waitlist_indexes:
        op.create_index(op.f("ix_waitlist_leads_module_id"), "waitlist_leads", ["module_id"], unique=False)
    if op.f("ix_waitlist_leads_anonymous_id") not in waitlist_indexes:
        op.create_index(op.f("ix_waitlist_leads_anonymous_id"), "waitlist_leads", ["anonymous_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_waitlist_leads_anonymous_id"), table_name="waitlist_leads")
    op.drop_index(op.f("ix_waitlist_leads_module_id"), table_name="waitlist_leads")
    op.drop_index(op.f("ix_waitlist_leads_domain"), table_name="waitlist_leads")
    op.drop_column("waitlist_leads", "anonymous_id")
    op.drop_column("waitlist_leads", "module_id")
    op.drop_column("waitlist_leads", "domain")

    op.drop_index(op.f("ix_growth_events_anonymous_id"), table_name="growth_events")
    op.drop_index(op.f("ix_growth_events_module_id"), table_name="growth_events")
    op.drop_index(op.f("ix_growth_events_domain"), table_name="growth_events")
    op.drop_column("growth_events", "anonymous_id")
    op.drop_column("growth_events", "module_id")
    op.drop_column("growth_events", "domain")

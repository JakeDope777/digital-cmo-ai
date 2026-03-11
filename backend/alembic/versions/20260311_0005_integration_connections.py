"""Add persistent integration connection ownership state.

Revision ID: 20260311_0005
Revises: 20260310_0004
Create Date: 2026-03-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260311_0005"
down_revision: Union[str, None] = "20260310_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "integration_connections",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("connector", sa.String(), nullable=False),
        sa.Column("owner_scope", sa.String(), nullable=False, server_default="workspace"),
        sa.Column("owner_id", sa.String(), nullable=False, server_default="default"),
        sa.Column("auth_mode", sa.String(), nullable=False, server_default="managed"),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("demo_fallback", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("configured", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("last_tested_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("connector", "owner_scope", "owner_id", name="uq_integration_connections_owner"),
    )
    op.create_index(op.f("ix_integration_connections_connector"), "integration_connections", ["connector"], unique=False)
    op.create_index(op.f("ix_integration_connections_owner_scope"), "integration_connections", ["owner_scope"], unique=False)
    op.create_index(op.f("ix_integration_connections_owner_id"), "integration_connections", ["owner_id"], unique=False)
    op.create_index(op.f("ix_integration_connections_status"), "integration_connections", ["status"], unique=False)
    op.create_index(op.f("ix_integration_connections_created_at"), "integration_connections", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_integration_connections_created_at"), table_name="integration_connections")
    op.drop_index(op.f("ix_integration_connections_status"), table_name="integration_connections")
    op.drop_index(op.f("ix_integration_connections_owner_id"), table_name="integration_connections")
    op.drop_index(op.f("ix_integration_connections_owner_scope"), table_name="integration_connections")
    op.drop_index(op.f("ix_integration_connections_connector"), table_name="integration_connections")
    op.drop_table("integration_connections")

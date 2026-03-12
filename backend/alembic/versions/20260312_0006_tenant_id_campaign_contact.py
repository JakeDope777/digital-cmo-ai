"""Add tenant_id FK to campaigns and contacts tables

Revision ID: 20260312_0006
Revises: 20260311_0005
Create Date: 2026-03-12

Fixes missing tenant_id foreign keys on Campaign and Contact models
so that Tenant.campaigns and Tenant.contacts relationships work correctly.
"""
from alembic import op
import sqlalchemy as sa

revision = "20260312_0006"
down_revision = "20260311_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add tenant_id to campaigns
    with op.batch_alter_table("campaigns") as batch_op:
        batch_op.add_column(sa.Column("tenant_id", sa.String(), nullable=True))
        batch_op.create_index("ix_campaigns_tenant_id", ["tenant_id"])
        batch_op.create_foreign_key(
            "fk_campaigns_tenant_id",
            "tenants",
            ["tenant_id"],
            ["id"],
        )

    # Add tenant_id to contacts
    with op.batch_alter_table("contacts") as batch_op:
        batch_op.add_column(sa.Column("tenant_id", sa.String(), nullable=True))
        batch_op.create_index("ix_contacts_tenant_id", ["tenant_id"])
        batch_op.create_foreign_key(
            "fk_contacts_tenant_id",
            "tenants",
            ["tenant_id"],
            ["id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("contacts") as batch_op:
        batch_op.drop_constraint("fk_contacts_tenant_id", type_="foreignkey")
        batch_op.drop_index("ix_contacts_tenant_id")
        batch_op.drop_column("tenant_id")

    with op.batch_alter_table("campaigns") as batch_op:
        batch_op.drop_constraint("fk_campaigns_tenant_id", type_="foreignkey")
        batch_op.drop_index("ix_campaigns_tenant_id")
        batch_op.drop_column("tenant_id")

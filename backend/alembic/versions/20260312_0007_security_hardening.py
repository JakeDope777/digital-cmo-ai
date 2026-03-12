"""Security hardening: account lockout, MFA fields, refresh_tokens table

Revision ID: 20260312_0007
Revises: 20260312_0006
Create Date: 2026-03-12

Adds:
- users.failed_login_attempts (account lockout counter)
- users.locked_until (lockout expiry timestamp)
- users.mfa_secret (TOTP secret)
- users.mfa_enabled (flag)
- users.mfa_backup_codes (JSON array of hashed backup codes)
- refresh_tokens table (token rotation + family-based revocation)
"""
from alembic import op
import sqlalchemy as sa

revision = "20260312_0007"
down_revision = "20260312_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Security fields on users
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("locked_until", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("mfa_secret", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("mfa_enabled", sa.Boolean(), nullable=False, server_default="false"))
        batch_op.add_column(sa.Column("mfa_backup_codes", sa.JSON(), nullable=True))

    # Refresh tokens table for rotation + reuse detection
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("family_id", sa.String(), nullable=False, index=True),
        sa.Column("used", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("refresh_tokens")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("mfa_backup_codes")
        batch_op.drop_column("mfa_enabled")
        batch_op.drop_column("mfa_secret")
        batch_op.drop_column("locked_until")
        batch_op.drop_column("failed_login_attempts")

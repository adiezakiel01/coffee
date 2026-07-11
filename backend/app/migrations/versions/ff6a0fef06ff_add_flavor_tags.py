"""add flavor_tags column to brews

Revision ID: ff6a0fef06ff
Revises: f8c4bb2e0697
Create Date: 2026-07-11
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "ff6a0fef06ff"
down_revision = "f8c4bb2e0697"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "brews",
        sa.Column("flavor_tags", postgresql.ARRAY(sa.String()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("brews", "flavor_tags")

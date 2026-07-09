"""rename notes columns: beans.notes -> tasting_notes, brews.tasting_notes -> notes

Revision ID: f8c4bb2e0697
Revises: fc115ab969a0
Create Date: 2026-07-09
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "f8c4bb2e0697"
down_revision = "fc115ab969a0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("beans", "notes", new_column_name="tasting_notes")
    op.alter_column("brews", "tasting_notes", new_column_name="notes")


def downgrade() -> None:
    op.alter_column("beans", "tasting_notes", new_column_name="notes")
    op.alter_column("brews", "notes", new_column_name="tasting_notes")

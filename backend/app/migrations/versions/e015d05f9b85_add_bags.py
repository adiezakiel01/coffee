"""add bags table, link brews to bags

Revision ID: e015d05f9b85
Revises: ff6a0fef06ff
Create Date: 2026-07-16
"""

from alembic import op
import sqlalchemy as sa


revision = "e015d05f9b85"
down_revision = "ff6a0fef06ff"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bags",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "bean_id",
            sa.Integer(),
            sa.ForeignKey("beans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("roast_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.add_column(
        "brews",
        sa.Column(
            "bag_id",
            sa.Integer(),
            sa.ForeignKey("bags.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("brews", "bag_id")
    op.drop_table("bags")

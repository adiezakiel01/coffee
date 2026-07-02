"""promote brew_type filter_type ice_grams to brew columns

Revision ID: fc115ab969a0
Revises: 3e2067981192
Create Date: 2026-07-02 09:32:57.272793

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "fc115ab969a0"
down_revision: Union[str, Sequence[str], None] = "3e2067981192"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the three new columns
    op.add_column("brews", sa.Column("brew_type", sa.String(length=10), nullable=True))
    op.add_column(
        "brews", sa.Column("filter_type", sa.String(length=20), nullable=True)
    )
    op.add_column("brews", sa.Column("ice_grams", sa.Integer(), nullable=True))

    # Copy existing data from brew_parameters into the new columns
    op.execute("""
        UPDATE brews b
        SET brew_type = bp.value
        FROM brew_parameters bp
        WHERE bp.brew_id = b.id AND bp.key = 'brew_type'
    """)

    op.execute("""
        UPDATE brews b
        SET filter_type = bp.value
        FROM brew_parameters bp
        WHERE bp.brew_id = b.id AND bp.key = 'filter_type'
    """)

    op.execute("""
        UPDATE brews b
        SET ice_grams = bp.value::INTEGER
        FROM brew_parameters bp
        WHERE bp.brew_id = b.id AND bp.key = 'ice_grams'
    """)

    # Delete the now-redundant brew_parameters rows for these three keys
    op.execute("""
        DELETE FROM brew_parameters
        WHERE key IN ('brew_type', 'filter_type', 'ice_grams')
    """)


def downgrade() -> None:
    # Move data back to brew_parameters before dropping columns
    op.execute("""
        INSERT INTO brew_parameters (brew_id, key, value)
        SELECT id, 'brew_type', brew_type
        FROM brews WHERE brew_type IS NOT NULL
    """)

    op.execute("""
        INSERT INTO brew_parameters (brew_id, key, value)
        SELECT id, 'filter_type', filter_type
        FROM brews WHERE filter_type IS NOT NULL
    """)

    op.execute("""
        INSERT INTO brew_parameters (brew_id, key, value)
        SELECT id, 'ice_grams', ice_grams::TEXT
        FROM brews WHERE ice_grams IS NOT NULL
    """)

    op.drop_column("brews", "ice_grams")
    op.drop_column("brews", "filter_type")
    op.drop_column("brews", "brew_type")


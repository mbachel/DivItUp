"""add last streak increment date to groups

Revision ID: c4d9f81a2b6e
Revises: 9f4c2a1d77ef
Create Date: 2026-04-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c4d9f81a2b6e"
down_revision: Union[str, Sequence[str], None] = "9f4c2a1d77ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("groups", sa.Column("last_streak_increment_on", sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("groups", "last_streak_increment_on")

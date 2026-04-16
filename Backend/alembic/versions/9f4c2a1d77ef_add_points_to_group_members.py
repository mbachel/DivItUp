"""add points to group members

Revision ID: 9f4c2a1d77ef
Revises: 7b2d9e8f4c10
Create Date: 2026-04-15 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f4c2a1d77ef"
down_revision: Union[str, Sequence[str], None] = "7b2d9e8f4c10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "group_members",
        sa.Column("points", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("group_members", "points")

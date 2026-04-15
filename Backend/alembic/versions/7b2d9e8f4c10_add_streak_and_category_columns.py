"""add streak and category columns

Revision ID: 7b2d9e8f4c10
Revises: 403d8f0d01a6
Create Date: 2026-04-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7b2d9e8f4c10"
down_revision: Union[str, Sequence[str], None] = "403d8f0d01a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "groups",
        sa.Column("streak", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "expenses",
        sa.Column("category", sa.String(length=50), nullable=False, server_default="other"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("expenses", "category")
    op.drop_column("groups", "streak")

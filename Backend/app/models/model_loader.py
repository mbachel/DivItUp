from . import (
    users,
    groups,
    group_members,
    chores,
    chore_assignments,
    expenses,
    expense_splits,
    receipts,
    receipt_items,
    payments,
)
from ..dependencies.database import Base, engine


def index():
    # Ensure all model modules are imported, then create every table once.
    Base.metadata.create_all(bind=engine)

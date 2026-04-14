from fastapi import FastAPI
from . import (
    users,
    groups,
    group_members,
    chores,
    chore_assignments,
    expenses,
    expenses_splits as expense_splits,
    receipts,
    receipt_items,
    payments
)

def load_routes(app: FastAPI):
    api_prefix = "/api"
    app.include_router(users.router, prefix=api_prefix)
    app.include_router(groups.router, prefix=api_prefix)
    app.include_router(group_members.router, prefix=api_prefix)
    app.include_router(chores.router, prefix=api_prefix)
    app.include_router(chore_assignments.router, prefix=api_prefix)
    app.include_router(expenses.router, prefix=api_prefix)
    app.include_router(expense_splits.router, prefix=api_prefix)
    app.include_router(receipts.router, prefix=api_prefix)
    app.include_router(receipt_items.router, prefix=api_prefix)
    app.include_router(payments.router, prefix=api_prefix)
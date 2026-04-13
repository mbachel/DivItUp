from fastapi import FastAPI
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
    payments
)

def load_routes(app: FastAPI):
    app.include_router(users.router)
    app.include_router(groups.router)
    app.include_router(group_members.router)
    app.include_router(chores.router)
    app.include_router(chore_assignments.router)
    app.include_router(expenses.router)
    app.include_router(expense_splits.router)
    app.include_router(receipts.router)
    app.include_router(receipt_items.router)
    app.include_router(payments.router)
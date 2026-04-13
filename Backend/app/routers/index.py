from fastapi import APIRouter
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

router = APIRouter()

router.include_router(users.router)
router.include_router(groups.router)
router.include_router(group_members.router)
router.include_router(chores.router)
router.include_router(chore_assignments.router)
router.include_router(expenses.router)
router.include_router(expense_splits.router)
router.include_router(receipts.router)
router.include_router(receipt_items.router)
router.include_router(payments.router)
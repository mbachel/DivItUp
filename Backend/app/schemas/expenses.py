from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

class ExpenseBase(BaseModel):
    group_id: int
    paid_by: int
    receipt_id: Optional[int] = None
    title: str
    total_amount: Decimal
    split_type: str

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    group_id: Optional[int] = None
    paid_by: Optional[int] = None
    receipt_id: Optional[int] = None
    title: Optional[str] = None
    total_amount: Optional[Decimal] = None
    split_type: Optional[str] = None

class Expense(ExpenseBase):
    id: int
    class ConfigDict:
        from_attributes = True
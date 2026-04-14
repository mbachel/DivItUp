from typing import Optional
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ExpenseSplitBase(BaseModel):
    expense_id: int
    user_id: int
    amount_owed: Decimal
    is_settled: bool

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplitUpdate(BaseModel):
    expense_id: Optional[int] = None
    user_id: Optional[int] = None
    amount_owed: Optional[Decimal] = None
    is_settled: Optional[bool] = None

class ExpenseSplit(ExpenseSplitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

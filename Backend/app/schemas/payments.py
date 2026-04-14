from typing import Optional
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime

class PaymentBase(BaseModel):
    payer_id: int
    payee_id: int
    expense_split_id: int
    amount: Decimal
    paid_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payer_id: Optional[int] = None
    payee_id: Optional[int] = None
    expense_split_id: Optional[int] = None
    amount: Optional[Decimal] = None
    paid_at: Optional[datetime] = None

class Payment(PaymentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

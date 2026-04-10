from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

class ReceiptItemBase(BaseModel):
    receipt_id: int
    item_name: str
    quantity: int
    unit_price: Decimal

class ReceiptItemCreate(ReceiptItemBase):
    pass

class ReceiptItemUpdate(BaseModel):
    receipt_id: Optional[int] = None
    item_name: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None

class ReceiptItem(ReceiptItemBase):
    id: int
    class ConfigDict:
        from_attributes = True
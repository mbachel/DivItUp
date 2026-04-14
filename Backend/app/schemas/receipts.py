from typing import Optional
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ReceiptBase(BaseModel):
    group_id: int
    uploaded_by: int
    image_url: str
    total_extracted: Optional[Decimal] = None
    status: str

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptUpdate(BaseModel):
    group_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    image_url: Optional[str] = None
    total_extracted: Optional[Decimal] = None
    status: Optional[str] = None

class Receipt(ReceiptBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

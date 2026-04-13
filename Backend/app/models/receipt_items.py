from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from ..dependencies.database import Base


class ReceiptItems(Base):
  __tablename__ = "receipt_items"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=False, index=True)
  item_name = Column(String(200), nullable=False)
  quantity = Column(Integer, default=1)
  unit_price = Column(DECIMAL(10, 2), nullable=False)

  receipt = relationship("Receipts", back_populates="items")
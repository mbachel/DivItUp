from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DECIMAL
from sqlalchemy.orm import relationship
from ..dependencies.database import Base
import enum


class ReceiptStatus(str, enum.Enum):
  pending = "pending"
  processed = "processed"
  error = "error"


class Receipts(Base):
  __tablename__ = "receipts"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
  uploaded_by = Column(Integer, ForeignKey("users.id"),  nullable=False)
  image_url = Column(String(500), nullable=False)
  total_extracted = Column(DECIMAL(10, 2), nullable=True)
  status = Column(Enum(ReceiptStatus), default=ReceiptStatus.pending)

  group   = relationship("Groups",       back_populates="receipts")
  items   = relationship("ReceiptItems", back_populates="receipt")
  expense = relationship("Expenses",     back_populates="receipt", uselist=False)
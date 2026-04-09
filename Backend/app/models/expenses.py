from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DECIMAL
from sqlalchemy.orm import relationship
from ..dependencies.database import Base
import enum


class SplitType(str, enum.Enum):
  equal  = "equal"
  custom = "custom"


class Expenses(Base):
  __tablename__ = "expenses"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
  paid_by = Column(Integer, ForeignKey("users.id"), nullable=False)
  receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)
  title = Column(String(200), nullable=False)
  total_amount = Column(DECIMAL(10, 2), nullable=False)
  split_type = Column(Enum(SplitType), nullable=False)

  group = relationship("Group", back_populates="expenses")
  paid_by_user = relationship("User", back_populates="expenses_paid")
  receipt = relationship("Receipt", back_populates="expense")
  splits = relationship("ExpenseSplit", back_populates="expense")
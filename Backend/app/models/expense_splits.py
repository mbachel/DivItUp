from sqlalchemy import Column, Integer, ForeignKey, Boolean, DECIMAL, UniqueConstraint
from sqlalchemy.orm import relationship
from ..dependencies.database import Base


class ExpenseSplits(Base):
  __tablename__ = "expense_splits"
  __table_args__ = (UniqueConstraint("expense_id", "user_id", name="uq_expense_user"),)

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  expense_id  = Column(Integer, ForeignKey("expenses.id"), nullable=False, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  amount_owed = Column(DECIMAL(10, 2), nullable=False)
  is_settled = Column(Boolean, default=False)

  expense  = relationship("Expenses",  back_populates="splits")
  user     = relationship("Users",     back_populates="expense_splits")
  payments = relationship("Payments",  back_populates="expense_split")
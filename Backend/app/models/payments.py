from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from ..dependencies.database import Base


class Payments(Base):
  __tablename__ = "payments"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  payer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  payee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  expense_split_id = Column(Integer, ForeignKey("expense_splits.id"), nullable=True)
  amount = Column(DECIMAL(10, 2), nullable=False)
  paid_at = Column(DateTime, nullable=False)

  payer         = relationship("Users",        foreign_keys=[payer_id], back_populates="payments_made")
  payee         = relationship("Users",        foreign_keys=[payee_id], back_populates="payments_received")
  expense_split = relationship("ExpenseSplits", back_populates="payments")
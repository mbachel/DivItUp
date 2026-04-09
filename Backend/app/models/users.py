from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

class Users(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  username = Column(String(50),  unique=True, nullable=False, index=True)
  email = Column(String(255), unique=True, nullable=False, index=True)
  password_hash = Column(String(255), nullable=False)
  full_name = Column(String(100), nullable=False)

  memberships = relationship("GroupMember", back_populates="user")
  chore_assignments = relationship("ChoreAssignment", back_populates="assigned_user")
  expenses_paid = relationship("Expense", back_populates="paid_by_user")
  expense_splits = relationship("ExpenseSplit", back_populates="user")
  payments_made = relationship("Payment", foreign_keys="Payment.payer_id", back_populates="payer")
  payments_received = relationship("Payment", foreign_keys="Payment.payee_id", back_populates="payee")
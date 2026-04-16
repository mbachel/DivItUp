from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

class Groups(Base):
  __tablename__ = "groups"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  name = Column(String(100), nullable=False)
  invite_code = Column(String(20),  unique=True, nullable=False, index=True)
  created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
  streak = Column(Integer, nullable=False, default=0, server_default="0")
  last_streak_increment_on = Column(Date, nullable=True)

  members  = relationship("GroupMembers", back_populates="group")
  chores   = relationship("Chores",       back_populates="group")
  expenses = relationship("Expenses",     back_populates="group")
  receipts = relationship("Receipts",     back_populates="group")
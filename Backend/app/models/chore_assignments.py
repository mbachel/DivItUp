from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from ..dependencies.database import Base
import enum


class ChoreStatus(str, enum.Enum):
  pending = "pending"
  completed = "completed"
  overdue = "overdue"
  skipped = "skipped"


class ChoreAssignments(Base):
  __tablename__ = "chore_assignments"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  chore_id = Column(Integer, ForeignKey("chores.id"), nullable=False, index=True)
  assigned_to = Column(Integer, ForeignKey("users.id"),  nullable=False, index=True)
  due_date = Column(DateTime, nullable=False)
  status = Column(Enum(ChoreStatus), default=ChoreStatus.pending, nullable=False)
  completed_at = Column(DateTime, nullable=True)

  chore         = relationship("Chores", back_populates="assignments")
  assigned_user = relationship("Users",  back_populates="chore_assignments")
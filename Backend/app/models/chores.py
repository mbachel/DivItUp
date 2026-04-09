from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..dependencies.database import Base
import enum


class ChoreFrequency(str, enum.Enum):
  daily = "daily"
  weekly = "weekly"
  monthly = "monthly"
  one_time = "one_time"


class Chores(Base):
  __tablename__ = "chores"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
  title = Column(String(150), nullable=False)
  frequency = Column(Enum(ChoreFrequency), nullable=False)

  group = relationship("Group", back_populates="chores")
  assignments = relationship("ChoreAssignment", back_populates="chore")
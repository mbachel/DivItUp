from sqlalchemy import Column, Integer, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from ..dependencies.database import Base
import enum


class GroupRole(str, enum.Enum):
  admin  = "admin"
  member = "member"


class GroupMembers(Base):
  __tablename__ = "group_members"

  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, index=True)
  user_id = Column(Integer, ForeignKey("users.id"),  nullable=False, index=True)
  role = Column(Enum(GroupRole), default=GroupRole.member, nullable=False)
  is_restricted = Column(Boolean, default=False)
  points = Column(Integer, nullable=False, default=0, server_default="0")

  group = relationship("Groups", back_populates="members")
  user  = relationship("Users",  back_populates="memberships")
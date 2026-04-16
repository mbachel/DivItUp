from typing import Optional
from pydantic import BaseModel, ConfigDict

class GroupMemberBase(BaseModel):
    group_id: int
    user_id: int
    role: str
    is_restricted: bool
    points: int = 0

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMemberUpdate(BaseModel):
    role: Optional[str] = None
    is_restricted: Optional[bool] = None
    points: Optional[int] = None

class GroupMember(GroupMemberBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

from typing import Optional
from pydantic import BaseModel

class GroupMemberBase(BaseModel):
    group_id: int
    user_id: int
    role: str
    is_restricted: bool

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMemberUpdate(BaseModel):
    role: Optional[str] = None
    is_restricted: Optional[bool] = None

class GroupMember(GroupMemberBase):
    id: int
    class ConfigDict:
        from_attributes = True
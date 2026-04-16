from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict

class GroupBase(BaseModel):
    name: str
    invite_code: str
    created_by: int
    streak: int = 0
    last_streak_increment_on: Optional[date] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    invite_code: Optional[str] = None
    created_by: Optional[int] = None
    streak: Optional[int] = None
    last_streak_increment_on: Optional[date] = None

class Group(GroupBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

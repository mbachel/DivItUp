from typing import Optional
from pydantic import BaseModel

class ChoreBase(BaseModel):
    group_id: int
    title: str
    frequency: str

class ChoreCreate(ChoreBase):
    pass

class ChoreUpdate(BaseModel):
    group_id: Optional[int] = None
    title: Optional[str] = None
    frequency: Optional[str] = None

class Chore(ChoreBase):
    id: int
    class ConfigDict:
        from_attributes = True
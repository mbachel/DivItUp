from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ChoreAssignmentBase(BaseModel):
    chore_id: int
    assigned_to: int
    due_date: datetime
    status: str
    completed_at: Optional[datetime] = None

class ChoreAssignmentCreate(ChoreAssignmentBase):
    pass

class ChoreAssignmentUpdate(BaseModel):
    chore_id: Optional[int] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None

class ChoreAssignment(ChoreAssignmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

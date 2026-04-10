from typing import Optional
from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str
    password_hash: str
    full_name: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    class ConfigDict:
        from_attributes = True
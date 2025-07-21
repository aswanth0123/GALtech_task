from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: str
    created_at: datetime

class UserInDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime

class UserLogin(BaseModel):
    email: str
    password: str
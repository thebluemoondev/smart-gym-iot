"""
Module User Schema
Định nghĩa các schema (Pydantic) cho người dùng.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: Optional[str] = None
    username: str
    phone: Optional[str] = None


class CreateUser(UserBase):
    password: str


class UpdateUser(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: Optional[str] = None
    username: str
    phone: Optional[str] = None
    role: str = "user"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
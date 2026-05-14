"""
Module User Schema
Định nghĩa các schema (Pydantic) cho người dùng.
"""

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9._-]+$")
    phone: Optional[str] = Field(default=None, min_length=8, max_length=15)
    avatar_url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value):
        return value.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is None:
            return value
        value = value.strip()
        if not re.fullmatch(r"^[0-9+\-\s]{8,15}$", value):
            raise ValueError("Số điện thoại không hợp lệ")
        return value

    @field_validator("avatar_url")
    @classmethod
    def normalize_avatar_url(cls, value):
        return value.strip() if isinstance(value, str) else value


class CreateUser(UserBase):
    password: str = Field(min_length=6, max_length=128)

    @field_validator("password")
    @classmethod
    def normalize_password(cls, value):
        return value.strip()


class UpdateUser(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)
    phone: Optional[str] = Field(default=None, min_length=8, max_length=15)
    avatar_url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("password")
    @classmethod
    def normalize_password(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is None:
            return value
        value = value.strip()
        if not re.fullmatch(r"^[0-9+\-\s]{8,15}$", value):
            raise ValueError("Số điện thoại không hợp lệ")
        return value

    @field_validator("avatar_url")
    @classmethod
    def normalize_avatar_url(cls, value):
        return value.strip() if isinstance(value, str) else value


class UserOut(BaseModel):
    id: int
    name: Optional[str] = None
    username: str
    phone: Optional[str] = Field(default=None, alias="phonenumber")
    avatar_url: Optional[str] = None
    role: str = "user"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

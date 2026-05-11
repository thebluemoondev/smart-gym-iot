"""
Module User Schema

Định nghĩa các schema (Pydantic) cho người dùng:
- Schema cơ sở
- Schema tạo mới
- Schema cập nhật
- Schema trả về
- Schema đăng nhập/đăng ký

Dùng để validate dữ liệu đầu vào và định dạng dữ liệu trả ra từ API.

Tác giả: duquocviet2006
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """
    Schema cơ sở của người dùng.
    """
    name: Optional[str] = None
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = "male"
    address: Optional[str] = None


class CreateUser(UserBase):
    """
    Schema dùng để tạo người dùng mới (đăng ký).
    """
    password: str


class UpdateUser(BaseModel):
    """
    Schema dùng để cập nhật thông tin người dùng.
    """
    full_name: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None


class UserOut(UserBase):
    """
    Schema dùng để trả dữ liệu người dùng ra ngoài API.
    """
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    """
    Schema đăng nhập.
    """
    username: str
    password: str


class LoginResponse(BaseModel):
    """
    Schema trả về sau đăng nhập thành công.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserOut
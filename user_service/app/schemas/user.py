"""
Module User Schema

Định nghĩa các schema (Pydantic) cho người dùng:
- Schema cơ sở
- Schema tạo mới
- Schema cập nhật
- Schema trả về

Dùng để validate dữ liệu đầu vào và định dạng dữ liệu trả ra từ API.

Tác giả: duquocviet2006
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional


class UserBase(BaseModel):
    """
    Schema cơ sở của người dùng.

    Chứa các thông tin chung:
    - Tên
    - Tên đăng nhập
    - Số điện thoại
    """
    name: str
    username: str
    phonenumber: str


class CreateUser(UserBase):
    """
    Schema dùng để tạo người dùng mới.

    Kế thừa từ UserBase và bổ sung:
    - password: mật khẩu người dùng
    """
    password: str


class UpdateUser(BaseModel):
    """
    Schema dùng để cập nhật thông tin người dùng.

    Tất cả các trường đều là tùy chọn (Optional),
    chỉ những trường được gửi lên mới được cập nhật.
    """
    name: Optional[str] = None
    password: Optional[str] = None
    phonenumber: Optional[str] = None


class UserOut(UserBase):
    """
    Schema dùng để trả dữ liệu người dùng ra ngoài API.

    Bao gồm:
    - id: mã định danh
    - các trường kế thừa từ UserBase

    Không bao gồm password để đảm bảo bảo mật.
    """
    id: int

    # Cho phép chuyển đổi từ ORM (SQLAlchemy) sang schema
    model_config = ConfigDict(from_attributes=True)
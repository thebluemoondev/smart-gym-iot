"""
Module User Model

Định nghĩa mô hình dữ liệu (ORM) cho bảng người dùng trong hệ thống.

Bảng này lưu trữ thông tin:
- Thông tin cá nhân
- Thông tin đăng nhập
- Vai trò người dùng

Quan hệ:
- 1 người dùng có tối đa 1 thẻ RFID

Tác giả: trungtranjqk
Cập nhật cuối: 11/05/2026
"""

from app.db.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Unicode, DateTime
from datetime import datetime


class User(Base):
    """
    Mô hình người dùng (User).

    Tương ứng với bảng 'users' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, tự tăng.
        name (str): Tên người dùng.
        username (str): Tên đăng nhập (duy nhất).
        password (str): Mật khẩu đã được mã hóa.
        phone (str): Số điện thoại.
        email (str): Email.
        full_name (str): Họ tên đầy đủ.
        date_of_birth (str): Ngày sinh.
        gender (str): Giới tính.
        address (str): Địa chỉ.
        role (str): Vai trò (mặc định: user).
        created_at (datetime): Thời gian tạo.

    Quan hệ:
        rfid_card (RFIDCard): Thẻ RFID gắn với người dùng (1-1).
    """

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Tên người dùng
    name = Column(Unicode(255), nullable=True)

    # Username phải duy nhất
    username = Column(String(255), unique=True, nullable=False)

    # Mật khẩu đã được hash
    password = Column(String(255), nullable=False)

    # Số điện thoại
    phone = Column(String(20), nullable=True)

    # Email
    email = Column(String(255), nullable=True)

    # Họ tên đầy đủ
    full_name = Column(Unicode(255), nullable=True)

    # Ngày sinh
    date_of_birth = Column(String(10), nullable=True)

    # Giới tính
    gender = Column(String(20), default='male')

    # Địa chỉ
    address = Column(Unicode(500), nullable=True)

    # Vai trò người dùng (user / admin)
    role = Column(String(10), default='user')

    # Thời gian tạo
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ 1-1 với RFIDCard
    rfid_card = relationship(
        "RFIDCard",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
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
Cập nhật cuối: 09:59 06/05/2026
"""

from app.db.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Unicode


class User(Base):
    """
    Mô hình người dùng (User).

    Tương ứng với bảng 'users' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, tự tăng.
        name (str): Tên người dùng.
        username (str): Tên đăng nhập (duy nhất).
        password (str): Mật khẩu đã được mã hóa.
        phonenumber (str): Số điện thoại.
        role (str): Vai trò (mặc định: user).

    Quan hệ:
        rfid_card (RFIDCard): Thẻ RFID gắn với người dùng (1-1).
    """

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Tên người dùng (hỗ trợ Unicode, ví dụ tiếng Việt)
    name = Column(Unicode(255), nullable=False)

    # Username phải duy nhất
    username = Column(String(255), unique=True, nullable=False)

    # Mật khẩu đã được hash (không lưu plain text)
    password = Column(String(255), nullable=False)

    # Số điện thoại (có thể null nếu không bắt buộc)
    phonenumber = Column(String(10))

    # Vai trò người dùng (user / admin ...)
    role = Column(String(10), default='user')

    # Quan hệ 1-1 với RFIDCard
    # - uselist=False: đảm bảo mỗi user chỉ có 1 thẻ
    # - cascade="all, delete": xóa user sẽ xóa luôn thẻ RFID liên quan
    rfid_card = relationship(
        "RFIDCard",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
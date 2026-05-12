"""
Module User Model

Định nghĩa mô hình dữ liệu (ORM) cho bảng người dùng trong hệ thống.
"""

from app.db.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Unicode, DateTime
from datetime import datetime


class User(Base):
    """Mô hình người dùng (User)."""

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(255), nullable=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phonenumber = Column(String(20), nullable=True)
    role = Column(String(10), default='user')

    # Quan hệ 1-1 với RFIDCard
    rfid_card = relationship(
        "RFIDCard",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
"""
Module RFID Model

Định nghĩa mô hình dữ liệu (ORM) cho bảng thẻ RFID.

Bảng này lưu trữ:
- UID của thẻ
- Liên kết tới người dùng

Quan hệ:
- Mỗi thẻ RFID thuộc về đúng 1 người dùng
- Mỗi người dùng chỉ có tối đa 1 thẻ RFID

Tác giả: trungtranjqk
Cập nhật cuối: 09:59 06/05/2026
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class RFIDCard(Base):
    """
    Mô hình thẻ RFID (RFIDCard).

    Tương ứng với bảng 'rfid_cards' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính.
        card_uid (str): Mã UID của thẻ (duy nhất).
        user_id (int): ID người dùng sở hữu thẻ (duy nhất).

    Quan hệ:
        user (User): Người dùng sở hữu thẻ RFID (1-1).
    """

    __tablename__ = "rfid_cards"

    # Khóa chính
    id = Column(Integer, primary_key=True, index=True)

    # UID của thẻ RFID (duy nhất, dùng để quét)
    card_uid = Column(String(50), unique=True, nullable=False, index=True)

    # Liên kết tới bảng users
    # - unique=True: đảm bảo mỗi user chỉ có 1 thẻ
    # - ondelete="CASCADE": xóa user → xóa luôn thẻ
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    # Quan hệ với bảng User
    # back_populates="rfid_card" liên kết với thuộc tính bên User model
    user = relationship("User", back_populates="rfid_card")
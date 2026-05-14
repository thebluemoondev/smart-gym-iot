"""
Module RFID Access Log Model

Lưu lịch sử quẹt thẻ / access-check của hội viên.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.db.database import Base


class RFIDAccessLog(Base):
    __tablename__ = "rfid_access_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    card_uid = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    access_granted = Column(Boolean, nullable=False, default=False)
    reason = Column(String(255), nullable=True)
    checked_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

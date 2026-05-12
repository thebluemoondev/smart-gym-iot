# app/models/payment.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from app.db.database import Base
import enum
from datetime import datetime

class PaymentMethod(str, enum.Enum):
    MOMO = "momo"
    ZALOPAY = "zalopay"
    BANK_TRANSFER = "bank_transfer"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    subscription_id = Column(Integer, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="VND")
    payment_method = Column(String(50), nullable=False)  # momo, zalopay, bank_transfer
    status = Column(String(20), default="pending")
    transaction_id = Column(String(100), nullable=True)  # ID từ Momo/ZaloPay
    order_id = Column(String(100), nullable=True)  # ID đơn hàng nội bộ
    description = Column(Text, nullable=True)
    payment_url = Column(Text, nullable=True)  # URL thanh toán
    qr_code = Column(Text, nullable=True)  # QR code data
    callback_data = Column(Text, nullable=True)  # Data từ callback
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
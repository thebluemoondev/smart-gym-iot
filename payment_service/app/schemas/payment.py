# app/schemas/payment.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    user_id: int
    subscription_id: Optional[int] = None
    amount: float
    payment_method: str  # momo, zalopay, bank_transfer
    description: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None
    callback_data: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    user_id: int
    subscription_id: Optional[int] = None
    amount: float
    currency: str = "VND"
    payment_method: str
    status: str
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None
    description: Optional[str] = None
    payment_url: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Request thanh toán
class CreatePaymentRequest(BaseModel):
    user_id: int
    subscription_id: int
    amount: float
    payment_method: str  # momo, zalopay, bank_transfer

# Response tạo thanh toán
class PaymentResponse(BaseModel):
    order_id: str
    payment_url: Optional[str] = None
    qr_code: Optional[str] = None
    qr_code_image: Optional[str] = None
    bank_info: Optional[dict] = None
    amount: float
    status: str
    message: str

# Callback từ Momo/ZaloPay
class PaymentCallbackRequest(BaseModel):
    order_id: str
    transaction_id: str
    status: str
    amount: Optional[float] = None
    extra_data: Optional[str] = None
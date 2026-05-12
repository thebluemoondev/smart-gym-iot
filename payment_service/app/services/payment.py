# app/services/payment.py
from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate
from datetime import datetime
import uuid
import json
import io
import base64
import qrcode

# Import payment providers
from app.services import momo

def generate_order_id() -> str:
    return f"GYMBILL-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

def create_payment(db: Session, payment_data: dict) -> Payment:
    order_id = generate_order_id()
    payment = Payment(
        user_id=payment_data["user_id"],
        subscription_id=payment_data.get("subscription_id"),
        amount=payment_data["amount"],
        payment_method=payment_data["payment_method"],
        order_id=order_id,
        status=PaymentStatus.PENDING.value,
        description=payment_data.get("description")
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def get_payment_by_order_id(db: Session, order_id: str) -> Payment:
    return db.query(Payment).filter(Payment.order_id == order_id).first()

def get_payment_by_id(db: Session, payment_id: int) -> Payment:
    return db.query(Payment).filter(Payment.id == payment_id).first()

def get_user_payments(db: Session, user_id: int):
    return db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).all()

def update_payment_status(db: Session, order_id: str, status: str, transaction_id: str = None, callback_data: str = None):
    payment = get_payment_by_order_id(db, order_id)
    if payment:
        payment.status = status
        if transaction_id:
            payment.transaction_id = transaction_id
        if callback_data:
            payment.callback_data = callback_data
        if status == PaymentStatus.SUCCESS.value:
            payment.completed_at = datetime.utcnow()
        payment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(payment)
    return payment

def create_momo_payment(order_id: str, amount: float, description: str = "") -> dict:
    """Tạo thanh toán Momo - Tích hợp thật"""
    return momo.create_momo_payment(order_id, amount, description)

def create_zalopay_payment(order_id: str, amount: float) -> dict:
    """Tạo thanh toán ZaloPay - Tích hợp thật (chưa implement)"""
    return {
        "success": False,
        "error": "ZaloPay chưa được tích hợp. Liên hệ admin để được hỗ trợ.",
        "payment_url": None,
        "qr_code": None
    }

def create_bank_transfer(order_id: str, amount: float) -> dict:
    """Tạo QR code chuyển khoản ngân hàng - VietQR VPBank chuẩn EMVCo"""
    bank_info = {
        "bank_name": "VPBank",
        "bank_code": "970436",
        "account_number": "0356741686",
        "account_name": "NGUYEN NHU THANH",
        "content": order_id
    }

    # Tạo QR theo chuẩn VietQR (EMVCo)
    # Format: ID|Length|Data
    # 00 - Global
    # 01 - Bank Code
    # 02 - Account Number
    # 03 - Amount
    # 08 - Content

    def add_field(id: str, data: str) -> str:
        return f"{id}{len(data):02d}{data}"

    # Xây dựng payload theo chuẩn VietQR
    global_id = add_field("00", "02")  # QR loại tĩnh
    bank_code_field = add_field("01", bank_info["bank_code"])
    account_field = add_field("02", bank_info["account_number"])
    amount_field = add_field("03", f"{int(amount)}")
    content_field = add_field("08", order_id)

    # Tạo chuỗi QR
    qr_payload = f"{global_id}{bank_code_field}{account_field}{amount_field}{content_field}"

    # Tạo QR code image
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert sang base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "success": True,
        "qr_code_image": f"data:image/png;base64,{qr_base64}",
        "bank_info": bank_info,
        "amount": int(amount),
        "order_id": order_id,
        "status": "pending",
        "payment_url": None
    }

def process_payment(payment: Payment, method: str) -> dict:
    """Xử lý thanh toán theo phương thức"""
    if method == "momo":
        return create_momo_payment(payment.order_id, payment.amount, payment.description or "")
    elif method == "zalopay":
        return create_zalopay_payment(payment.order_id, payment.amount)
    elif method == "bank_transfer":
        return create_bank_transfer(payment.order_id, payment.amount)
    else:
        return {"error": "Phương thức thanh toán không hỗ trợ"}
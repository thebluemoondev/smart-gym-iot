"""
Payment Service - Xử lý thanh toán

Module này cung cấp các chức năng:
- Tạo thanh toán mới
- Cập nhật trạng thái thanh toán
- Tạo QR code VPBank
- Tích hợp Momo (chưa active)

Author: Smart Gym Team
Created: 2026
"""

from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate
from datetime import datetime
import uuid
import io
import base64
import qrcode

# Import các payment providers
# Momo integration đang trong giai đoạn chờ credentials
from app.services import momo


def generate_order_id() -> str:
    """
    Tạo mã đơn hàng duy nhất theo format: GYMBILL-YYYYMMDD-XXXXXXXX

    Returns:
        str: Mã đơn hàng theo định dạng GYMBILL-YYYYMMDD-{8 ký tự hex}
    """
    return f"GYMBILL-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def create_payment(db: Session, payment_data: dict) -> Payment:
    """
    Tạo bản ghi thanh toán mới trong database

    Args:
        db: SQLAlchemy Session
        payment_data: Dictionary chứa thông tin thanh toán
            - user_id: ID người dùng
            - subscription_id: ID gói tập (optional)
            - amount: Số tiền
            - payment_method: Phương thức thanh toán
            - description: Mô tả (optional)

    Returns:
        Payment: Đối tượng thanh toán đã được tạo
    """
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
    """
    Lấy thông tin thanh toán theo mã đơn hàng

    Args:
        db: SQLAlchemy Session
        order_id: Mã đơn hàng cần tìm

    Returns:
        Payment | None: Đối tượng thanh toán hoặc None nếu không tìm thấy
    """
    return db.query(Payment).filter(Payment.order_id == order_id).first()


def get_payment_by_id(db: Session, payment_id: int) -> Payment:
    """
    Lấy thông tin thanh toán theo ID

    Args:
        db: SQLAlchemy Session
        payment_id: ID thanh toán cần tìm

    Returns:
        Payment | None: Đối tượng thanh toán hoặc None nếu không tìm thấy
    """
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_user_payments(db: Session, user_id: int):
    """
    Lấy lịch sử thanh toán của người dùng

    Args:
        db: SQLAlchemy Session
        user_id: ID người dùng

    Returns:
        List[Payment]: Danh sách các thanh toán, sắp xếp theo ngày giảm dần
    """
    return db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.created_at.desc()).all()


def update_payment_status(db: Session, order_id: str, status: str, transaction_id: str = None, callback_data: str = None):
    """
    Cập nhật trạng thái thanh toán

    Args:
        db: SQLAlchemy Session
        order_id: Mã đơn hàng cần cập nhật
        status: Trạng thái mới (pending, success, failed, etc.)
        transaction_id: ID giao dịch từ payment provider (optional)
        callback_data: Dữ liệu callback từ provider (optional)

    Returns:
        Payment | None: Đối tượng đã cập nhật hoặc None nếu không tìm thấy
    """
    payment = get_payment_by_order_id(db, order_id)
    if payment:
        payment.status = status
        if transaction_id:
            payment.transaction_id = transaction_id
        if callback_data:
            payment.callback_data = callback_data
        # Nếu thanh toán thành công, lưu thời gian hoàn thành
        if status == PaymentStatus.SUCCESS.value:
            payment.completed_at = datetime.utcnow()
        payment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(payment)
    return payment


def create_momo_payment(order_id: str, amount: float, description: str = "") -> dict:
    """
    Tạo thanh toán qua Momo (Chưa active - cần credentials)

    Args:
        order_id: Mã đơn hàng
        amount: Số tiền
        description: Mô tả thanh toán

    Returns:
        dict: Kết quả từ Momo API
    """
    return momo.create_momo_payment(order_id, amount, description)


def create_zalopay_payment(order_id: str, amount: float) -> dict:
    """
    Tạo thanh toán qua ZaloPay (Placeholder - chưa implement)

    Args:
        order_id: Mã đơn hàng
        amount: Số tiền

    Returns:
        dict: Kết quả với thông báo chưa tích hợp
    """
    return {
        "success": False,
        "error": "ZaloPay chưa được tích hợp. Liên hệ admin để được hỗ trợ.",
        "payment_url": None,
        "qr_code": None
    }


def create_bank_transfer(order_id: str, amount: float) -> dict:
    """
    Tạo QR code chuyển khoản ngân hàng VPBank theo chuẩn VietQR

    Args:
        order_id: Mã đơn hàng (dùng làm nội dung chuyển khoản)
        amount: Số tiền cần thanh toán

    Returns:
        dict: Thông tin chuyển khoản bao gồm:
            - success: Trạng thái tạo QR
            - qr_code_image: Ảnh QR code (base64)
            - bank_info: Thông tin ngân hàng
            - amount: Số tiền
            - order_id: Mã đơn hàng
            - status: Trạng thái thanh toán
    """
    # Thông tin tài khoản VPBank
    bank_info = {
        "bank_name": "VPBank",
        "bank_code": "970436",
        "account_number": "0356741686",
        "account_name": "NGUYEN NHU THANH",
        "content": order_id
    }

    # Format VietQR: bank_code|account_number|amount|content
    transfer_content = f"970436|{bank_info['account_number']}|{int(amount)}|{order_id}"

    # Tạo QR code với các tham số:
    # - version: None (auto)
    # - error_correction: ERROR_CORRECT_H ( cho phép khôi phục 30% dữ liệu)
    # - box_size: 10px
    # - border: 4 modules
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(transfer_content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert sang base64 để hiển thị trên web
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
    """
    Xử lý thanh toán theo phương thức được chọn

    Args:
        payment: Đối tượng Payment từ database
        method: Phương thức thanh toán (momo, zalopay, bank_transfer)

    Returns:
        dict: Kết quả xử lý từ payment provider tương ứng

    Raises:
        ValueError: Nếu phương thức không được hỗ trợ
    """
    if method == "momo":
        return create_momo_payment(payment.order_id, payment.amount, payment.description or "")
    elif method == "zalopay":
        return create_zalopay_payment(payment.order_id, payment.amount)
    elif method == "bank_transfer":
        return create_bank_transfer(payment.order_id, payment.amount)
    else:
        return {"error": "Phương thức thanh toán không hỗ trợ"}
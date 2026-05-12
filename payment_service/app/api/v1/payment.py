"""
Payment API Routes - Các endpoint xử lý thanh toán

Cung cấp các API:
- POST /create: Tạo thanh toán mới
- GET /order/{order_id}: Lấy thông tin thanh toán
- GET /user/{user_id}: Lấy lịch sử thanh toán
- POST /callback: Webhook từ Momo/ZaloPay
- GET /methods: Danh sách phương thức thanh toán

Author: Smart Gym Team
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import payment as payment_service
from app.schemas.payment import PaymentOut, PaymentResponse, PaymentCallbackRequest

router = APIRouter(tags=["Thanh toán (Payment)"])


# Mã giảm giá được hỗ trợ
VALID_DISCOUNT_CODES = {
    "THANHCHINH": 0,  # Miễn phí 100%
    "WELCOME50": 50,   # Giảm 50%
    "GYM25": 25,       # Giảm 25%
}


def apply_discount(amount: float, discount_code: str = None) -> tuple:
    """
    Tính toán giảm giá dựa trên mã code

    Args:
        amount: Số tiền gốc
        discount_code: Mã giảm giá (optional)

    Returns:
        tuple: (số tiền sau giảm, mã giảm giá đã áp dụng, % giảm)
    """
    if not discount_code or discount_code.upper() not in VALID_DISCOUNT_CODES:
        return amount, None, 0

    code = discount_code.upper()
    discount_percent = VALID_DISCOUNT_CODES[code]
    final_amount = amount * (1 - discount_percent / 100)

    return final_amount, code, discount_percent


@router.post("/create", response_model=PaymentResponse, summary="Tạo thanh toán mới")
def create_payment(
    user_id: int,
    subscription_id: int,
    amount: float,
    payment_method: str,
    discount_code: str = None,
    db: Session = Depends(get_db)
):
    """
    Tạo đơn thanh toán mới và trả về URL thanh toán hoặc QR code

    Args:
        user_id: ID của người dùng
        subscription_id: ID gói tập cần thanh toán
        amount: Số tiền thanh toán (VND)
        payment_method: Phương thức thanh toán (momo, zalopay, bank_transfer)
        discount_code: Mã giảm giá (optional) - THANHCHINH, WELCOME50, GYM25
        db: Database session

    Returns:
        PaymentResponse: Thông tin thanh toán bao gồm QR code hoặc payment URL

    Raises:
        HTTPException 400: Nếu phương thức không hỗ trợ hoặc có lỗi tạo thanh toán
    """
    # Validate payment method
    if payment_method not in ["momo", "zalopay", "bank_transfer"]:
        raise HTTPException(status_code=400, detail="Phương thức thanh toán không hỗ trợ")

    # Áp dụng mã giảm giá nếu có
    final_amount, applied_code, discount_percent = apply_discount(amount, discount_code)

    # Chuẩn bị dữ liệu thanh toán
    payment_data = {
        "user_id": user_id,
        "subscription_id": subscription_id,
        "amount": final_amount,  # Sử dụng số tiền sau khi giảm giá
        "payment_method": payment_method,
        "description": f"Thanh toán gói tập #{subscription_id}" + (f" - Giảm {discount_percent}%" if applied_code else "")
    }

    # Tạo bản ghi thanh toán trong database
    payment = payment_service.create_payment(db, payment_data)

    # Nếu dùng mã giảm giá THANHCHINH -> thanh toán ngay thành công
    if applied_code == "THANHCHINH":
        payment_service.update_payment_status(db, payment.order_id, "success", transaction_id=f"DISCOUNT-{applied_code}")
        payment.status = "success"
        return PaymentResponse(
            order_id=payment.order_id,
            payment_url=None,
            qr_code=None,
            qr_code_image=None,
            bank_info=None,
            amount=final_amount,
            original_amount=amount,
            discount_code=applied_code,
            discount_percent=discount_percent,
            status="success",
            message=f"Thanh toán thành công! Mã giảm giá {applied_code} đã được áp dụng (100%)"
        )

    # Xử lý thanh toán theo phương thức (bank_transfer, momo, zalopay)
    result = payment_service.process_payment(payment, payment_method)

    # Kiểm tra lỗi từ provider
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Lưu URL/QR vào database
    if result.get("payment_url"):
        payment.payment_url = result["payment_url"]
    if result.get("qr_code"):
        payment.qr_code = result.get("qr_code")
    if result.get("qr_code_image"):
        payment.qr_code = result.get("qr_code_image")
    db.commit()

    # Tạo message
    message = "Tạo thanh toán thành công"
    if applied_code:
        message += f" - Mã {applied_code} giảm {discount_percent}%"

    return PaymentResponse(
        order_id=payment.order_id,
        payment_url=result.get("payment_url"),
        qr_code=result.get("qr_code"),
        qr_code_image=result.get("qr_code_image"),
        bank_info=result.get("bank_info"),
        amount=final_amount,
        original_amount=amount if applied_code else None,
        discount_code=applied_code,
        discount_percent=discount_percent if applied_code else None,
        status=payment.status,
        message=message
    )


@router.get("/order/{order_id}", response_model=PaymentOut, summary="Lấy thông tin thanh toán")
def get_payment_by_order(order_id: str, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của một thanh toán theo mã đơn hàng

    Args:
        order_id: Mã đơn hàng cần tra cứu
        db: Database session

    Returns:
        PaymentOut: Thông tin chi tiết thanh toán

    Raises:
        HTTPException 404: Nếu không tìm thấy thanh toán
    """
    payment = payment_service.get_payment_by_order_id(db, order_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Không tìm thấy thanh toán")
    return payment


@router.get("/user/{user_id}", response_model=List[PaymentOut], summary="Lịch sử thanh toán")
def get_user_payments(user_id: int, db: Session = Depends(get_db)):
    """
    Lấy toàn bộ lịch sử thanh toán của một người dùng

    Args:
        user_id: ID người dùng
        db: Database session

    Returns:
        List[PaymentOut]: Danh sách các thanh toán, sắp xếp theo thời gian giảm dần
    """
    return payment_service.get_user_payments(db, user_id)


@router.post("/callback", summary="Callback từ Momo/ZaloPay")
def payment_callback(data: PaymentCallbackRequest, db: Session = Depends(get_db)):
    """
    Endpoint nhận callback webhook từ các payment provider (Momo, ZaloPay)
    Dùng để cập nhật trạng thái thanh toán tự động

    Args:
        data: PaymentCallbackRequest chứa:
            - order_id: Mã đơn hàng
            - transaction_id: ID giao dịch từ provider
            - status: Trạng thái thanh toán (success, failed)
            - amount: Số tiền (optional)
            - extra_data: Dữ liệu bổ sung (optional)
        db: Database session

    Returns:
        dict: Kết quả xử lý callback
    """
    # Tìm thanh toán theo order_id
    payment = payment_service.get_payment_by_order_id(db, data.order_id)
    if not payment:
        return {"status": "error", "message": "Không tìm thấy thanh toán"}

    # Cập nhật trạng thái dựa trên callback
    if data.status == "success":
        payment_service.update_payment_status(
            db, data.order_id, "success",
            transaction_id=data.transaction_id,
            callback_data=data.extra_data
        )
        return {"status": "success", "message": "Cập nhật thành công"}
    else:
        payment_service.update_payment_status(db, data.order_id, "failed")
        return {"status": "failed", "message": "Thanh toán thất bại"}


@router.get("/methods", summary="Danh sách phương thức thanh toán")
def get_payment_methods():
    """
    Lấy danh sách các phương thức thanh toán được hỗ trợ

    Returns:
        dict: Danh sách phương thức với ID, tên và mô tả
    """
    return {
        "methods": [
            {"id": "momo", "name": "Momo", "description": "Thanh toán qua Momo"},
            {"id": "zalopay", "name": "ZaloPay", "description": "Thanh toán qua ZaloPay"},
            {"id": "bank_transfer", "name": "Chuyển khoản", "description": "Quét QR chuyển khoản ngân hàng"}
        ]
    }
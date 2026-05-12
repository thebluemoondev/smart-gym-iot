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


@router.post("/create", response_model=PaymentResponse, summary="Tạo thanh toán mới")
def create_payment(
    user_id: int,
    subscription_id: int,
    amount: float,
    payment_method: str,
    db: Session = Depends(get_db)
):
    """
    Tạo đơn thanh toán mới và trả về URL thanh toán hoặc QR code

    Args:
        user_id: ID của người dùng
        subscription_id: ID gói tập cần thanh toán
        amount: Số tiền thanh toán (VND)
        payment_method: Phương thức thanh toán (momo, zalopay, bank_transfer)
        db: Database session

    Returns:
        PaymentResponse: Thông tin thanh toán bao gồm QR code hoặc payment URL

    Raises:
        HTTPException 400: Nếu phương thức không hỗ trợ hoặc có lỗi tạo thanh toán
    """
    # Validate payment method
    if payment_method not in ["momo", "zalopay", "bank_transfer"]:
        raise HTTPException(status_code=400, detail="Phương thức thanh toán không hỗ trợ")

    # Chuẩn bị dữ liệu thanh toán
    payment_data = {
        "user_id": user_id,
        "subscription_id": subscription_id,
        "amount": amount,
        "payment_method": payment_method,
        "description": f"Thanh toán gói tập #{subscription_id}"
    }

    # Tạo bản ghi thanh toán trong database
    payment = payment_service.create_payment(db, payment_data)

    # Xử lý thanh toán theo phương thức
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

    return PaymentResponse(
        order_id=payment.order_id,
        payment_url=result.get("payment_url"),
        qr_code=result.get("qr_code"),
        qr_code_image=result.get("qr_code_image"),
        bank_info=result.get("bank_info"),
        amount=payment.amount,
        status=payment.status,
        message="Tạo thanh toán thành công"
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
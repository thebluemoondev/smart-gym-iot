# app/api/v1/payment.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import payment as payment_service
from app.schemas.payment import PaymentOut, PaymentResponse, PaymentCallbackRequest

router = APIRouter(tags=["Thanh toán (Payment)"])

@router.post("/create", response_model=PaymentResponse, summary="Tạo thanh toán")
def create_payment(
    user_id: int,
    subscription_id: int,
    amount: float,
    payment_method: str,  # momo, zalopay, bank_transfer
    db: Session = Depends(get_db)
):
    """Tạo đơn thanh toán - Return URL thanh toán hoặc QR code"""
    if payment_method not in ["momo", "zalopay", "bank_transfer"]:
        raise HTTPException(status_code=400, detail="Phương thức thanh toán không hỗ trợ")

    payment_data = {
        "user_id": user_id,
        "subscription_id": subscription_id,
        "amount": amount,
        "payment_method": payment_method,
        "description": f"Thanh toán gói tập #{subscription_id}"
    }

    payment = payment_service.create_payment(db, payment_data)
    result = payment_service.process_payment(payment, payment_method)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Update payment với URL/QR
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
    """Lấy thông tin thanh toán theo order_id"""
    payment = payment_service.get_payment_by_order_id(db, order_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Không tìm thấy thanh toán")
    return payment

@router.get("/user/{user_id}", response_model=List[PaymentOut], summary="Lịch sử thanh toán")
def get_user_payments(user_id: int, db: Session = Depends(get_db)):
    """Lấy lịch sử thanh toán của user"""
    return payment_service.get_user_payments(db, user_id)

@router.post("/callback", summary="Callback từ Momo/ZaloPay")
def payment_callback(data: PaymentCallbackRequest, db: Session = Depends(get_db)):
    """Webhook nhận callback từ Momo/ZaloPay"""
    payment = payment_service.get_payment_by_order_id(db, data.order_id)
    if not payment:
        return {"status": "error", "message": "Không tìm thấy thanh toán"}

    # Update payment status
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
    """Lấy danh sách phương thức thanh toán hỗ trợ"""
    return {
        "methods": [
            {"id": "momo", "name": "Momo", "description": "Thanh toán qua Momo"},
            {"id": "zalopay", "name": "ZaloPay", "description": "Thanh toán qua ZaloPay"},
            {"id": "bank_transfer", "name": "Chuyển khoản", "description": "Quét QR chuyển khoản"}
        ]
    }
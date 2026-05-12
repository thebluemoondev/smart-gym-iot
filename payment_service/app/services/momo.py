# app/services/momo.py
import hmac
import hashlib
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()

MOMO_PARTNER_CODE = os.getenv("MOMO_PARTNER_CODE", "")
MOMO_ACCESS_KEY = os.getenv("MOMO_ACCESS_KEY", "")
MOMO_SECRET_KEY = os.getenv("MOMO_SECRET_KEY", "")
MOMO_ENDPOINT = os.getenv("MOMO_ENDPOINT", "https://test-payment.momo.vn/v2/gateway/api/create")

def create_signature(data: str) -> str:
    """Tạo chữ ký HMAC-SHA256"""
    return hmac.new(
        MOMO_SECRET_KEY.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()

def create_momo_payment(order_id: str, amount: float, description: str = "") -> dict:
    """Tạo thanh toán qua Momo"""

    # Nếu chưa có config, return mock
    if not MOMO_PARTNER_CODE or MOMO_PARTNER_CODE == "YOUR_PARTNER_CODE":
        return {
            "success": False,
            "error": "Chưa cấu hình Momo. Vui lòng cập nhật MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY trong .env",
            "payment_url": None,
            "qr_code": None
        }

    # Tạo request data
    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "partnerName": "Smart Gym",
        "storeId": "SmartGym",
        "requestId": order_id,
        "amount": int(amount),
        "orderId": order_id,
        "orderInfo": description or f"Thanh toán Smart Gym - {order_id}",
        "redirectUrl": "http://localhost/payment/success",
        "ipnUrl": "http://localhost/api/payment/callback",
        "requestType": "captureWallet",
        "extraData": ""
    }

    # Tạo chữ ký
    signature_data = f"accessKey={MOMO_ACCESS_KEY}&amount={payload['amount']}&extraData={payload['extraData']}&ipnUrl={payload['ipnUrl']}&orderId={payload['orderId']}&orderInfo={payload['orderInfo']}&partnerCode={MOMO_PARTNER_CODE}&redirectUrl={payload['redirectUrl']}&requestId={payload['requestId']}&requestType={payload['requestType']}"
    payload["signature"] = create_signature(signature_data)

    try:
        # Gọi API Momo
        response = requests.post(MOMO_ENDPOINT, json=payload, timeout=10)
        result = response.json()

        if result.get("resultCode") == 0:
            return {
                "success": True,
                "payment_url": result.get("payUrl"),
                "qr_code": result.get("qrCode"),
                "order_id": result.get("orderId"),
                "trans_id": result.get("transId")
            }
        else:
            return {
                "success": False,
                "error": result.get("message", "Lỗi từ Momo"),
                "payment_url": None,
                "qr_code": None
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "payment_url": None,
            "qr_code": None
        }

def verify_callback(data: dict, signature: str) -> bool:
    """Xác thực callback từ Momo"""
    # Tạo chữ ký từ data
    raw_data = f"accessKey={MOMO_ACCESS_KEY}&amount={data.get('amount')}&extraData={data.get('extraData')}&message={data.get('message')}&orderId={data.get('orderId')}&partnerCode={MOMO_PARTNER_CODE}&requestType={data.get('requestType')}&resultCode={data.get('resultCode')}&transId={data.get('transId')}"
    expected_signature = create_signature(raw_data)
    return signature == expected_signature

def query_transaction(trans_id: str) -> dict:
    """Truy vấn giao dịch Momo"""
    if not MOMO_PARTNER_CODE or MOMO_PARTNER_CODE == "YOUR_PARTNER_CODE":
        return {"success": False, "error": "Chưa cấu hình Momo"}

    endpoint = os.getenv("MOMO_QUERY_ENDPOINT", "https://test-payment.momo.vn/v2/gateway/query")
    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "requestId": trans_id,
        "orderId": trans_id,
        "requestType": "transactionStatus"
    }

    signature_data = f"accessKey={MOMO_ACCESS_KEY}&orderId={payload['orderId']}&partnerCode={MOMO_PARTNER_CODE}&requestId={payload['requestId']}&requestType={payload['requestType']}"
    payload["signature"] = create_signature(signature_data)

    try:
        response = requests.post(endpoint, json=payload, timeout=10)
        return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}
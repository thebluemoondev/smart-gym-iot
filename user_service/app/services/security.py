"""
File: security.py

Chức năng chính:
    Cung cấp các hàm xử lý bảo mật liên quan đến mật khẩu:
        - Băm mật khẩu (hash password)
        - Xác minh mật khẩu (verify password)
        - Tạo JWT token

Mô tả module:
    Module sử dụng thư viện passlib với thuật toán bcrypt để đảm bảo
    mật khẩu được lưu trữ an toàn trong hệ thống.

    Nguyên tắc:
        - Không lưu mật khẩu dạng plain text
        - Luôn băm mật khẩu trước khi lưu
        - So sánh mật khẩu thông qua hàm verify

Tác giả: <manh64>
Ngày cập nhật gần nhất: <5/6/2026>
"""

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

# Cấu hình context để băm mật khẩu với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cấu hình JWT
SECRET_KEY = os.getenv("SECRET_KEY", "smartgym_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
    """
    Băm mật khẩu dạng plain text thành dạng mã hóa an toàn.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Xác minh mật khẩu người dùng nhập vào có khớp với mật khẩu đã băm hay không.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Tạo JWT token cho người dùng.

    Args:
        data: Dict chứa thông tin cần mã hóa trong token (vd: {"sub": username, "user_id": id})
        expires_delta: Thời gian hết hạn của token (mặc định 30 phút)

    Returns:
        Chuỗi JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Giải mã JWT token.

    Args:
        token: Chuỗi JWT token

    Returns:
        Dict chứa thông tin trong token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

"""
File: security.py

Chức năng chính:
    Cung cấp các hàm xử lý bảo mật liên quan đến mật khẩu:
        - Băm mật khẩu (hash password)
        - Xác minh mật khẩu (verify password)

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

# Cấu hình context để băm mật khẩu với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Tên hàm:
        hash_password

    Mô tả:
        Băm mật khẩu dạng plain text thành dạng mã hóa an toàn.

    Tham số:
        password (str):
            Mật khẩu gốc do người dùng nhập.

    Giá trị trả về:
        str:
            Chuỗi mật khẩu đã được băm bằng bcrypt.

    Ghi chú:
        Mật khẩu sau khi băm sẽ được lưu vào database thay vì mật khẩu gốc.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Tên hàm:
        verify_password

    Mô tả:
        Xác minh mật khẩu người dùng nhập vào có khớp với mật khẩu đã băm hay không.

    Tham số:
        plain_password (str):
            Mật khẩu người dùng nhập.
        hashed_password (str):
            Mật khẩu đã được băm lưu trong database.

    Giá trị trả về:
        bool:
            True nếu mật khẩu đúng, False nếu sai.

    Ghi chú:
        Hàm sử dụng cơ chế so sánh an toàn của bcrypt, không giải mã mật khẩu.
    """
    return pwd_context.verify(plain_password, hashed_password)
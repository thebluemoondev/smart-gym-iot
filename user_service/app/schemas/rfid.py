"""
Module RFID Schema

Định nghĩa các schema (Pydantic) cho thẻ RFID:
- Schema cơ sở
- Schema tạo mới
- Schema trả về

Dùng để validate dữ liệu đầu vào và định dạng dữ liệu trả ra từ API.

Tác giả: duquocviet2006
Cập nhật cuối: 09:59 06/05/2026
"""

from pydantic import BaseModel, ConfigDict  # Import các lớp cần thiết từ Pydantic


class RFIDBase(BaseModel):
    """
    Schema cơ sở của thẻ RFID.

    Chứa các thông tin chung:
    - card_uid: mã UID của thẻ
    - user_id: ID người dùng sở hữu thẻ
    """
    card_uid: str
    user_id: int


class RFIDCreate(RFIDBase):
    """
    Schema dùng để tạo thẻ RFID mới.

    Kế thừa toàn bộ từ RFIDBase.
    """
    pass


class RFIDOut(RFIDBase):
    """
    Schema dùng để trả dữ liệu thẻ RFID ra ngoài API.

    Bao gồm:
    - id: mã định danh thẻ
    - các trường kế thừa từ RFIDBase
    """
    id: int
    # Cho phép chuyển đổi từ ORM (SQLAlchemy) sang schema
    model_config = ConfigDict(from_attributes=True)
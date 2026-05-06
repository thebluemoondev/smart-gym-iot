"""
File: rfid.py

Chức năng chính:
    Cung cấp các dịch vụ (service) để thao tác với thẻ RFID trong hệ thống,
    bao gồm:
        - Tạo thẻ RFID mới
        - Truy vấn thẻ theo UID
        - Xóa thẻ RFID

Mô tả module:
    Module này xử lý logic nghiệp vụ liên quan đến RFID.
    Dữ liệu được thao tác thông qua SQLAlchemy Session và các model/schema tương ứng.

    Luồng xử lý chung:
        1. Nhận dữ liệu đầu vào (schema)
        2. Kiểm tra điều kiện hợp lệ (validation)
        3. Thực hiện truy vấn hoặc thay đổi dữ liệu trong database
        4. Commit thay đổi và trả về kết quả

    Tham số chính:
        db (Session): Kết nối database
        schema: Dữ liệu đầu vào (Pydantic schema)

    Giá trị trả về:
        - Đối tượng RFIDCard (model)
        - Hoặc None nếu không hợp lệ hoặc không tìm thấy

Tác giả: <manh64>
Ngày cập nhật gần nhất: <5/6/2026>
"""

from sqlalchemy.orm import Session
from app.models import rfid as model
from app.schemas import rfid as schema


def create_rfid(db: Session, rfid: schema.RFIDCreate):
    """
    Tên hàm:
        create_rfid

    Mô tả:
        Tạo mới một thẻ RFID trong hệ thống nếu chưa tồn tại.
        Mỗi card_uid và user_id phải là duy nhất.

    Tham số:
        db (Session):
            Phiên làm việc với database.
        rfid (RFIDCreate):
            Dữ liệu đầu vào chứa thông tin thẻ (card_uid, user_id, ...).

    Giá trị trả về:
        RFIDCard:
            Đối tượng RFID vừa tạo trong database.
        None:
            Nếu card_uid hoặc user_id đã tồn tại.

    Ngoại lệ:
        Có thể phát sinh lỗi database nếu commit thất bại.

    Thuật toán:
        1. Kiểm tra xem card_uid hoặc user_id đã tồn tại chưa.
        2. Nếu tồn tại → return None.
        3. Nếu chưa:
            - Tạo object RFIDCard từ dữ liệu đầu vào
            - Thêm vào database
            - Commit thay đổi
            - Refresh để lấy dữ liệu mới nhất
        4. Trả về object vừa tạo.

    Biến cục bộ:
        existing_card:
            Kết quả kiểm tra trùng dữ liệu.
        db_rfid:
            Đối tượng RFID mới tạo.
    """
    # Kiểm tra xem mã thẻ hoặc user đã được gán thẻ chưa
    existing_card = db.query(model.RFIDCard).filter(
        (model.RFIDCard.card_uid == rfid.card_uid) |
        (model.RFIDCard.user_id == rfid.user_id)
    ).first()

    if existing_card:
        return None

    db_rfid = model.RFIDCard(**rfid.model_dump())
    db.add(db_rfid)
    db.commit()
    db.refresh(db_rfid)
    return db_rfid


def get_rfid_by_uid(db: Session, card_uid: str):
    """
    Tên hàm:
        get_rfid_by_uid

    Mô tả:
        Truy vấn và lấy thông tin thẻ RFID dựa trên mã UID.

    Tham số:
        db (Session):
            Kết nối database.
        card_uid (str):
            Mã UID của thẻ RFID.

    Giá trị trả về:
        RFIDCard:
            Nếu tìm thấy thẻ.
        None:
            Nếu không tồn tại.

    Ngoại lệ:
        Không có (trừ lỗi kết nối database).

    Thuật toán:
        1. Truy vấn bảng RFIDCard.
        2. Lọc theo card_uid.
        3. Trả về kết quả đầu tiên tìm được.
    """
    return db.query(model.RFIDCard).filter(model.RFIDCard.card_uid == card_uid).first()


def delete_rfid(db: Session, rfid_id: int):
    """
    Tên hàm:
        delete_rfid

    Mô tả:
        Xóa một thẻ RFID khỏi hệ thống dựa trên ID.

    Tham số:
        db (Session):
            Kết nối database.
        rfid_id (int):
            ID của thẻ RFID cần xóa.

    Giá trị trả về:
        RFIDCard:
            Đối tượng đã bị xóa.
        None:
            Nếu không tìm thấy thẻ.

    Ngoại lệ:
        Có thể phát sinh lỗi nếu commit thất bại.

    Thuật toán:
        1. Tìm thẻ RFID theo ID.
        2. Nếu tồn tại:
            - Xóa khỏi database
            - Commit thay đổi
        3. Trả về đối tượng đã xóa (hoặc None nếu không có).

    Biến cục bộ:
        db_rfid:
            Đối tượng RFID tìm được trong database.
    """
    db_rfid = db.query(model.RFIDCard).filter(model.RFIDCard.id == rfid_id).first()
    if db_rfid:
        db.delete(db_rfid)
        db.commit()
    return db_rfid
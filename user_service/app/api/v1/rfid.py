"""
Module RFID API

Định nghĩa các endpoint liên quan đến thẻ RFID:
- Gán thẻ cho hội viên
- Tra cứu thông tin thẻ

Sử dụng trong hệ thống:
- Quản lý hội viên
- Kiểm soát ra vào bằng thẻ RFID

Tác giả: thebluemoondev
Cập nhật cuối: 9:58 06/05/2025
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import rfid as rfid_schema
from app.schemas import rfid_access_log as rfid_log_schema
from app.services import rfid as rfid_service
from app.services import rfid_access_log as rfid_log_service

router = APIRouter(
    tags=["Quản lý Thẻ từ (RFID)"]
)

# Định nghĩa lỗi dùng chung
ERROR_RFID_EXISTS = {
    "description": "Lỗi nghiệp vụ",
    "content": {
        "application/json": {
            "example": {
                "detail": "Thẻ đã tồn tại hoặc hội viên đã có thẻ"
            }
        }
    }
}

ERROR_NOT_FOUND = {
    "description": "Không tìm thấy tài nguyên",
    "content": {
        "application/json": {
            "example": {
                "detail": "Không tìm thấy thẻ RFID"
            }
        }
    }
}


@router.get(
    "/history",
    response_model=list[rfid_log_schema.RFIDAccessLogOut],
    summary="Lịch sử quẹt thẻ RFID",
    description="Trả về lịch sử quẹt thẻ theo user hoặc card UID.",
    operation_id="get_rfid_access_history"
)
def get_rfid_history(
    user_id: int | None = None,
    card_uid: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return rfid_log_service.list_access_logs(
        db,
        user_id=user_id,
        card_uid=card_uid,
        limit=limit,
    )


@router.get(
    "/history/user/{user_id}",
    response_model=list[rfid_log_schema.RFIDAccessLogOut],
    summary="Lịch sử quẹt thẻ theo hội viên",
    description="Trả về lịch sử quẹt thẻ của một hội viên.",
    operation_id="get_rfid_access_history_by_user"
)
def get_rfid_history_by_user(user_id: int, limit: int = 100, db: Session = Depends(get_db)):
    return rfid_log_service.list_access_logs(db, user_id=user_id, limit=limit)


@router.post(
    "/",
    response_model=rfid_schema.RFIDOut,
    status_code=status.HTTP_201_CREATED,
    responses={400: ERROR_RFID_EXISTS},
    summary="Gán thẻ RFID cho hội viên",
    description="Liên kết UID thẻ vật lý với hội viên. Mỗi hội viên chỉ có tối đa 1 thẻ.",
    operation_id="assign_rfid_card"
)
def assign_rfid(rfid: rfid_schema.RFIDCreate, db: Session = Depends(get_db)):
    """
    Gán thẻ RFID cho hội viên.

    Tham số:
        rfid (RFIDCreate):
            - card_uid: UID của thẻ RFID
            - user_id: ID hội viên
        db (Session): Session database

    Trả về:
        RFIDOut: Thẻ RFID vừa được gán

    Ngoại lệ:
        HTTPException 400:
            - UID đã tồn tại
            - Hội viên đã có thẻ
    """
    new_card = rfid_service.create_rfid(db, rfid)
    if not new_card:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã thẻ đã được sử dụng hoặc hội viên đã có thẻ"
        )
    return new_card


@router.get(
    "/{card_uid}",
    response_model=rfid_schema.RFIDOut,
    responses={404: ERROR_NOT_FOUND},
    summary="Tra cứu thẻ RFID",
    description="Tra cứu thông tin thẻ và hội viên khi quẹt thẻ.",
    operation_id="get_rfid_info"
)
def read_rfid_info(card_uid: str, db: Session = Depends(get_db)):
    """
    Tra cứu thông tin thẻ RFID theo UID.

    Sử dụng trong hệ thống kiểm soát ra vào:
    - Xác thực thẻ hợp lệ
    - Lấy thông tin hội viên

    Tham số:
        card_uid (str): UID của thẻ
        db (Session): Session database

    Trả về:
        RFIDOut: Thông tin thẻ RFID

    Ngoại lệ:
        HTTPException 404: Nếu thẻ chưa được đăng ký
    """
    db_rfid = rfid_service.get_rfid_by_uid(db, card_uid)
    if not db_rfid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thẻ này chưa được đăng ký trong hệ thống"
    )
    return db_rfid

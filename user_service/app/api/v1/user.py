"""
Module User API

Định nghĩa các endpoint liên quan đến hội viên (User):
- CRUD hội viên
- Tìm kiếm hội viên

Sử dụng trong FastAPI Router.

Tác giả: thebluemoondev
Cập nhật cuối: 9:58 06/05/2025
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import user as user_service
from app.schemas import user as user_schema
from app.services import rfid as rfid_service

router = APIRouter(
    tags=["Quản lý Hội viên (Members)"]
)

# Định nghĩa lỗi dùng chung
ERROR_404 = {
    "description": "Không tìm thấy tài nguyên",
    "content": {
        "application/json": {
            "example": {"detail": "Hội viên không tồn tại"}
        }
    }
}

ERROR_400 = {
    "description": "Dữ liệu đầu vào không hợp lệ",
    "content": {
        "application/json": {
            "example": {"detail": "Tên đăng nhập đã tồn tại"}
        }
    }
}


@router.get(
    "/search",
    response_model=List[user_schema.UserOut],
    summary="Tìm kiếm hội viên",
    description="Tìm kiếm hội viên theo tên hoặc số điện thoại.",
    operation_id="search_members"
)
def search_users(
    q: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Endpoint tìm kiếm hội viên.

    Tham số:
        q (str | None): Từ khóa tìm kiếm (tên hoặc số điện thoại).
        db (Session): Session database.

    Trả về:
        list[UserOut]: Danh sách hội viên phù hợp.
    """
    return user_service.search_users(db, query=q)


@router.get(
    "/",
    response_model=List[user_schema.UserOut],
    summary="Danh sách tất cả hội viên",
    description="Truy xuất toàn bộ danh sách hội viên.",
    operation_id="get_all_members"
)
def read_all_users(db: Session = Depends(get_db)):
    """
    Lấy danh sách toàn bộ hội viên.

    Trả về:
        list[UserOut]: Danh sách tất cả hội viên.
    """
    return user_service.get_all_users(db)


@router.get(
    "/{id}",
    response_model=user_schema.UserOut,
    responses={404: ERROR_404},
    summary="Lấy thông tin chi tiết hội viên",
    description="Lấy hồ sơ chi tiết của hội viên theo ID.",
    operation_id="get_member_by_id"
)
def read_user(id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết hội viên theo ID.

    Được sử dụng trong hệ thống kiểm soát ra vào (RFID).

    Tham số:
        id (int): ID hội viên.

    Trả về:
        UserOut: Thông tin hội viên.

    Ngoại lệ:
        HTTPException 404: Nếu không tìm thấy hội viên.
    """
    user = user_service.get_user(id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ID hội viên không tồn tại trong hệ thống"
        )
    return user


@router.post(
    "/",
    response_model=user_schema.UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={400: ERROR_400},
    summary="Đăng ký hội viên mới",
    description="Tạo hồ sơ hội viên mới.",
    operation_id="register_member"
)
def create_new_user(user: user_schema.CreateUser, db: Session = Depends(get_db)):
    """
    Đăng ký hội viên mới.

    Kiểm tra username trước khi tạo.

    Tham số:
        user (CreateUser): Dữ liệu hội viên.
        db (Session): Session database.

    Trả về:
        UserOut: Hội viên vừa tạo.

    Ngoại lệ:
        HTTPException 400: Nếu username đã tồn tại.
    """
    db_user = user_service.get_user_by_username(user.username, db)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập (Username) đã tồn tại"
        )
    return user_service.create_user(user, db)


@router.put(
    "/{id}",
    response_model=user_schema.UserOut,
    responses={404: ERROR_404},
    summary="Cập nhật thông tin hội viên",
    description="Cập nhật thông tin hội viên (chỉ gửi các trường cần thay đổi).",
    operation_id="update_member"
)
def update_existing_user(id: int, user: user_schema.UpdateUser, db: Session = Depends(get_db)):
    """
    Cập nhật thông tin hội viên.

    Tham số:
        id (int): ID hội viên.
        user (UpdateUser): Dữ liệu cập nhật.

    Trả về:
        UserOut: Hội viên sau khi cập nhật.

    Ngoại lệ:
        HTTPException 404: Nếu không tìm thấy hội viên.
    """
    updated_user = user_service.update_user(id, user, db)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hội viên để cập nhật"
        )
    return updated_user


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: ERROR_404},
    summary="Xóa hội viên",
    description="Xóa vĩnh viễn hội viên khỏi hệ thống (không thể hoàn tác).",
    operation_id="delete_member"
)
def delete_existing_user(id: int, db: Session = Depends(get_db)):
    """
    Xóa hội viên theo ID.

    Tham số:
        id (int): ID hội viên.

    Ngoại lệ:
        HTTPException 404: Nếu hội viên không tồn tại.
    """
    user = user_service.delete_user(id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hội viên không tồn tại hoặc đã bị xóa"
        )
    return None

import httpx  # Thư viện để gọi API giữa các Service
from fastapi import APIRouter, Depends, HTTPException

# Giả sử bạn đã có các hàm lấy DB và Service
@router.get("/access-check/{card_uid}", summary="Kiểm tra quyền vào cửa")
async def access_check(card_uid: str, db: Session = Depends(get_db)):
    # BƯỚC 1: Kiểm tra thẻ trong DB nội bộ của User Service
    rfid_card = rfid_service.get_rfid_by_uid(db, card_uid)
    if not rfid_card or not rfid_card.is_active:
        return {"access": False, "message": "Thẻ không tồn tại hoặc đã bị khóa"}

    user_id = rfid_card.user_id

    # BƯỚC 2: Gọi sang Membership Service (Dùng URL nội bộ Docker)
    # Lưu ý: 'membership_service' là tên container trong docker-compose
    membership_url = f"http://membership_service:6002/api/v1/subscriptions/active/{user_id}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(membership_url)
            if response.status_code == 200:
                data = response.json()
                if data: # Nếu có gói tập active
                    return {
                        "access": True,
                        "user_id": user_id,
                        "message": "Chào mừng hội viên! Mời vào."
                    }

            return {"access": False, "message": "Hội viên chưa mua gói hoặc gói đã hết hạn"}

        except Exception:
            # Nếu Membership Service sập, vẫn báo lỗi để bảo mật
            return {"access": False, "message": "Lỗi xác thực gói tập (Server Down)"}
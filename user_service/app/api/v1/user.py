"""
Module User API

Định nghĩa các endpoint liên quan đến hội viên (User):
- CRUD hội viên
- Tìm kiếm hội viên
- Đăng nhập
- Đăng ký

Sử dụng trong FastAPI Router.

Tác giả: thebluemoondev
Cập nhật cuối: 11/05/2026
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import httpx

from app.db.database import get_db
from app.services import user as user_service
from app.schemas import user as user_schema
from app.services import rfid as rfid_service
from app.services import rfid_access_log as rfid_log_service
from app.schemas import rfid_access_log as rfid_log_schema

INTELLIGENCE_SERVICE_URL = "http://intelligence_service:6007"

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

ERROR_401 = {
    "description": "Thông tin đăng nhập không đúng",
    "content": {
        "application/json": {
            "example": {"detail": "Tên đăng nhập hoặc mật khẩu không đúng"}
        }
    }
}


def notify_user_task(user_id: int, subject: str, message: str, task_type: str = "profile", action_label: str | None = None, action_path: str | None = None):
    payload = {
        "user_id": user_id,
        "subject": subject,
        "message": message,
        "task_type": task_type,
        "action_label": action_label,
        "action_path": action_path,
    }
    try:
        httpx.post(f"{INTELLIGENCE_SERVICE_URL}/api/v1/intelligence/notifications/task", json=payload, timeout=6.0)
    except Exception:
        pass


# ==================== AUTH ENDPOINTS ====================

@router.post(
    "/register",
    response_model=user_schema.UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={400: ERROR_400},
    summary="Đăng ký tài khoản mới",
    description="Tạo tài khoản hội viên mới.",
    operation_id="register_user"
)
def register(user: user_schema.CreateUser, db: Session = Depends(get_db)):
    """
    Đăng ký tài khoản hội viên mới.

    Tham số:
        user (CreateUser): Thông tin đăng ký
        db (Session): Session database

    Trả về:
        UserOut: Thông tin user vừa tạo

    Ngoại lệ:
        HTTPException 400: Nếu username đã tồn tại
    """
    username = user.username.strip()
    password = user.password.strip()
    name = user.name.strip() if user.name else None
    phone = user.phone.strip() if user.phone else None

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập không được để trống"
        )

    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu không được để trống"
        )

    # Kiểm tra username đã tồn tại chưa
    db_user = user_service.get_user_by_username(username, db)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại"
        )

    # Tạo user mới
    user.username = username
    user.password = password
    user.name = name
    user.phone = phone
    new_user = user_service.create_user(user, db)
    return new_user


@router.post(
    "/login",
    response_model=user_schema.LoginResponse,
    responses={401: ERROR_401},
    summary="Đăng nhập",
    description="Đăng nhập vào hệ thống, trả về JWT token.",
    operation_id="login_user"
)
def login(credentials: user_schema.LoginRequest, db: Session = Depends(get_db)):
    """
    Đăng nhập vào hệ thống.

    Tham số:
        credentials (LoginRequest): Tên đăng nhập và mật khẩu
        db (Session): Session database

    Trả về:
        LoginResponse: Token và thông tin user

    Ngoại lệ:
        HTTPException 401: Nếu tên đăng nhập hoặc mật khẩu không đúng
    """
    result = user_service.login_user(credentials, db)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )

    return result


# ==================== CRUD ENDPOINTS ====================

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
    return user_service.search_users(db, query=q or "")


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
    "/history",
    response_model=list[rfid_log_schema.RFIDAccessLogOut],
    summary="Lịch sử quẹt thẻ RFID",
    description="Trả về lịch sử quẹt thẻ theo hội viên hoặc card UID.",
    operation_id="get_user_rfid_access_history"
)
def get_access_history(
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
    operation_id="get_user_rfid_access_history_by_user"
)
def get_access_history_by_user(user_id: int, limit: int = 100, db: Session = Depends(get_db)):
    return rfid_log_service.list_access_logs(db, user_id=user_id, limit=limit)


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
    summary="Đăng ký hội viên mới (Admin)",
    description="Tạo hồ sơ hội viên mới (dùng cho admin).",
    operation_id="create_member"
)
def create_new_user(user: user_schema.CreateUser, db: Session = Depends(get_db)):
    """
    Đăng ký hội viên mới (dùng cho admin).

    Kiểm tra username trước khi tạo.

    Tham số:
        user (CreateUser): Dữ liệu hội viên.
        db (Session): Session database.

    Trả về:
        UserOut: Hội viên vừa tạo.

    Ngoại lệ:
        HTTPException 400: Nếu username đã tồn tại.
    """
    username = user.username.strip()
    password = user.password.strip()
    name = user.name.strip() if user.name else None
    phone = user.phone.strip() if user.phone else None

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập không được để trống"
        )

    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu không được để trống"
        )

    db_user = user_service.get_user_by_username(username, db)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập (Username) đã tồn tại"
        )
    user.username = username
    user.password = password
    user.name = name
    user.phone = phone
    created = user_service.create_user(user, db)
    if created.email:
        notify_user_task(
            created.id,
            subject="Tạo tài khoản thành công",
            message="Tài khoản của bạn đã được tạo thành công. Hãy đăng nhập để hoàn tất hồ sơ và bắt đầu sử dụng Smart Gym.",
            task_type="user_create",
            action_label="Đăng nhập",
            action_path="/login",
        )
    return created


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
    notify_user_task(
        updated_user.id,
        subject="Hồ sơ đã được cập nhật",
        message="Thông tin hồ sơ của bạn đã được lưu thành công. Hệ thống sẽ đồng bộ các gợi ý và thông báo mới.",
        task_type="profile_update",
        action_label="Xem hồ sơ",
        action_path="/customer/profile",
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


# ==================== ACCESS CHECK ====================

import httpx

@router.get("/access-check/{card_uid}", summary="Kiểm tra quyền vào cửa")
async def access_check(card_uid: str, db: Session = Depends(get_db)):
    # BƯỚC 1: Kiểm tra thẻ trong DB nội bộ của User Service
    rfid_card = rfid_service.get_rfid_by_uid(db, card_uid)
    if not rfid_card or not rfid_card.is_active:
        rfid_log_service.create_access_log(
            db,
            card_uid=card_uid,
            user_id=getattr(rfid_card, "user_id", None),
            access_granted=False,
            reason="Thẻ không tồn tại hoặc đã bị khóa",
        )
        return {"access": False, "message": "Thẻ không tồn tại hoặc đã bị khóa"}

    user_id = rfid_card.user_id

    # BƯỚC 2: Gọi sang Membership Service (Dùng URL nội bộ Docker)
    membership_url = f"http://membership_service:6002/api/v1/subscriptions/active/{user_id}"

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(membership_url)
            if response.status_code == 200:
                data = response.json()
                if data:  # Nếu có gói tập active
                    rfid_log_service.create_access_log(
                        db,
                        card_uid=card_uid,
                        user_id=user_id,
                        access_granted=True,
                        reason="Gói active",
                    )
                    return {
                        "access": True,
                        "user_id": user_id,
                        "message": "Chào mừng hội viên! Mời vào."
                    }

            rfid_log_service.create_access_log(
                db,
                card_uid=card_uid,
                user_id=user_id,
                access_granted=False,
                reason="Hội viên chưa mua gói hoặc gói đã hết hạn",
            )
            return {"access": False, "message": "Hội viên chưa mua gói hoặc gói đã hết hạn"}

        except httpx.HTTPError:
            rfid_log_service.create_access_log(
                db,
                card_uid=card_uid,
                user_id=user_id,
                access_granted=False,
                reason="Lỗi xác thực gói tập (Server Down)",
            )
            return {"access": False, "message": "Lỗi xác thực gói tập (Server Down)"}

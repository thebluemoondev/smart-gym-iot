from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import subscription as sub_service
from app.schemas import subscription as sub_schema
from app.external_services import get_user_by_id

router = APIRouter(
    tags=["Quản lý Đăng ký (Subscriptions)"]
)

# --- Định nghĩa phản hồi mẫu cho Swagger ---
ERROR_USER_NOT_FOUND = {"description": "Lỗi liên thông", "content": {"application/json": {"example": {"detail": "Không thể đăng ký: User với ID 1 không tồn tại trên hệ thống."}}}}
ERROR_DB_INTEGRITY = {"description": "Lỗi dữ liệu", "content": {"application/json": {"example": {"detail": "Gói tập (Package ID) không hợp lệ"}}}}

@router.post("/",
             response_model=sub_schema.SubscriptionOut,
             status_code=status.HTTP_201_CREATED,
             responses={400: ERROR_USER_NOT_FOUND},
             summary="Đăng ký gói tập cho hội viên",
             description="Thực hiện đăng ký gói tập. Hệ thống sẽ gọi sang User Service để xác thực danh tính hội viên trước khi tạo bản ghi.",
             operation_id="create_subscription")
async def subscribe_package(sub: sub_schema.SubscriptionCreate, db: Session = Depends(get_db)):
    """
    **Quy trình nghiệp vụ:**
    1. **Xác thực User:** Gọi API nội bộ sang User Service.
    2. **Kiểm tra Gói:** Kiểm tra Package ID có tồn tại trong DB Membership không.
    3. **Khởi tạo:** Thiết lập ngày bắt đầu và ngày hết hạn dựa trên cấu hình gói.
    """
    # 1.Kiểm tra xem user_id có thật không
    user_data = await get_user_by_id(sub.user_id)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể đăng ký: User với ID {sub.user_id} không tồn tại trên hệ thống."
        )

    # 2. Nếu User tồn tại, tiến hành tạo gói tập
    return sub_service.create_subscription(db, sub)

@router.get("/user/{user_id}",
            response_model=List[sub_schema.SubscriptionOut],
            summary="Lịch sử đăng ký của một hội viên",
            description="Truy xuất danh sách tất cả các gói tập (đang chạy hoặc đã hết hạn) của một người dùng cụ thể.",
            operation_id="get_subscriptions_by_user")
def read_user_subscriptions(user_id: int, db: Session = Depends(get_db)):
    return sub_service.get_user_subscriptions(db, user_id)

@router.get("/",
            response_model=List[sub_schema.SubscriptionOut],
            summary="Danh sách đăng ký toàn hệ thống",
            description="Xem danh sách tất cả các gói tập đã đăng ký trong hệ thống (Dành cho quản trị viên).",
            operation_id="get_all_subscriptions")
def read_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return sub_service.get_all_subscriptions(db, skip=skip, limit=limit)

@router.get("/active/{user_id}", summary="Kiểm tra gói tập đang hoạt động")
def check_active_subscription(user_id: int, db: Session = Depends(get_db)):
    subscription = sub_service.get_active_subscription_by_user(db, user_id)

    if not subscription:
        return None # Hoặc trả về thông báo tùy bạn

    return subscription

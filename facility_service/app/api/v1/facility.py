from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import facility as service
from app.schemas import facility as schema

router = APIRouter(
    tags=["Quản lý Cơ sở vật chất (Facility)"]
)

# --- Định nghĩa phản hồi mẫu ---
ERROR_MAINTENANCE = {"description": "Lỗi ghi nhận bảo trì", "content": {"application/json": {"example": {"detail": "Thiết bị không tồn tại để bảo trì"}}}}

# --- Equipment (Thiết bị) ---
@router.get("/equipment",
            response_model=List[schema.EquipmentOut],
            summary="Danh sách thiết bị",
            description="Lấy toàn bộ danh sách thiết bị hiện có (Máy chạy bộ, Tạ đơn, Ghế đẩy ngực...).",
            operation_id="get_all_equipment")
def list_all_equipment(db: Session = Depends(get_db)):
    return service.get_all_equipment(db)

@router.post("/equipment",
             response_model=schema.EquipmentOut,
             status_code=status.HTTP_201_CREATED,
             summary="Nhập thiết bị mới",
             description="Thêm thiết bị mới vào kho tài sản của phòng tập.",
             operation_id="create_equipment")
def add_new_equipment(equipment: schema.EquipmentCreate, db: Session = Depends(get_db)):
    """
    **Thông tin đầu vào:**
    - `name`: Tên thiết bị (VD: Máy chạy bộ Matrix)
    - `type`: Loại thiết bị (Cardio, Strength, v.v.)
    - `status`: Trạng thái (Sẵn sàng, Đang hỏng)
    """
    return service.create_equipment(db, equipment)

# --- Maintenance (Bảo trì) ---
@router.post("/maintenance",
             response_model=schema.MaintenanceOut,
             status_code=status.HTTP_201_CREATED,
             responses={400: ERROR_MAINTENANCE},
             summary="Ghi nhận bảo trì",
             description="Lưu lại lịch sử sửa chữa, bảo dưỡng thiết bị để theo dõi khấu hao và an toàn.",
             operation_id="log_maintenance")
def record_maintenance(log: schema.MaintenanceCreate, db: Session = Depends(get_db)):
    """
    **Tình huống sử dụng:**
    - Khi máy hỏng cần sửa.
    - Bảo trì định kỳ hàng tháng.
    """
    return service.log_maintenance(db, log)

# --- Areas (Khu vực) ---
@router.get("/areas",
            summary="Danh sách khu vực tập luyện",
            description="Liệt kê các phân khu trong phòng tập (Khu Yoga, Khu tạ nặng, Khu thay đồ...).",
            operation_id="get_gym_areas")
def list_gym_areas(db: Session = Depends(get_db)):
    return service.get_areas(db)
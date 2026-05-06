from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import package as package_service
from app.schemas import package as package_schema

router = APIRouter(
    tags=["Quản lý Gói tập (Packages)"]
)

# --- Định nghĩa phản hồi mẫu ---
ERROR_NOT_FOUND = {"description": "Lỗi truy xuất", "content": {"application/json": {"example": {"detail": "Gói tập không tồn tại"}}}}

@router.get("/",
            response_model=List[package_schema.PackageOut],
            summary="Liệt kê tất cả gói tập",
            description="Lấy danh sách các gói dịch vụ đang kinh doanh tại phòng tập (ví dụ: Gói tháng, Gói năm).",
            operation_id="list_all_packages")
def read_all_packages(db: Session = Depends(get_db)):
    return package_service.get_packages(db)

@router.post("/",
             response_model=package_schema.PackageOut,
             status_code=status.HTTP_201_CREATED,
             summary="Tạo gói tập mới",
             description="Thiết lập một gói dịch vụ mới bao gồm tên, đơn giá và thời hạn sử dụng (số ngày).",
             operation_id="create_gym_package")
def create_new_package(package: package_schema.PackageCreate, db: Session = Depends(get_db)):
    """
    **Thông tin cần cung cấp:**
    - `name`: Tên gói (VD: Gói VIP 3 tháng)
    - `duration_days`: Thời hạn sử dụng tính bằng ngày (VD: 90)
    - `price`: Giá bán niêm yết
    """
    return package_service.create_package(db, package)

@router.get("/{id}",
            response_model=package_schema.PackageOut,
            responses={404: ERROR_NOT_FOUND},
            summary="Xem chi tiết gói tập",
            description="Truy xuất thông tin cấu hình của một gói tập cụ thể thông qua mã ID.",
            operation_id="get_package_details")
def read_package(id: int, db: Session = Depends(get_db)):
    db_package = package_service.get_package_by_id(db, id)
    if not db_package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã ID gói tập này không tồn tại trên hệ thống"
        )
    return db_package

@router.put("/{id}",
            response_model=package_schema.PackageOut,
            responses={404: ERROR_NOT_FOUND},
            summary="Cập nhật cấu hình gói",
            description="Chỉnh sửa thông tin gói tập hiện có. Lưu ý: Thay đổi giá sẽ không ảnh hưởng đến các hợp đồng đã ký trước đó.",
            operation_id="update_gym_package")
def update_package(id: int, package: package_schema.PackageUpdate, db: Session = Depends(get_db)):
    updated = package_service.update_package(db, id, package)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dữ liệu gói tập để thực hiện cập nhật"
        )
    return updated
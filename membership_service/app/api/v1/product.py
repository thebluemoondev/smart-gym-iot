"""
Product API Routes - Quản lý sản phẩm và gói tập

Các endpoints:
- GET /products - Danh sách sản phẩm (có lọc category)
- GET /products/featured - Sản phẩm nổi bật
- GET /products/{id} - Chi tiết sản phẩm
- POST /products - Tạo sản phẩm mới
- PUT /products/{id} - Cập nhật sản phẩm
- DELETE /products/{id} - Xóa sản phẩm (soft delete)
- GET /categories/list - Danh sách danh mục

Author: Smart Gym Team
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services import product as product_service
from app.schemas import product as product_schema

router = APIRouter(
    tags=["Quản lý Sản phẩm (Products)"]
)

ERROR_NOT_FOUND = {
    "description": "Không tìm thấy",
    "content": {"application/json": {"example": {"detail": "Sản phẩm không tồn tại"}}}
}


@router.get("/",
            response_model=List[product_schema.ProductOut],
            summary="Danh sách sản phẩm",
            description="Lấy danh sách tất cả sản phẩm đang hoạt động với phân trang. Có thể lọc theo category.")
def read_all_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách sản phẩm

    Query Parameters:
        - skip: Số bản ghi bỏ qua (mặc định: 0)
        - limit: Số bản ghi tối đa (mặc định: 100)
        - category: Lọc theo danh mục (supplement, equipment, accessory, wear, other)

    Returns:
        List[ProductOut]: Danh sách sản phẩm
    """
    return product_service.get_products(db, skip, limit, category)


@router.get("/featured",
            response_model=List[product_schema.ProductOut],
            summary="Sản phẩm nổi bật",
            description="Lấy danh sách sản phẩm được đánh dấu là nổi bật")
def read_featured_products(limit: int = 10, db: Session = Depends(get_db)):
    """
    Lấy danh sách sản phẩm nổi bật

    Query Parameters:
        - limit: Số lượng sản phẩm tối đa (mặc định: 10)

    Returns:
        List[ProductOut]: Danh sách sản phẩm nổi bật
    """
    return product_service.get_featured_products(db, limit)


@router.post("/",
             response_model=product_schema.ProductOut,
             status_code=status.HTTP_201_CREATED,
             summary="Tạo sản phẩm mới")
def create_new_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    """
    Tạo sản phẩm mới

    Request Body (ProductCreate):
        - name: Tên sản phẩm (bắt buộc)
        - description: Mô tả (optional)
        - price: Giá bán (bắt buộc)
        - original_price: Giá gốc (optional)
        - category: Danh mục (bắt buộc)
        - image_url: URL ảnh (optional)
        - stock: Số lượng tồn kho (default: 0)
        - is_featured: Đánh dấu nổi bật (default: false)

    Returns:
        ProductOut: Sản phẩm đã tạo
    """
    return product_service.create_product(db, product)


@router.get("/{id}",
            response_model=product_schema.ProductOut,
            responses={404: ERROR_NOT_FOUND},
            summary="Chi tiết sản phẩm")
def read_product(id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết một sản phẩm

    Path Parameters:
        - id: ID sản phẩm

    Returns:
        ProductOut: Thông tin chi tiết sản phẩm

    Raises:
        HTTPException 404: Không tìm thấy sản phẩm
    """
    product = product_service.get_product_by_id(db, id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại"
        )
    return product


@router.put("/{id}",
            response_model=product_schema.ProductOut,
            responses={404: ERROR_NOT_FOUND},
            summary="Cập nhật sản phẩm")
def update_product(id: int, product: product_schema.ProductUpdate, db: Session = Depends(get_db)):
    """
    Cập nhật thông tin sản phẩm

    Path Parameters:
        - id: ID sản phẩm

    Request Body (ProductUpdate):
        Các trường optional - chỉ gửi trường cần cập nhật

    Returns:
        ProductOut: Sản phẩm đã cập nhật

    Raises:
        HTTPException 404: Không tìm thấy sản phẩm
    """
    updated = product_service.update_product(db, id, product)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm"
        )
    return updated


@router.delete("/{id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Xóa sản phẩm")
def delete_product(id: int, db: Session = Depends(get_db)):
    """
    Xóa sản phẩm (soft delete - chỉ set is_active = False)

    Path Parameters:
        - id: ID sản phẩm

    Returns:
        204 No Content nếu xóa thành công

    Raises:
        HTTPException 404: Không tìm thấy sản phẩm
    """
    product = product_service.delete_product(db, id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm"
        )
    return None


@router.get("/categories/list",
            summary="Danh mục sản phẩm")
def get_categories():
    """
    Lấy danh sách tất cả danh mục sản phẩm

    Returns:
        dict: Danh sách categories với ID, tên và icon
    """
    return {
        "categories": [
            {"id": "supplement", "name": "Thực phẩm bổ sung", "icon": "💊"},
            {"id": "equipment", "name": "Thiết bị gym", "icon": "🏋️"},
            {"id": "accessory", "name": "Phụ kiện", "icon": "🧤"},
            {"id": "wear", "name": "Quần áo", "icon": "👕"},
            {"id": "other", "name": "Khác", "icon": "📦"}
        ]
    }
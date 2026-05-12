from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services import product as product_service
from app.schemas import product as product_schema

router = APIRouter(
    tags=["Quản lý Sản phẩm (Products)"]
)

ERROR_NOT_FOUND = {"description": "Không tìm thấy", "content": {"application/json": {"example": {"detail": "Sản phẩm không tồn tại"}}}}

@router.get("/",
            response_model=List[product_schema.ProductOut],
            summary="Danh sách sản phẩm",
            description="Lấy danh sách tất cả sản phẩm (thực phẩm bổ sung, thiết bị, phụ kiện...)")
def read_all_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return product_service.get_products(db, skip, limit, category)

@router.get("/featured",
            response_model=List[product_schema.ProductOut],
            summary="Sản phẩm nổi bật",
            description="Lấy danh sách sản phẩm nổi bật")
def read_featured_products(limit: int = 10, db: Session = Depends(get_db)):
    return product_service.get_featured_products(db, limit)

@router.post("/",
             response_model=product_schema.ProductOut,
             status_code=status.HTTP_201_CREATED,
             summary="Tạo sản phẩm mới")
def create_new_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, product)

@router.get("/{id}",
            response_model=product_schema.ProductOut,
            responses={404: ERROR_NOT_FOUND},
            summary="Chi tiết sản phẩm")
def read_product(id: int, db: Session = Depends(get_db)):
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
    return {
        "categories": [
            {"id": "supplement", "name": "Thực phẩm bổ sung", "icon": "💊"},
            {"id": "equipment", "name": "Thiết bị gym", "icon": "🏋️"},
            {"id": "accessory", "name": "Phụ kiện", "icon": "🧤"},
            {"id": "wear", "name": "Quần áo", "icon": "👕"},
            {"id": "other", "name": "Khác", "icon": "📦"}
        ]
    }
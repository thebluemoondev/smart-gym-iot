"""
Product Service - Xử lý sản phẩm và gói tập

Module cung cấp các hàm:
- CRUD cho sản phẩm (products)
- CRUD cho gói tập (packages)
- Lọc sản phẩm theo category
- Lấy sản phẩm nổi bật

Author: Smart Gym Team
"""

from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session, skip: int = 0, limit: int = 100, category: str = None):
    """
    Lấy danh sách sản phẩm với phân trang và lọc theo category

    Args:
        db: SQLAlchemy Session
        skip: Số bản ghi bỏ qua (cho phân trang)
        limit: Số bản ghi tối đa trả về
        category: Lọc theo danh mục (supplement, equipment, accessory, wear, other)

    Returns:
        List[Product]: Danh sách sản phẩm đang hoạt động
    """
    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category == category)
    return query.order_by(Product.id).offset(skip).limit(limit).all()


def get_product_by_id(db: Session, product_id: int):
    """
    Lấy thông tin chi tiết một sản phẩm

    Args:
        db: SQLAlchemy Session
        product_id: ID sản phẩm cần lấy

    Returns:
        Product | None: Đối tượng sản phẩm hoặc None nếu không tìm thấy
    """
    return db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()


def get_featured_products(db: Session, limit: int = 10):
    """
    Lấy danh sách sản phẩm nổi bật (được đánh dấu is_featured)

    Args:
        db: SQLAlchemy Session
        limit: Số lượng sản phẩm tối đa

    Returns:
        List[Product]: Danh sách sản phẩm nổi bật
    """
    return db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True
    ).order_by(Product.id).limit(limit).all()


def create_product(db: Session, product_data: ProductCreate):
    """
    Tạo sản phẩm mới

    Args:
        db: SQLAlchemy Session
        product_data: ProductCreate schema chứa thông tin sản phẩm

    Returns:
        Product: Đối tượng sản phẩm đã được tạo
    """
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, product_data: ProductUpdate):
    """
    Cập nhật thông tin sản phẩm

    Args:
        db: SQLAlchemy Session
        product_id: ID sản phẩm cần cập nhật
        product_data: ProductUpdate schema với các trường cần cập nhật

    Returns:
        Product | None: Đối tượng đã cập nhật hoặc None nếu không tìm thấy
    """
    product = get_product_by_id(db, product_id)
    if not product:
        return None

    # Cập nhật chỉ các trường được gửi lên (không gửi giữ nguyên)
    data = product_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    """
    Xóa sản phẩm (soft delete - chỉ set is_active = False)

    Args:
        db: SQLAlchemy Session
        product_id: ID sản phẩm cần xóa

    Returns:
        Product | None: Đối tượng đã xóa hoặc None nếu không tìm thấy
    """
    product = get_product_by_id(db, product_id)
    if product:
        product.is_active = False
        db.commit()
    return product
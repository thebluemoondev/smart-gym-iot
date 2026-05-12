"""
Product Model - Định nghĩa bảng sản phẩm và gói tập

Định nghĩa các model:
- Product: Sản phẩm bán lẻ (thực phẩm bổ sung, thiết bị, phụ kiện...)
- Package: Gói tập (Basic, VIP, Premium...)

Categories cho sản phẩm:
- supplement: Thực phẩm bổ sung
- equipment: Thiết bị gym
- accessory: Phụ kiện
- wear: Quần áo
- other: Khác

Author: Smart Gym Team
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.db.database import Base
from datetime import datetime
import enum


class ProductCategory(str, enum.Enum):
    """Danh mục sản phẩm"""
    SUPPLEMENT = "supplement"       # Thực phẩm bổ sung
    EQUIPMENT = "equipment"          # Thiết bị gym
    ACCESSORY = "accessory"         # Phụ kiện
    WEAR = "wear"                   # Quần áo
    OTHER = "other"


class Product(Base):
    """
    Model sản phẩm bán lẻ trong cửa hàng

    Attributes:
        id: Khóa chính tự tăng
        name: Tên sản phẩm
        description: Mô tả chi tiết
        price: Giá bán (VND)
        original_price: Giá gốc (nếu có giảm giá)
        category: Danh mục sản phẩm
        image_url: URL ảnh sản phẩm
        stock: Số lượng tồn kho
        is_active: Trạng thái hoạt động (soft delete)
        is_featured: Đánh dấu sản phẩm nổi bật
        created_at: Thời gian tạo
        updated_at: Thời gian cập nhật cuối
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)  # Giá gốc nếu có giảm giá
    category = Column(String(50), nullable=False)  # supplement, equipment, accessory, wear, other
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=0)             # Số lượng tồn kho
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)   # Sản phẩm nổi bật
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Gói tập (Membership Packages)
class Package(Base):
    """
    Model gói tập (membership package)

    Attributes:
        id: Khóa chính tự tăng
        name: Tên gói tập (Basic, VIP, Premium...)
        description: Mô tả gói tập
        price: Giá gói tập (VND)
        original_price: Giá gốc (nếu có giảm giá)
        duration_days: Số ngày sử dụng
        features: JSON string chứa danh sách tiện ích
        is_active: Trạng thái hoạt động
        is_popular: Đánh dấu gói phổ biến
        created_at: Thời gian tạo
        updated_at: Thời gian cập nhật cuối
    """
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    duration_days = Column(Integer, nullable=False)  # Số ngày
    features = Column(Text, nullable=True)           # JSON string chứa features
    is_active = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)     # Đánh dấu gói phổ biến
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
# app/models/product.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
import enum

class ProductCategory(str, enum.Enum):
    SUPPLEMENT = "supplement"       # Thực phẩm bổ sung
    EQUIPMENT = "equipment"          # Thiết bị gym
    ACCESSORY = "accessory"         # Phụ kiện
    WEAR = "wear"                   # Quần áo
    OTHER = "other"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)  # Giá gốc nếu có giảm giá
    category = Column(String(50), nullable=False)  # supplement, equipment, accessory, wear, other
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=0)              # Số lượng tồn kho
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)    # Sản phẩm nổi bật
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
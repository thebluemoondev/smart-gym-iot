from sqlalchemy import Column, Integer, String, Unicode
from sqlalchemy.orm import relationship
from app.db.database import Base

class GymPackage(Base):
    __tablename__ = 'gym_packages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(255), nullable=False)
    price = Column(Integer, nullable=False)
    package_desc = Column(Unicode(255))
    duration_days = Column(Integer, nullable=False)

    # Quan hệ với các lượt đăng ký
    subscriptions = relationship("Subscription", back_populates="package")
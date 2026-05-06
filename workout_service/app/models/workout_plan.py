from sqlalchemy import Column, Integer, String, Unicode, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class WorkoutPlan(Base):
    __tablename__ = 'workout_plans'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False) # Khóa logic sang User Service
    name = Column(Unicode(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ với bảng chi tiết bài tập
    details = relationship("WorkoutDetail", back_populates="plan", cascade="all, delete-orphan")
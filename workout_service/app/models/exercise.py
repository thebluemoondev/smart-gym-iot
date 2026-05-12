from sqlalchemy import Column, Integer, String, Unicode
from sqlalchemy.orm import relationship
from app.db.database import Base

class Exercise(Base):
    __tablename__ = 'exercises'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(255), nullable=False)
    description = Column(Unicode(500))
    muscle_group = Column(Unicode(100))
    difficulty = Column(Unicode(50))    # beginner, intermediate, advanced
    equipment_required = Column(Unicode(100))  # none, dumbbell, barbell, machine

    # Quan hệ
    plan_details = relationship("WorkoutDetail", back_populates="exercise")
    history = relationship("WorkoutHistory", back_populates="exercise")
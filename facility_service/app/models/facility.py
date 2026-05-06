from sqlalchemy import Column, Integer, String, Unicode, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Equipment(Base):
    __tablename__ = 'equipment'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(255), nullable=False)
    category = Column(Unicode(100))
    status = Column(Unicode(50), default='operational')
    purchase_date = Column(Date)
    last_maintenance = Column(Date)

    maintenance_logs = relationship("MaintenanceLog", back_populates="equipment", cascade="all, delete-orphan")

class MaintenanceLog(Base):
    __tablename__ = 'maintenance_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)
    maintenance_date = Column(DateTime, default=datetime.utcnow)
    description = Column(Unicode(500))
    cost = Column(Integer, default=0)
    performed_by = Column(Unicode(255))

    equipment = relationship("Equipment", back_populates="maintenance_logs")

class GymArea(Base):
    __tablename__ = 'gym_areas'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(255), nullable=False)
    capacity = Column(Integer)
    description = Column(Unicode(500))
from sqlalchemy.orm import Session
from app.models.facility import Equipment, MaintenanceLog, GymArea
from app.schemas import facility as schema
from datetime import date

# --- Equipment Logic ---
def get_all_equipment(db: Session):
    return db.query(Equipment).all()

def create_equipment(db: Session, equipment: schema.EquipmentCreate):
    db_equipment = Equipment(**equipment.model_dump())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

# --- Maintenance Logic ---
def log_maintenance(db: Session, log_data: schema.MaintenanceCreate):
    # 1. Tạo bản ghi bảo trì
    new_log = MaintenanceLog(**log_data.model_dump())
    db.add(new_log)

    # 2. Cập nhật ngày bảo trì gần nhất và trạng thái cho thiết bị
    db_equipment = db.query(Equipment).filter(Equipment.id == log_data.equipment_id).first()
    if db_equipment:
        db_equipment.last_maintenance = date.today()
        db_equipment.status = "operational" # Giả định bảo trì xong thì máy hoạt động tốt

    db.commit()
    db.refresh(new_log)
    return new_log

# --- Area Logic ---
def get_areas(db: Session):
    return db.query(GymArea).all()
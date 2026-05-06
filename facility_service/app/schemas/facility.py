from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

# --- Equipment ---
class EquipmentBase(BaseModel):
    name: str
    category: Optional[str] = None
    status: Optional[str] = "operational"
    purchase_date: Optional[date] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentOut(EquipmentBase):
    id: int
    last_maintenance: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)

# --- Maintenance ---
class MaintenanceCreate(BaseModel):
    equipment_id: int
    description: str
    cost: int = 0
    performed_by: str

class MaintenanceOut(MaintenanceCreate):
    id: int
    maintenance_date: datetime
    model_config = ConfigDict(from_attributes=True)
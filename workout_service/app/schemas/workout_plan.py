from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.workout_detail import WorkoutDetailCreate, WorkoutDetailOut

class WorkoutPlanBase(BaseModel):
    user_id: int
    name: str

class WorkoutPlanCreate(WorkoutPlanBase):
    # Cho phép tạo plan kèm luôn danh sách bài tập
    details: List[WorkoutDetailCreate] = []

class WorkoutPlanOut(WorkoutPlanBase):
    id: int
    created_at: datetime
    details: List[WorkoutDetailOut] = []
    model_config = ConfigDict(from_attributes=True)
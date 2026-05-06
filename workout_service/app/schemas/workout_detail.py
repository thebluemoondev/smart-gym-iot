from pydantic import BaseModel, ConfigDict
from typing import Optional

class WorkoutDetailBase(BaseModel):
    exercise_id: int
    sets: int
    reps: int
    weight: Optional[float] = None

class WorkoutDetailCreate(WorkoutDetailBase):
    plan_id: Optional[int] = None # Sẽ được gán tự động khi tạo plan

class WorkoutDetailOut(WorkoutDetailBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class WorkoutHistoryBase(BaseModel):
    user_id: int
    exercise_id: int
    sets: int
    reps: int
    weight: Optional[float] = None

class WorkoutHistoryCreate(WorkoutHistoryBase):
    pass

class WorkoutHistoryOut(WorkoutHistoryBase):
    id: int
    workout_date: datetime
    model_config = ConfigDict(from_attributes=True)
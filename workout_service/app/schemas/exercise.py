from pydantic import BaseModel, ConfigDict
from typing import Optional

class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    muscle_group: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseOut(ExerciseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
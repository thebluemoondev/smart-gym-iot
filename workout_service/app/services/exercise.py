from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate

def get_exercises(db: Session):
    return db.query(Exercise).all()

def create_exercise(db: Session, exercise: ExerciseCreate):
    db_exercise = Exercise(**exercise.model_dump())
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise
from sqlalchemy.orm import Session
from app.models.workout_history import WorkoutHistory
from app.schemas.workout_history import WorkoutHistoryCreate

def log_workout(db: Session, history_data: WorkoutHistoryCreate):
    db_history = WorkoutHistory(**history_data.model_dump())
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_user_history(db: Session, user_id: int):
    return db.query(WorkoutHistory).filter(WorkoutHistory.user_id == user_id).all()
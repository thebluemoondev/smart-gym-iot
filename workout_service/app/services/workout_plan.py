from sqlalchemy.orm import Session
from app.models.workout_plan import WorkoutPlan
from app.models.workout_detail import WorkoutDetail
from app.schemas.workout_plan import WorkoutPlanCreate

def create_workout_plan(db: Session, plan_data: WorkoutPlanCreate):
    # 1. Tạo bản ghi Plan trước
    db_plan = WorkoutPlan(
        user_id=plan_data.user_id,
        name=plan_data.name
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    # 2. Tạo các bản ghi Detail dựa trên plan_id vừa tạo
    for detail in plan_data.details:
        db_detail = WorkoutDetail(
            plan_id=db_plan.id,
            exercise_id=detail.exercise_id,
            sets=detail.sets,
            reps=detail.reps,
            weight=detail.weight
        )
        db.add(db_detail)

    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_user_plans(db: Session, user_id: int):
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).all()
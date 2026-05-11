from fastapi import HTTPException
from app.models.exercise import Exercise # Cần import để check bài tập
from app.models.workout_plan import WorkoutPlan
from app.models.workout_detail import WorkoutDetail
from app.schemas.workout_plan import WorkoutPlanCreate
from sqlalchemy.orm import Session, joinedload

def create_workout_plan(db: Session, plan_data: WorkoutPlanCreate):
    ex_ids = [d.exercise_id for d in plan_data.details]
    count = db.query(Exercise).filter(Exercise.id.in_(ex_ids)).count()
    if count != len(set(ex_ids)):
        raise HTTPException(status_code=400, detail="Một số bài tập không tồn tại trong thư viện!")

    try:
        # Bước 2: Tạo Plan (Chưa commit)
        db_plan = WorkoutPlan(user_id=plan_data.user_id, name=plan_data.name)
        db.add(db_plan)
        db.flush() # Lấy ID để dùng cho Detail

        # Bước 3: Tạo Detail
        for detail in plan_data.details:
            db_detail = WorkoutDetail(
                plan_id=db_plan.id,
                exercise_id=detail.exercise_id,
                sets=detail.sets,
                reps=detail.reps,
                weight=detail.weight
            )
            db.add(db_detail)

        db.commit() # Lưu tất cả hoặc không gì cả
        db.refresh(db_plan)
        return db_plan
    except Exception as e:
        db.rollback()
        raise e

from sqlalchemy.orm import Session
from app.models.workout_plan import WorkoutPlan

def get_user_plans(db: Session, user_id: int):
    return db.query(WorkoutPlan)\
        .options(joinedload(WorkoutPlan.details))\
        .filter(WorkoutPlan.user_id == user_id)\
        .all()
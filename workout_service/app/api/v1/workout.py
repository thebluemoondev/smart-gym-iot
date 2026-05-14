from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.services import exercise as ex_service
from app.services import workout_plan as plan_service
from app.services import workout_history as history_service
from app.schemas import exercise as ex_schema
from app.schemas import workout_plan as plan_schema
from app.schemas import workout_history as history_schema
from app.external_services import verify_user_and_membership, send_task_notification

router = APIRouter(
    tags=["Quản lý Tập luyện (Workout)"]
)

# --- Định nghĩa phản hồi mẫu cho Swagger ---
ERROR_FORBIDDEN = {"description": "Lỗi quyền truy cập", "content": {"application/json": {"example": {"detail": "Hội viên không có gói tập kích hoạt"}}}}

# --- Exercises (Thư viện bài tập) ---
@router.get("/exercises",
            response_model=List[ex_schema.ExerciseOut],
            summary="Danh sách bài tập",
            description="Lấy toàn bộ danh sách các bài tập có sẵn trong hệ thống (VD: Squat, Bench Press...).",
            operation_id="list_exercises")
def list_exercises(db: Session = Depends(get_db)):
    return ex_service.get_exercises(db)

@router.post("/exercises",
             response_model=ex_schema.ExerciseOut,
             status_code=status.HTTP_201_CREATED,
             summary="Thêm bài tập mới",
             description="Bổ sung bài tập mới vào thư viện chung.",
             operation_id="add_exercise")
def add_exercise(exercise: ex_schema.ExerciseCreate, db: Session = Depends(get_db)):
    return ex_service.create_exercise(db, exercise)

# --- Plans (Lập kế hoạch tập) ---
@router.post("/plans",
             response_model=plan_schema.WorkoutPlanOut,
             status_code=status.HTTP_201_CREATED,
             responses={403: ERROR_FORBIDDEN},
             summary="Tạo kế hoạch tập luyện",
             description="Thiết lập lộ trình tập luyện cho hội viên. Chỉ thực hiện được nếu hội viên có gói tập còn hạn.",
             operation_id="create_workout_plan")
async def create_plan(plan: plan_schema.WorkoutPlanCreate, db: Session = Depends(get_db)):
    """
    **Logic Liên thông:**
    - Gọi sang Membership Service để kiểm tra trạng thái gói tập.
    - Nếu `is_valid` là False, trả về lỗi 403 Forbidden.
    """
    is_valid, message = await verify_user_and_membership(plan.user_id)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)

    created = plan_service.create_workout_plan(db, plan)
    await send_task_notification(
        plan.user_id,
        subject="Kế hoạch tập đã được tạo",
        message=(
            f"Kế hoạch '{plan.name}' của bạn đã được lưu thành công.\n"
            f"Số bài tập: {len(plan.details)}"
        ),
        task_type="workout_plan",
        action_label="Xem kế hoạch",
        action_path="/customer/workout-plan/full",
    )
    return created

@router.get("/plans/user/{user_id}",
            response_model=List[plan_schema.WorkoutPlanOut],
            summary="Xem kế hoạch theo hội viên",
            description="Truy xuất tất cả kế hoạch tập luyện mà một hội viên đã thiết lập.",
            operation_id="get_plans_by_user")
def get_user_plans(user_id: int, db: Session = Depends(get_db)):
    return plan_service.get_user_plans(db, user_id)

# --- History (Nhật ký tập luyện) ---
@router.post("/history",
             response_model=history_schema.WorkoutHistoryOut,
             status_code=status.HTTP_201_CREATED,
             responses={403: ERROR_FORBIDDEN},
             summary="Ghi nhận kết quả tập luyện",
             description="Lưu lại kết quả sau mỗi buổi tập (Số hiệp, số lần, mức tạ). Yêu cầu gói tập phải còn hiệu lực.",
             operation_id="log_workout_result")
async def log_workout(history: history_schema.WorkoutHistoryCreate, db: Session = Depends(get_db)):
    """
    **Lưu ý:**
    - Hệ thống sẽ kiểm tra quyền (Membership) trước khi cho phép ghi nhật ký.
    """
    is_valid, message = await verify_user_and_membership(history.user_id)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)

    created = history_service.log_workout(db, history)
    await send_task_notification(
        history.user_id,
        subject="Đã ghi nhận buổi tập",
        message=(
            f"Buổi tập của bạn đã được lưu thành công.\n"
            f"Bài tập ID: {history.exercise_id}\n"
            f"Set/Reps: {history.sets}/{history.reps}"
        ),
        task_type="workout_history",
        action_label="Xem lịch sử",
        action_path="/customer/workout-history",
    )
    return created

@router.get("/history/user/{user_id}",
            response_model=List[history_schema.WorkoutHistoryOut],
            summary="Lịch sử tập luyện của hội viên",
            description="Xem lại toàn bộ quá trình tập luyện của một hội viên từ trước đến nay.",
            operation_id="get_workout_history_by_user")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    return history_service.get_user_history(db, user_id)

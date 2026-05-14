import os
import smtplib
import ssl
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from html import escape as html_escape
from email.message import EmailMessage
from email.utils import formataddr
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:6001/api/v1/user").rstrip("/")
MEMBERSHIP_SERVICE_URL = os.getenv("MEMBERSHIP_SERVICE_URL", "http://membership_service:6002/api/v1").rstrip("/")
WORKOUT_SERVICE_URL = os.getenv("WORKOUT_SERVICE_URL", "http://workout_service:6003/api/v1/workout").rstrip("/")
PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://payment_service:6006/api/v1/payment").rstrip("/")
CLIENT_BASE_URL = os.getenv("CLIENT_BASE_URL", "http://localhost").rstrip("/")


class EmailRequest(BaseModel):
    to: str = Field(min_length=5, max_length=255)
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=4000)


class TaskNotificationRequest(BaseModel):
    user_id: int
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=4000)
    task_type: str = Field(default="task", max_length=80)
    action_label: str | None = Field(default=None, max_length=120)
    action_path: str | None = Field(default=None, max_length=255)


app = FastAPI(
    title="GYM Intelligence Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0",
    root_path="/intelligence",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
        "https://thanhchinh.io.vn",
        "http://thanhchinh.io.vn",
        "https://www.thanhchinh.io.vn",
        "http://www.thanhchinh.io.vn",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


def parse_date(value: Any) -> date | None:
    if not value:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    text = str(value).strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        try:
            return date.fromisoformat(text[:10])
        except ValueError:
            return None


def today_utc() -> date:
    return datetime.now(timezone.utc).date()


def as_list(value: Any) -> list[dict[str, Any]]:
    return value if isinstance(value, list) else []


def package_lookup(packages: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    return {int(pkg.get("id")): pkg for pkg in packages if pkg.get("id") is not None}


def exercise_lookup(exercises: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    return {int(ex.get("id")): ex for ex in exercises if ex.get("id") is not None}


def find_active_subscription(subscriptions: list[dict[str, Any]]) -> dict[str, Any] | None:
    active = [
        sub for sub in subscriptions
        if str(sub.get("status", "")).lower() == "active"
    ]
    if not active:
        return None
    active.sort(key=lambda item: int(item.get("id") or 0), reverse=True)
    return active[0]


def enrich_plan(plan: dict[str, Any] | None, exercises: dict[int, dict[str, Any]]) -> dict[str, Any] | None:
    if not plan:
        return None
    details = []
    for detail in as_list(plan.get("details")):
        exercise = exercises.get(int(detail.get("exercise_id") or 0), {})
        details.append({
            **detail,
            "exercise_name": exercise.get("name") or f"Exercise #{detail.get('exercise_id')}",
            "muscle_group": exercise.get("muscle_group") or "general",
            "description": exercise.get("description") or "",
        })
    return {**plan, "details": details}


async def fetch_json(client: httpx.AsyncClient, url: str, fallback: Any = None) -> Any:
    try:
        response = await client.get(url)
        if response.status_code == 404:
            return fallback
        response.raise_for_status()
        return response.json()
    except Exception:
        return fallback


def build_email_subject(subject: str) -> str:
    clean_subject = subject.strip()
    if clean_subject.lower().startswith("[thanhchingym]"):
        return clean_subject
    return f"[ThanhChinhGym] {clean_subject}"


def build_email_html(title: str, message: str) -> str:
    body = html_escape(message).replace("\n", "<br>")
    return f"""
    <div style="margin:0;padding:0;background:#f7f8fb;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:linear-gradient(135deg,#ea1d5d 0%,#ff7a18 100%);color:#fff;border-radius:18px 18px 0 0;padding:22px 28px;font-size:22px;font-weight:700;">
          ThanhChinhGym
        </div>
        <div style="background:#ffffff;border:1px solid #eef0f4;border-top:none;border-radius:0 0 18px 18px;padding:28px;">
          <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:16px;">{html_escape(title)}</div>
          <div style="font-size:15px;line-height:1.7;color:#374151;">{body}</div>
        </div>
      </div>
    </div>
    """


def build_notification_message(message: str, action_label: str | None = None, action_path: str | None = None) -> str:
    parts = [message.strip()]
    if action_label and action_path:
        parts.append(f"{action_label}: {action_path}")
    elif action_label:
        parts.append(action_label)
    elif action_path:
        parts.append(action_path)
    return "\n".join(part for part in parts if part)


def build_task_email_template(task: TaskNotificationRequest, user: dict[str, Any]) -> tuple[str, str, str]:
    task_type = (task.task_type or "task").lower()

    templates = {
        "membership": {
            "subject": "Đăng ký gói tập thành công",
            "title": "Đăng ký gói tập",
            "body": build_notification_message(task.message, task.action_label, task.action_path),
        },
        "payment": {
            "subject": "Thanh toán đã được xác nhận",
            "title": "Xác nhận thanh toán",
            "body": build_notification_message(task.message, task.action_label, task.action_path),
        },
        "workout": {
            "subject": "Kế hoạch luyện tập đã sẵn sàng",
            "title": "Kế hoạch luyện tập",
            "body": build_notification_message(task.message, task.action_label, task.action_path),
        },
        "profile": {
            "subject": "Hồ sơ cá nhân đã được cập nhật",
            "title": "Cập nhật hồ sơ",
            "body": build_notification_message(task.message, task.action_label, task.action_path),
        },
    }

    template = templates.get(task_type, {
        "subject": "Thông báo từ hệ thống",
        "title": "Thông báo từ hệ thống",
        "body": build_notification_message(task.message, task.action_label, task.action_path),
    })

    return build_email_subject(template["subject"]), template["title"], template["body"]


def build_email_delivery(payload: EmailRequest) -> dict[str, Any]:
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587") or 587)
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from = os.getenv("SMTP_FROM", "").strip() or smtp_username
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "").strip() or "ThanhChinhGym"

    if not smtp_host or not smtp_username or not smtp_password or not smtp_from:
        return {
            "sent": False,
            "mode": "preview",
            "message": "SMTP chưa cấu hình. Email chưa được gửi, nhưng payload đã hợp lệ.",
            "email": payload.model_dump(),
    }

    message = EmailMessage()
    message["From"] = formataddr((smtp_from_name, smtp_from))
    message["To"] = payload.to
    message["Subject"] = build_email_subject(payload.subject)
    message.set_content(payload.message)
    message.add_alternative(build_email_html(payload.subject, payload.message), subtype="html")

    if smtp_port == 465:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=10) as server:
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(smtp_username, smtp_password)
            server.send_message(message)

    return {"sent": True, "mode": "smtp", "to": payload.to}


async def send_task_notification(task: TaskNotificationRequest) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=6.0) as client:
        user = await fetch_json(client, f"{USER_SERVICE_URL}/{task.user_id}", {}) or {}
    email = (user or {}).get("email")
    if not email:
        return {
            "sent": False,
            "skipped": True,
            "reason": "User chưa có email",
            "user_id": task.user_id,
        }

    subject, title, body = build_task_email_template(task, user)
    email_payload = EmailRequest(
        to=email,
        subject=subject,
        message=body,
    )
    result = build_email_delivery(email_payload)
    result.update({
        "user_id": task.user_id,
        "email": email,
        "task_type": task.task_type,
        "action_label": task.action_label,
        "action_path": task.action_path,
        "template_title": title,
    })
    return result


def build_user_notifications(
    user: dict[str, Any],
    active_sub: dict[str, Any] | None,
    active_package: dict[str, Any] | None,
    plans: list[dict[str, Any]],
    history: list[dict[str, Any]],
    days_left: int | None,
) -> list[dict[str, Any]]:
    notifications: list[dict[str, Any]] = []
    phone = user.get("phone") or user.get("phonenumber")

    if not phone:
        notifications.append({
            "type": "profile",
            "severity": "info",
            "title": "Số điện thoại chưa có",
            "message": "Hồ sơ hiện chưa có số điện thoại.",
            "action_label": "Cập nhật hồ sơ",
            "action_path": "/customer/profile",
        })

    if not user.get("email"):
        notifications.append({
            "type": "profile",
            "severity": "info",
            "title": "Email chưa có",
            "message": "Hồ sơ hiện chưa có email.",
            "action_label": "Thêm email",
            "action_path": "/customer/profile",
        })

    if not active_sub:
        notifications.append({
            "type": "membership",
            "severity": "info",
            "title": "Chưa có gói active",
            "message": "Hồ sơ hiện chưa có gói active.",
            "action_label": "Chọn gói tập",
            "action_path": "/packages",
        })
    elif days_left is not None and days_left <= 7:
        notifications.append({
            "type": "membership",
            "severity": "warning",
            "title": "Gói tập sắp hết hạn",
            "message": f"Gói {active_package.get('name', 'hiện tại') if active_package else 'hiện tại'} còn {days_left} ngày hiệu lực.",
            "action_label": "Gia hạn gói",
            "action_path": "/customer/subscription",
        })

    if not plans:
        notifications.append({
            "type": "workout",
            "severity": "info",
            "title": "Chưa có kế hoạch tập",
            "message": "Hồ sơ hiện chưa có kế hoạch tập.",
            "action_label": "Tạo kế hoạch",
            "action_path": "/customer/workout-plan",
        })

    if not history:
        notifications.append({
            "type": "workout",
            "severity": "info",
            "title": "Chưa có lịch sử tập",
            "message": "Hồ sơ hiện chưa có lịch sử tập.",
            "action_label": "Ghi lịch sử",
            "action_path": "/customer/workout-history",
        })

    return notifications[:6]


def build_smart_score(
    user: dict[str, Any],
    active_sub: dict[str, Any] | None,
    plans: list[dict[str, Any]],
    history: list[dict[str, Any]],
    days_left: int | None,
) -> int:
    score = 30
    if user.get("name"):
        score += 10
    if user.get("phone") or user.get("phonenumber"):
        score += 10
    if user.get("email"):
        score += 5
    if active_sub:
        score += 25
    if plans:
        score += 15
    if history:
        score += 10
    if days_left is not None and days_left <= 3:
        score -= 10
    return max(0, min(100, score))


def build_next_workout(
    latest_plan: dict[str, Any] | None,
    active_package: dict[str, Any] | None,
    exercises: dict[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    if latest_plan and latest_plan.get("details"):
        return latest_plan["details"][:5]

    all_exercises = list(exercises.values())
    name = str(active_package.get("name", "") if active_package else "").lower()
    keywords = ["plank", "squat", "core"]
    if "vip" in name:
        keywords = ["press", "row", "lunge", "curl", "plank"]
    if "premium" in name:
        keywords = ["deadlift", "bench", "row", "press", "pulldown"]

    picked = []
    for exercise in all_exercises:
        text = f"{exercise.get('name', '')} {exercise.get('description', '')} {exercise.get('muscle_group', '')}".lower()
        if any(keyword in text for keyword in keywords):
            picked.append({
                "exercise_id": exercise.get("id"),
                "exercise_name": exercise.get("name"),
                "muscle_group": exercise.get("muscle_group") or "general",
                "sets": 3,
                "reps": 10,
                "weight": None,
                "description": exercise.get("description") or "",
            })
    return picked[:5] or [{
        "exercise_id": exercise.get("id"),
        "exercise_name": exercise.get("name"),
        "muscle_group": exercise.get("muscle_group") or "general",
        "sets": 3,
        "reps": 10,
        "weight": None,
        "description": exercise.get("description") or "",
    } for exercise in all_exercises[:5]]


@app.get("/")
def root():
    return {"message": "Intelligence Service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/intelligence/health")
def api_health():
    return {"status": "ok"}


@app.get("/api/v1/intelligence/user/{user_id}/summary")
async def user_summary(user_id: int):
    async with httpx.AsyncClient(timeout=6.0) as client:
        data = await asyncio_gather_dict({
            "user": fetch_json(client, f"{USER_SERVICE_URL}/{user_id}", {}),
            "subscriptions": fetch_json(client, f"{MEMBERSHIP_SERVICE_URL}/subscriptions/user/{user_id}", []),
            "packages": fetch_json(client, f"{MEMBERSHIP_SERVICE_URL}/packages/", []),
            "plans": fetch_json(client, f"{WORKOUT_SERVICE_URL}/plans/user/{user_id}", []),
            "exercises": fetch_json(client, f"{WORKOUT_SERVICE_URL}/exercises", []),
            "history": fetch_json(client, f"{WORKOUT_SERVICE_URL}/history/user/{user_id}", []),
            "payments": fetch_json(client, f"{PAYMENT_SERVICE_URL}/user/{user_id}", []),
        })
    user = data.get("user") or {}
    subscriptions = data.get("subscriptions") or []
    packages = data.get("packages") or []
    plans = data.get("plans") or []
    exercises = data.get("exercises") or []
    history = data.get("history") or []
    payments = data.get("payments") or []

    package_map = package_lookup(as_list(packages))
    exercise_map = exercise_lookup(as_list(exercises))
    subscriptions_list = as_list(subscriptions)
    plans_list = sorted(as_list(plans), key=lambda item: int(item.get("id") or 0), reverse=True)
    history_list = sorted(as_list(history), key=lambda item: int(item.get("id") or 0), reverse=True)

    active_sub = find_active_subscription(subscriptions_list)
    active_package = package_map.get(int(active_sub.get("package_id") or 0)) if active_sub else None
    end_date = parse_date(active_sub.get("end_date")) if active_sub else None
    start_date = parse_date(active_sub.get("start_date")) if active_sub else None
    today = today_utc()
    days_left = max(0, (end_date - today).days) if end_date else None
    used_days = max(0, (today - start_date).days) if start_date else None
    duration_days = int(active_package.get("duration_days") or 0) if active_package else 0
    package_progress = min(100, max(0, round(((duration_days - (days_left or duration_days)) / duration_days) * 100))) if duration_days else 0
    latest_plan = enrich_plan(plans_list[0], exercise_map) if plans_list else None
    next_workout = build_next_workout(latest_plan, active_package, exercise_map)
    notifications = build_user_notifications(user or {}, active_sub, active_package, plans_list, history_list, days_left)
    smart_score = build_smart_score(user or {}, active_sub, plans_list, history_list, days_left)

    return {
        "user_id": user_id,
        "smart_score": smart_score,
        "smart_level": "Tốt" if smart_score >= 75 else "Cần bổ sung" if smart_score >= 50 else "Thiếu dữ liệu",
        "profile": {
            "name": (user or {}).get("name") or (user or {}).get("username"),
            "username": (user or {}).get("username"),
            "phone": (user or {}).get("phone") or (user or {}).get("phonenumber"),
            "email": (user or {}).get("email"),
            "date_of_birth": (user or {}).get("date_of_birth"),
            "gender": (user or {}).get("gender"),
            "role": (user or {}).get("role") or "user",
        },
        "membership": {
            "active": bool(active_sub),
            "subscription": active_sub,
            "package": active_package,
            "days_left": days_left,
            "used_days": used_days,
            "progress": package_progress,
        },
        "workout": {
            "plan_count": len(plans_list),
            "history_count": len(history_list),
            "latest_plan": latest_plan,
            "next_workout": next_workout,
        },
        "payments": {
            "count": len(as_list(payments)),
            "latest": as_list(payments)[:3],
        },
        "notifications": notifications,
        "recommendations": [
            {
                "title": item["title"],
                "message": item["message"],
                "action_label": item["action_label"],
                "action_path": item["action_path"],
            }
            for item in notifications
        ] or [{
            "title": "Duy trì nhịp tập",
            "message": "Hồ sơ, gói tập và kế hoạch đã có dữ liệu để AI Coach tư vấn.",
            "action_label": "Hỏi AI Coach",
            "action_path": "/customer/chatbot",
        }],
    }


@app.get("/api/v1/intelligence/notifications/user/{user_id}")
async def user_notifications(user_id: int):
    summary = await user_summary(user_id)
    return summary["notifications"]


@app.get("/api/v1/intelligence/admin/overview")
async def admin_overview():
    async with httpx.AsyncClient(timeout=8.0) as client:
        data = await asyncio_gather_dict({
            "users": fetch_json(client, f"{USER_SERVICE_URL}/", []),
            "subscriptions": fetch_json(client, f"{MEMBERSHIP_SERVICE_URL}/subscriptions/", []),
            "packages": fetch_json(client, f"{MEMBERSHIP_SERVICE_URL}/packages/", []),
        })
        users = data.get("users") or []
        subscriptions = data.get("subscriptions") or []
        packages = data.get("packages") or []
        member_users = [user for user in as_list(users) if str(user.get("role", "user")).lower() != "admin"]
        member_ids = {int(user.get("id") or 0) for user in member_users if user.get("id") is not None}
        plans_by_user = await asyncio_gather_dict({
            str(user.get("id")): fetch_json(client, f"{WORKOUT_SERVICE_URL}/plans/user/{user.get('id')}", [])
            for user in member_users[:80]
            if user.get("id") is not None
        })

    today = today_utc()
    package_map = package_lookup(as_list(packages))
    subscriptions_list = as_list(subscriptions)
    active_by_user: dict[int, dict[str, Any]] = {}
    for sub in subscriptions_list:
        if str(sub.get("status", "")).lower() != "active":
            continue
        user_id = int(sub.get("user_id") or 0)
        if user_id not in member_ids:
            continue
        if user_id and int(sub.get("id") or 0) > int(active_by_user.get(user_id, {}).get("id") or 0):
            active_by_user[user_id] = sub

    expiring_soon = []
    for user_id, sub in active_by_user.items():
        end_date = parse_date(sub.get("end_date"))
        days_left = (end_date - today).days if end_date else None
        if days_left is not None and days_left <= 7:
            expiring_soon.append({"user_id": user_id, "subscription": sub, "days_left": max(0, days_left)})

    no_active_users = [user for user in member_users if int(user.get("id") or 0) not in active_by_user]
    no_plan_users = [
        user for user in member_users
        if not as_list(plans_by_user.get(str(user.get("id")), []))
    ]

    sales_counter = Counter(int(sub.get("package_id") or 0) for sub in subscriptions_list if sub.get("package_id") is not None)
    active_counter = Counter(int(sub.get("package_id") or 0) for sub in active_by_user.values() if sub.get("package_id") is not None)
    estimated_active_revenue = sum(
        int(package_map.get(int(sub.get("package_id") or 0), {}).get("price") or 0)
        for sub in active_by_user.values()
    )

    risk_users = []
    seen_risk_users = set()
    user_map = {int(user.get("id")): user for user in member_users if user.get("id") is not None}
    for item in expiring_soon[:8]:
        user = user_map.get(item["user_id"], {})
        seen_risk_users.add(item["user_id"])
        risk_users.append({
            "user_id": item["user_id"],
            "name": user.get("name") or user.get("username") or f"User #{item['user_id']}",
            "reason": f"Gói còn {item['days_left']} ngày",
            "action": "Gia hạn gói",
        })
    for user in no_active_users[:8]:
        user_id = int(user.get("id") or 0)
        if user_id in seen_risk_users:
            continue
        seen_risk_users.add(user_id)
        risk_users.append({
            "user_id": user.get("id"),
            "name": user.get("name") or user.get("username") or f"User #{user.get('id')}",
            "reason": "Chưa có gói active",
            "action": "Tư vấn gói tập",
        })
    for user in no_plan_users[:8]:
        if len(risk_users) >= 12:
            break
        user_id = int(user.get("id") or 0)
        if user_id in seen_risk_users:
            continue
        seen_risk_users.add(user_id)
        risk_users.append({
            "user_id": user.get("id"),
            "name": user.get("name") or user.get("username") or f"User #{user.get('id')}",
            "reason": "Chưa có kế hoạch tập",
            "action": "Tạo kế hoạch",
        })

    package_sales = []
    for package_id, count in sales_counter.most_common():
        package_sales.append({
            "package_id": package_id,
            "name": package_map.get(package_id, {}).get("name") or f"Gói #{package_id}",
            "total_sales": count,
            "active_sales": active_counter.get(package_id, 0),
            "price": package_map.get(package_id, {}).get("price") or 0,
        })

    return {
        "metrics": {
            "users": len(member_users),
            "active_members": len(active_by_user),
            "inactive_members": len(no_active_users),
            "expiring_soon": len(expiring_soon),
            "users_without_plan": len(no_plan_users),
            "estimated_active_revenue": estimated_active_revenue,
        },
        "insights": [
            {
                "severity": "warning" if expiring_soon else "success",
                "title": "Gói sắp hết hạn",
                "message": f"{len(expiring_soon)} hội viên có gói hết hạn trong 7 ngày tới.",
            },
            {
                "severity": "critical" if no_active_users else "success",
                "title": "Hội viên chưa có gói",
                "message": f"{len(no_active_users)} hội viên chưa có gói active.",
            },
            {
                "severity": "warning" if no_plan_users else "success",
                "title": "Thiếu kế hoạch tập",
                "message": f"{len(no_plan_users)} hội viên chưa có kế hoạch tập.",
            },
        ],
        "risk_users": risk_users[:12],
        "package_sales": package_sales,
        "actions": [
            {"label": "Xem hội viên", "path": "/admin/users"},
            {"label": "Xem đăng ký", "path": "/admin/subscriptions"},
            {"label": "Tạo bài tập", "path": "/admin/exercises"},
            {"label": "AI Chatbot", "path": "/admin/chatbot"},
        ],
    }


@app.post("/api/v1/intelligence/notifications/email")
def send_email(payload: EmailRequest):
    return build_email_delivery(payload)


@app.post("/api/v1/intelligence/notifications/task")
async def send_task_email(payload: TaskNotificationRequest):
    return await send_task_notification(payload)


async def asyncio_gather_dict(tasks: dict[str, Any]) -> dict[str, Any]:
    import asyncio

    keys = list(tasks.keys())
    values = await asyncio.gather(*tasks.values())
    return dict(zip(keys, values))

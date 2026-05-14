import httpx
from fastapi import HTTPException

USER_SERVICE_URL = "http://user_service:6001"
INTELLIGENCE_SERVICE_URL = "http://intelligence_service:6007"


async def get_user_by_id(user_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{USER_SERVICE_URL}/api/v1/user/{user_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="User Service không phản hồi")


async def send_task_notification(user_id: int, subject: str, message: str, task_type: str = "membership", action_label: str | None = None, action_path: str | None = None):
    payload = {
        "user_id": user_id,
        "subject": subject,
        "message": message,
        "task_type": task_type,
        "action_label": action_label,
        "action_path": action_path,
    }
    async with httpx.AsyncClient(timeout=6.0) as client:
        try:
            response = await client.post(f"{INTELLIGENCE_SERVICE_URL}/api/v1/intelligence/notifications/task", json=payload)
            if response.status_code >= 400:
                return None
            return response.json()
        except httpx.RequestError:
            return None

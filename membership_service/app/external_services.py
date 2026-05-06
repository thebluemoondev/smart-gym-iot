import httpx
from fastapi import HTTPException

USER_SERVICE_URL = "http://user_service:6001"

async def get_user_by_id(user_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{USER_SERVICE_URL}/api/v1/user/{user_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="User Service không phản hồi")
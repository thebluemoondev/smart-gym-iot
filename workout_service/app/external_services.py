import httpx
from fastapi import HTTPException

USER_SERVICE_URL = "http://user_service:6001"
MEMBERSHIP_SERVICE_URL = "http://membership_service:6002"

async def verify_user_and_membership(user_id: int):
    async with httpx.AsyncClient() as client:
        try:
            # 1. Kiểm tra User
            user_resp = await client.get(f"{USER_SERVICE_URL}/api/v1/user/{user_id}")
            if user_resp.status_code == 404:
                return False, "User không tồn tại"
            if user_resp.status_code != 200:
                return False, "Lỗi khi kết nối User Service"

            user_name = user_resp.json().get("full_name")

            # 2. Kiểm tra Gói tập
            mem_resp = await client.get(f"{MEMBERSHIP_SERVICE_URL}/api/v1/subscriptions/user/{user_id}")

            # Nếu trả về 404, nghĩa là User tồn tại nhưng chưa từng mua gói nào
            if mem_resp.status_code == 404:
                return False, f"Hội viên {user_name} chưa mua gói tập nào"

            if mem_resp.status_code != 200:
                return False, "Không thể kiểm tra gói tập (Lỗi hệ thống Membership)"

            # 3. Kiểm tra trạng thái Active
            subscriptions = mem_resp.json()
            # Nếu subscriptions trả về mảng rỗng []
            if not subscriptions:
                return False, f"Hội viên {user_name} chưa có lịch sử đăng ký"

            has_active = any(sub.get("status") == "active" for sub in subscriptions)

            if not has_active:
                return False, f"Hội viên {user_name} không có gói tập nào đang kích hoạt"

            return True, user_name

        except httpx.RequestError as exc:
            # In ra log để bạn dễ debug lỗi kết nối
            print(f"Connection error: {exc}")
            raise HTTPException(status_code=503, detail="Dịch vụ nội bộ không phản hồi")
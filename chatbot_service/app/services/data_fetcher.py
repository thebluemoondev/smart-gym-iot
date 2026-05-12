import httpx
import os
import logging

# Thiết lập logging
logger = logging.getLogger(__name__)

# URL các service (Khớp với docker-compose)
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:6001")
MEMBERSHIP_SERVICE_URL = os.getenv("MEMBERSHIP_SERVICE_URL", "http://membership_service:6002")
WORKOUT_SERVICE_URL = os.getenv("WORKOUT_SERVICE_URL", "http://workout_service:6003")

async def get_gym_context(user_id: int):
    """Tổng hợp dữ liệu từ các service để làm ngữ cảnh cho AI"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Giá trị mặc định thân thiện
        context = {
            "user_name": "người bạn",
            "membership": "chưa được đăng ký",
            "workout": "trống",
            "all_packages": "Hiện tại không có thông tin gói mới"
        }

        try:
            # 1. Lấy tên User
            u_res = await client.get(f"{USER_SERVICE_URL}/api/v1/users/{user_id}")
            if u_res.status_code == 200:
                context["user_name"] = u_res.json().get("name", "Hội viên")

            # 2. Lấy Gói tập cá nhân
            m_res = await client.get(f"{MEMBERSHIP_SERVICE_URL}/api/v1/subscriptions/active/{user_id}")
            if m_res.status_code == 200 and m_res.json():
                sub = m_res.json()
                context["membership"] = f"Đang hoạt động (Hạn đến: {sub.get('end_date')})"

            # 3. Lấy Lịch tập
            w_res = await client.get(f"{WORKOUT_SERVICE_URL}/api/v1/workout/plans/user/{user_id}")
            if w_res.status_code == 200 and w_res.json():
                context["workout"] = str(w_res.json())

            # 4. Lấy danh sách tất cả gói tập từ Membership Service
            p_res = await client.get(f"{MEMBERSHIP_SERVICE_URL}/api/v1/packages/")
            if p_res.status_code == 200:
                pkgs = p_res.json()
                if isinstance(pkgs, list) and len(pkgs) > 0:
                    pkg_info = [f"- {p.get('name')}: {p.get('price') if p.get('price') else 'Liên hệ' } VNĐ/ {p.get('duration_days')} ngày" for p in pkgs]
                    context["all_packages"] = "\n".join(pkg_info)
                else:
                    context["all_packages"] = "Liên hệ quầy để biết giá gói tập"

        except Exception as e:
            logger.error(f"Fetcher error: {str(e)}")
            context["all_packages"] = "Hiện tại hệ thống đang bận, bạn có thể gọi điện trực tiếp cho shop nhé!"

        return context
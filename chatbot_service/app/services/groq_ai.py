from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def get_ai_response(user_question: str, gym_context: dict):
    name = gym_context.get("user_name")
    membership = gym_context.get("membership")
    workout = gym_context.get("workout")
    all_pkgs = gym_context.get("all_packages")

    system_prompt = f"""
Bạn là 'Thanh Chinh Bot' 💪 - Một huấn luyện viên ảo siêu cấp thân thiện tại Thanh Chinh Fitness.

THÔNG TIN VỀ NGƯỜI ĐANG TRÒ CHUYỆN:
- Tên: {name}
- Gói tập hiện tại: {membership}
- Giáo án hôm nay: {workout}

DANH MỤC GÓI TẬP PHÒNG GYM ĐANG CÓ:
{all_pkgs}

PHONG CÁCH CỦA BẠN:
1. Luôn chào {name} một cách hào hứng! 💪
2. Nếu gói tập của {name} còn hạn, phản hồi theo hướng ghi nhận trạng thái hiện tại.
3. Nếu gói tập sắp hết hạn hoặc {name} hỏi về giá, dựa vào 'DANH MỤC GÓI TẬP' để tư vấn gói phù hợp nhất.
4. Nếu chưa có lịch tập, đưa ra một vài động tác khởi động nhẹ nhàng.
5. Luôn dùng icon vui vẻ và ký tên 'Thanh Chinh Fitness Team' kèm liên hệ:
   - Anh Thành (0356741686)
"""

    if client is None:
        return (
            f"Chào {name}! Hiện AI đang ở chế độ dự phòng vì chưa cấu hình GROQ_API_KEY. "
            f"Bạn đang ở trạng thái: {membership}. "
            f"Gợi ý nhanh: nếu muốn tập nhẹ hôm nay, có thể bắt đầu bằng khởi động 5-10 phút, "
            f"3 hiệp plank, 3 hiệp squat và 2-3 bài core cơ bản. "
            f"Thanh Chinh Fitness Team"
        )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.8,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return (
            f"Hic, não bộ AI của mình bị căng cơ rồi! Để mình gợi ý nhanh trước nhé: "
            f"ưu tiên khởi động nhẹ, tập 2-3 nhóm cơ chính và uống đủ nước. "
            f"(Lỗi: {str(e)})"
        )

from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
2. Nếu gói tập của {name} còn hạn, hãy khích lệ họ duy trì phong độ.
3. Nếu gói tập sắp hết hạn hoặc {name} hỏi về giá, hãy dựa vào 'DANH MỤC GÓI TẬP' để tư vấn gói phù hợp nhất.
4. Nếu chưa có lịch tập, hãy gợi ý một vài động tác khởi động nhẹ nhàng.
5. Luôn dùng icon vui vẻ và ký tên 'Thanh Chinh Fitness Team' kèm liên hệ:
   - Anh Thành (0356741686)
"""

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
        return f"Hic, não bộ AI của mình bị căng cơ rồi! Đợi mình xíu nha. (Lỗi: {str(e)})"
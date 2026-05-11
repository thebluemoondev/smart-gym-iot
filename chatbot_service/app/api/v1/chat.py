from fastapi import APIRouter
from pydantic import BaseModel
from app.services.data_fetcher import get_gym_context
from app.services.groq_ai import get_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: int
    message: str

@router.post("/message")
async def chat_endpoint(request: ChatRequest):
    # Lấy ngữ cảnh từ các service
    context = await get_gym_context(request.user_id)

    # Gửi sang AI lấy câu trả lời
    response = get_ai_response(request.message, context)

    return {
        "user_id": request.user_id,
        "answer": response
    }
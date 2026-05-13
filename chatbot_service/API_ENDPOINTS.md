# Chatbot Service API Endpoints

Base internal: `/api/v1`
Base qua gateway: `/api/chatbot`

## Chat

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/chat/message` | `/api/chatbot/message` | Gửi câu hỏi và nhận câu trả lời AI |

## Notes

- Body nhận `user_id` và `message`.
- Response trả về `user_id` và `answer`.


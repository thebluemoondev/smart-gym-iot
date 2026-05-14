# Chatbot Service API Endpoints

Base internal: `/api/v1`
Base qua gateway: `/api/chatbot`

## Chat

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/chat/message` | `/api/chatbot/chat/message` | Gửi câu hỏi và nhận câu trả lời AI |

## Notes

- Customer và admin chat đã được tách history riêng ở frontend.
- Prompt hiện có ngữ cảnh gói active, kế hoạch gần nhất, số ngày còn lại, điểm thông minh và cảnh báo ưu tiên.
- Body nhận `user_id` và `message`.
- Response trả về `user_id` và `answer`.

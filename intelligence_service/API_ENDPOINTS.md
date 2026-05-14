# Intelligence Service API

Base URL:

- Direct: `http://localhost:6007`
- Gateway: `http://localhost/api/intelligence`

## Health

- `GET /health`
- `GET /api/v1/intelligence/health`
- Gateway: `GET /api/intelligence/health`

## Customer Intelligence

- `GET /api/v1/intelligence/user/{user_id}/summary`
- Gateway: `GET /api/intelligence/user/{user_id}/summary`

Trả về:

- `smart_score`
- `membership`
- `workout.latest_plan`
- `workout.next_workout`
- `notifications`
- `recommendations`

## User Notifications

- `GET /api/v1/intelligence/notifications/user/{user_id}`
- Gateway: `GET /api/intelligence/notifications/user/{user_id}`

## Admin Overview

- `GET /api/v1/intelligence/admin/overview`
- Gateway: `GET /api/intelligence/admin/overview`

Trả về:

- Tổng hội viên
- Hội viên active/inactive
- Gói sắp hết hạn
- User chưa có kế hoạch
- Gói bán chạy
- User cần chăm sóc

## Email Notification

- `POST /api/v1/intelligence/notifications/email`
- Gateway: `POST /api/intelligence/notifications/email`

Body:

```json
{
  "to": "member@gmail.com",
  "subject": "Thông báo từ ThanhChinhGym",
  "message": "Hôm nay bạn có dữ liệu tập luyện mới."
}
```

Nếu SMTP chưa cấu hình, API trả `mode: preview` và không gửi email thật.

## Task Notification

- `POST /api/v1/intelligence/notifications/task`
- Gateway: `POST /api/intelligence/notifications/task`

Body:

```json
{
  "user_id": 16,
  "subject": "Đăng ký gói tập thành công",
  "message": "Bạn vừa đăng ký gói tập thành công.",
  "task_type": "membership",
  "action_label": "Xem gói tập",
  "action_path": "/customer/subscription"
}
```

Endpoint này tự lấy email của user từ `user_service` rồi gửi Gmail nếu SMTP đã cấu hình, hoặc trả preview nếu chưa cấu hình.

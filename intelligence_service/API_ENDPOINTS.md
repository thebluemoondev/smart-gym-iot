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
  "subject": "Nhắc lịch tập",
  "message": "Hôm nay bạn có kế hoạch tập luyện."
}
```

Nếu SMTP chưa cấu hình, API trả `mode: preview` và không gửi email thật.

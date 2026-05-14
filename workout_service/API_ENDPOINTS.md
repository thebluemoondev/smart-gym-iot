# Workout Service API Endpoints

Base internal: `/api/v1/workout`
Base qua gateway: `/api/workout`

## Exercises

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/workout/exercises` | `/api/workout/exercises` | Danh sách bài tập |
| `POST` | `/api/v1/workout/exercises` | `/api/workout/exercises` | Thêm bài tập mới |

## Workout Plans

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/workout/plans` | `/api/workout/plans` | Tạo kế hoạch tập luyện |
| `GET` | `/api/v1/workout/plans/user/{user_id}` | `/api/workout/plans/user/{user_id}` | Kế hoạch theo user |

## Workout History

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/workout/history` | `/api/workout/history` | Ghi nhận kết quả tập luyện |
| `GET` | `/api/v1/workout/history/user/{user_id}` | `/api/workout/history/user/{user_id}` | Lịch sử tập theo user |

## Notes

- `plans` và `history` đều kiểm tra gói tập active qua Membership Service trước khi cho phép ghi.
- Client hiện đã hỗ trợ form tạo kế hoạch nhiều dòng, trang full kế hoạch theo năm/tháng và export/in.

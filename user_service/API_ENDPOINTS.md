# User Service API Endpoints

Base internal: `/api/v1`
Base qua gateway: `/api/users`

## Authentication

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/user/register` | `/api/users/register` | Đăng ký tài khoản mới |
| `POST` | `/api/v1/user/login` | `/api/users/login` | Đăng nhập |

## User CRUD

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/user/search?q=...` | `/api/users/search?q=...` | Tìm user theo tên hoặc số điện thoại |
| `GET` | `/api/v1/user/` | `/api/users/` | Danh sách user |
| `GET` | `/api/v1/user/{id}` | `/api/users/{id}` | Lấy user theo ID |
| `POST` | `/api/v1/user/` | `/api/users/` | Tạo user mới |
| `PUT` | `/api/v1/user/{id}` | `/api/users/{id}` | Cập nhật user |
| `DELETE` | `/api/v1/user/{id}` | `/api/users/{id}` | Xóa user |

## Access Check

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/user/access-check/{card_uid}` | `/api/users/access-check/{card_uid}` | Kiểm tra quyền vào cửa qua RFID |

## RFID

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/` | Chưa map riêng | Gán thẻ RFID |
| `GET` | `/api/v1/{card_uid}` | Chưa map riêng | Tra cứu RFID theo UID |

## RFID Access History

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/user/history` | `/api/users/history` | Lịch sử quẹt thẻ, hỗ trợ `user_id`, `card_uid`, `limit` |
| `GET` | `/api/v1/user/history/user/{user_id}` | `/api/users/history/user/{user_id}` | Lịch sử quẹt thẻ theo hội viên |

## Notes

- `phone` được map sang cột `phonenumber` trong DB.
- `email`, `date_of_birth` và `gender` đã được hỗ trợ ở schema, model và DB live.
- `avatar_url` vẫn còn được hỗ trợ ở schema, model và DB live, nhưng frontend không còn bắt người dùng nhập link ảnh khi đăng ký.
- `admin/admin123` hoạt động nếu database đã được seed từ `adb/reset.sql`.
- JWT secret được đọc từ biến môi trường `SECRET_KEY`.
- Khi access-check được gọi, hệ thống ghi log vào bảng `rfid_access_logs`.

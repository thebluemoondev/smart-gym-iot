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

## Notes

- `phone` được map sang cột `phonenumber` trong DB.
- `avatar_url` đã được hỗ trợ ở schema, model và DB live.
- `admin/admin123` hoạt động nếu database đã được seed từ `adb/reset.sql`.
- JWT secret được đọc từ biến môi trường `SECRET_KEY`.

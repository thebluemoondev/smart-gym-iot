# Membership Service API Endpoints

Base internal: `/api/v1`
Base qua gateway: `/api/membership`

## Packages

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/packages/` | `/api/membership/packages/` | Danh sách gói tập |
| `POST` | `/api/v1/packages/` | `/api/membership/packages/` | Tạo gói tập mới |
| `GET` | `/api/v1/packages/{id}` | `/api/membership/packages/{id}` | Chi tiết gói tập |
| `PUT` | `/api/v1/packages/{id}` | `/api/membership/packages/{id}` | Cập nhật gói tập |

## Subscriptions

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/subscriptions/` | `/api/membership/subscriptions/` | Đăng ký gói tập cho hội viên |
| `GET` | `/api/v1/subscriptions/user/{user_id}` | `/api/membership/subscriptions/user/{user_id}` | Lịch sử đăng ký theo user |
| `GET` | `/api/v1/subscriptions/` | `/api/membership/subscriptions/` | Danh sách đăng ký toàn hệ thống |
| `GET` | `/api/v1/subscriptions/active/{user_id}` | `/api/membership/subscriptions/active/{user_id}` | Gói tập đang hoạt động của user |

## Products

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/products/` | `/api/membership/products/` | Danh sách sản phẩm |
| `GET` | `/api/v1/products/featured` | `/api/membership/products/featured` | Danh sách sản phẩm nổi bật |
| `POST` | `/api/v1/products/` | `/api/membership/products/` | Tạo sản phẩm mới |
| `GET` | `/api/v1/products/{id}` | `/api/membership/products/{id}` | Chi tiết sản phẩm |
| `PUT` | `/api/v1/products/{id}` | `/api/membership/products/{id}` | Cập nhật sản phẩm |
| `DELETE` | `/api/v1/products/{id}` | `/api/membership/products/{id}` | Xóa sản phẩm |
| `GET` | `/api/v1/products/categories/list` | `/api/membership/products/categories/list` | Danh sách danh mục |

## Notes

- `subscriptions/create` kiểm tra user tồn tại qua `user_service` trước khi tạo.
- `active/{user_id}` có thể trả `null` nếu user chưa có gói active.
- `products/categories/list` phải đặt trước route `/{id}` nếu chỉnh router trong tương lai để tránh route conflict.

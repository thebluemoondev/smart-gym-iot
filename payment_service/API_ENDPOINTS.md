# Payment Service API Endpoints

Base internal: `/api/v1/payment`
Base qua gateway: `/api/payment`

## Payments

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/payment/create` | `/api/payment/create` | Tạo thanh toán mới |
| `GET` | `/api/v1/payment/order/{order_id}` | `/api/payment/order/{order_id}` | Lấy thanh toán theo mã đơn |
| `GET` | `/api/v1/payment/user/{user_id}` | `/api/payment/user/{user_id}` | Lịch sử thanh toán theo user |
| `POST` | `/api/v1/payment/callback` | `/api/payment/callback` | Callback từ provider |
| `GET` | `/api/v1/payment/methods` | `/api/payment/methods` | Danh sách phương thức thanh toán |
| `POST` | `/api/v1/payment/confirm-cash` | `/api/payment/confirm-cash` | Xác nhận thanh toán tiền mặt/QR |

## Notes

- `create` nhận `user_id`, `subscription_id`, `amount`, `payment_method`, `discount_code` qua query params.
- `confirm-cash` tự tạo subscription nếu `subscription_id` tồn tại.


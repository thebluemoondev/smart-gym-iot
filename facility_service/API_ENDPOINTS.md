# Facility Service API Endpoints

Base internal: `/api/v1/facility`
Base qua gateway: `/api/facility`

## Equipment

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/facility/equipment` | `/api/facility/equipment` | Danh sách thiết bị |
| `POST` | `/api/v1/facility/equipment` | `/api/facility/equipment` | Thêm thiết bị mới |

## Maintenance

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/facility/maintenance` | `/api/facility/maintenance` | Ghi nhận bảo trì |

## Areas

| Method | Internal | Gateway | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/facility/areas` | `/api/facility/areas` | Danh sách khu vực tập luyện |

## Notes

- Facility service hiện tập trung vào `equipment`, `maintenance` và `areas`.
- Các màn admin tương ứng đã được nối trong client static.
- Nếu thêm IoT/RFID thật sau này, nên mở thêm endpoint truy cập log check-in riêng cho service này hoặc user_service.

# Smart Gym - Hệ thống quản lý phòng tập thông minh

## 📋 Giới thiệu

Smart Gym là hệ thống quản lý phòng tập gym thông minh với công nghệ AI, tích hợp đầy đủ các chức năng từ quản lý người dùng, gói tập, sản phẩm, thiết bị đến thanh toán.

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                 Client (static HTML/CSS/JS)                │
│                       http://localhost                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │  API Gateway  │
                    │   (Nginx :80) │
                    └───────┬───────┘
                            │
    ┌─────────┬─────────┬───┴─────┬──────────┬─────────┬─────────┬────────────┐
    ▼         ▼         ▼         ▼          ▼         ▼         ▼            ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌───────┐ ┌───────┐ ┌──────────────┐
│ User  │ │Member │ │Workout│ │Facility│ │Chatbot│ │Payment│ │Intelligence  │
│ :6001 │ │ :6002 │ │ :6003 │ │ :6004  │ │ :6005 │ │ :6006 │ │    :6007     │
└───────┘ └───────┘ └───────┘ └────────┘ └───────┘ └───────┘ └──────────────┘
    │         │         │          │                   │
    └─────────┴─────────┴──────────┴───────────────────┘
                                 ▼
                         ┌──────────────────────┐
                         │      SQL Server      │
                         │   (DB layer dưới)    │
                         └──────────────────────┘
```

## 📦 Các Service

| Service            | Port | Mô tả                                     |
| ------------------ | ---- | ------------------------------------------- |
| user_service       | 6001 | Quản lý người dùng, đăng nhập, RFID |
| membership_service | 6002 | Gói tập, đăng ký, sản phẩm           |
| workout_service    | 6003 | Bài tập, kế hoạch tập, lịch sử       |
| facility_service   | 6004 | Thiết bị, khu vực, bảo trì             |
| chatbot_service    | 6005 | AI chatbot tư vấn                         |
| payment_service    | 6006 | Thanh toán QR VPBank                       |
| intelligence_service | 6007 | Phân tích nghiệp vụ, insight, notification |
| client             | 80   | Frontend tĩnh HTML/CSS/JS                   |
| apigateway         | 80   | Nginx routing                               |

## Kết Nối DB

- `user_service`
- `membership_service`
- `workout_service`
- `facility_service`
- `payment_service`

`chatbot_service` và `intelligence_service` lấy ngữ cảnh từ các service trên, không truy cập SQL Server trực tiếp.

## Hệ Thống Thông Minh

- `intelligence_service` tổng hợp dữ liệu từ user, membership, workout và payment.
- Customer dashboard hiển thị điểm thông minh, cảnh báo, gợi ý bài tập tiếp theo.
- Admin có trang phân tích nghiệp vụ tại `/admin/intelligence`.
- Sau khi user hoàn tất tác vụ như đăng ký gói, tạo kế hoạch tập, cập nhật hồ sơ hoặc thanh toán thành công, hệ thống sẽ gửi Gmail nếu user đã có `email`.
- Service hỗ trợ gửi email qua SMTP/Gmail khi cấu hình `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`; nếu chưa cấu hình sẽ chạy ở chế độ preview.

## 🛠️ Công nghệ

- **Backend**: Python FastAPI
- **Frontend**: HTML + CSS + JavaScript tĩnh
- **Database**: SQL Server
- **API Gateway**: Nginx
- **Payment**: VPBank QR Code

## 🚀 Cài đặt

### Yêu cầu

- Docker & Docker Compose
- SQL Server

### Chạy hệ thống

```bash
# Build và chạy tất cả services
docker compose up -d

# Build riêng từng service
docker compose build
```

### Truy cập

- **Website**: http://localhost
- **Admin**: http://localhost/admin
- **API Docs**: http://localhost:6001/docs (user_service)

## 📁 Cấu trúc thư mục

```
docker_server/
├── adb/                    # Admin SQL scripts
│   ├── check.sql         # Kiểm tra dữ liệu
│   ├── reset.sql         # Reset và tạo admin
│   └── data.sql          # Dữ liệu mẫu
├── apigateway/           # Nginx config
├── client/               # Frontend tĩnh HTML/CSS/JS
├── user_service/        # User management
├── membership_service/   # Packages, products
├── workout_service/     # Exercises, plans
├── facility_service/    # Equipment, areas
├── chatbot_service/     # AI chatbot
├── payment_service/      # Payment with VPBank
├── intelligence_service/ # Business intelligence, notifications
└── docker-compose.yml    # Docker compose config
```

## 👤 Tài khoản mặc định

Sau khi chạy `adb/reset.sql`:

- **Username**: admin
- **Password**: admin123
- **Phone**: 000000000

## 💳 Thanh toán

Tích hợp **VPBank** QR Code thanh toán:

- STK: 0356741686
- Chủ TK: NGUYEN NHU THANH
- QR thanh toán được tạo qua payment service

## 📝 API Scripts

Chạy theo thứ tự:

1. `adb/reset.sql` - Reset database và tạo tài khoản admin
2. `adb/data.sql` - Thêm dữ liệu mẫu
3. `adb/check.sql` - Kiểm tra dữ liệu

## 🔧 Phát triển

```bash
# Rebuild một service
docker compose up -d --build payment_service

# Xem logs
docker compose logs -f payment_service

# Restart tất cả
docker compose restart
```

## 📄 License

MIT License - 2026

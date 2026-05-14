# Project State

Last updated: 2026-05-14

## Purpose

Smart Gym là hệ thống quản lý phòng tập tách service, frontend tĩnh, có AI insight, email notification, payment QR và RFID access-check.

## Current Architecture

- `client`: HTML/CSS/JS tĩnh
- `apigateway`: Nginx reverse proxy
- `user_service`: user, auth, RFID, access-check
- `membership_service`: gói tập, subscription, sản phẩm
- `workout_service`: bài tập, kế hoạch tập, lịch sử tập
- `facility_service`: thiết bị, khu vực, bảo trì
- `payment_service`: thanh toán QR
- `chatbot_service`: AI chat có ngữ cảnh
- `intelligence_service`: insight, smart score, notification, Gmail SMTP

## Ports

- `client`: `80`
- `apigateway`: `80`
- `user_service`: `6001`
- `membership_service`: `6002`
- `workout_service`: `6003`
- `facility_service`: `6004`
- `chatbot_service`: `6005`
- `payment_service`: `6006`
- `intelligence_service`: `6007`

## Key User Features

- Đăng ký, đăng nhập, đăng xuất
- Hồ sơ user có `name`, `username`, `phone`, `email`, `date_of_birth`, `gender`, `avatar_url`
- Xem gói tập hiện tại
- Đăng ký gói và chuyển sang thanh toán
- Xác nhận đã thanh toán
- Xem kế hoạch tập luyện
- Xem lịch sử tập luyện
- Xem lịch sử quẹt thẻ RFID
- Chat AI theo ngữ cảnh user
- Nhận email thông báo theo tác vụ

## Smart Features

- `smart_score` cho customer dashboard
- `smart_level`
- `notifications`
- `recommendations`
- `next_workout`
- Admin overview có:
  - active / inactive members
  - users without plans
  - expiring packages
  - package sales
  - risk users

## Notification Format

- Subject ngắn, theo sự kiện
- Body chỉ giữ thông tin chính
- `action_label` và `action_path` chỉ đi kèm khi cần dẫn người dùng thao tác tiếp
- Email gửi thật qua Gmail SMTP nếu cấu hình đúng

## RFID Access History

- `access-check` trong `user_service` ghi log vào bảng `rfid_access_logs`
- API đọc log:
  - `/api/users/history`
  - `/api/users/history/user/{user_id}`
- Frontend có trang:
  - `/customer/rfid-history`
  - `/admin/rfid-history`

## Current Notes

- Client đã chuyển sang static HTML/CSS/JS.
- Hệ thống đang đọc dữ liệu thật từ các service để tạo dashboard và insight.
- IoT/RFID hardware thật chưa tích hợp.
- Đây là trạng thái “smart-enabled MVP”, chưa phải IoT full production.

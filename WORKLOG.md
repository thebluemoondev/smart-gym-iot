# Worklog

Mục đích của file này là lưu tiến trình làm việc ngắn gọn để lần sau chỉ cần đọc lại.

## 2026-05-14

- Chuyển client sang static HTML/CSS/JS.
- Sửa luồng đăng ký gói, payment, dashboard customer và admin.
- Thêm `intelligence_service` để tổng hợp insight và smart score.
- Thêm Gmail SMTP notification.
- Chuẩn hóa format email:
  - subject ngắn
  - nội dung chính
  - hành động tiếp theo nếu cần
- Đổi sender name thành `ThanhChinhGym`.
- Thêm template email theo task:
  - membership
  - payment
  - workout
  - profile
- Dọn tone nội dung, bỏ câu nhắc nhở thừa trong UI, docs và chatbot prompt.
- Thêm bảng và API lịch sử quẹt thẻ RFID.
- Tạo trang customer và admin cho lịch sử quẹt thẻ.

## How to use this file

Khi mở lại dự án:

1. Đọc [PROJECT_STATE.md](./PROJECT_STATE.md) trước.
2. Đọc phần `2026-05-14` trong file này.
3. Nếu cần code chi tiết, mới mở các file service hoặc `client/js/app.js`.

## Working Rules

- Ưu tiên đọc 2 file này trước khi quét repo.
- Nếu thay đổi kiến trúc, cập nhật lại `PROJECT_STATE.md`.
- Nếu hoàn thành mốc mới, thêm bullet mới vào `WORKLOG.md`.

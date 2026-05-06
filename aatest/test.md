### 1. Đăng ký hội viên mới
```json
{
  "name": "Nguyễn Như Thành",
  "username": "admin",
  "phonenumber": "0356741686",
  "password": "admin"
}
```
### 2. Thêm gói tập mới
```
{
  "name": "Gói 30 ngày tập cơ bản",
  "price": 100000,
  "package_desc": "Gói 30 ngày tập cơ bản",
  "duration_days": 30
}
```
### 3. Đăng ký gói tập cho hội viên (Th1: user_id sai vì k tồn tại)

```json
{
  "user_id": 10000,
  "package_id": 1,
  "start_date": "2026-05-05",
  "end_date": "2026-05-05",
  "status": "active"
}
```

### 3. Đăng ký gói tập cho hội viên (Th2: user_id tồn tại)
```json
{
  "user_id": 10000,
  "package_id": 1,
  "start_date": "2026-05-05",
  "end_date": "2026-05-05",
  "status": "active"
}
```

### 4. Gán thẻ RFID cho hội viên
```json
{
  "user_id": 1,
  "card_uid": "RFID-888-999",
  "is_active": true
}
```

### 5. Tạo bài tập
```json
{
  "name": "Squat",
  "category": "Legs",
  "description": "Gánh tạ đòn"
}
```

### 6. Tạo kế hoạch tập luyện
```json
{
  "user_id": 1,
  "name": "Kế hoạch giảm cân thần tốc",
  "details": []
}
```

### 6. Ghi nhật ký buổi tập
```json
{
  "user_id": 1,
  "exercise_id": 1,
  "sets": 3,
  "reps": 12,
  "weight": 40.5,
  "notes": "Hơi mệt nhưng hoàn thành tốt"
}
```

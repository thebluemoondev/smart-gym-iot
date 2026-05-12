-- =============================================================
-- DATA.SQL - BƠM DỮ LIỆU MẪU VÀO HỆ THỐNG
-- =============================================================

-- =============================================================
-- 1. USER SERVICE - Dữ liệu người dùng
-- =============================================================
USE user_service;
GO

-- Tạo users mẫu
INSERT INTO users (username, name, password, phonenumber, role) VALUES
('user1', 'Nguyễn Văn A', '123456', '0912345678', 'user'),
('user2', 'Trần Thị B', '123456', '0912345679', 'user'),
('user3', 'Lê Văn C', '123456', '0912345680', 'user'),
('user4', 'Phạm Thị D', '123456', '0912345681', 'user'),
('user5', 'Hoàng Văn E', '123456', '0912345682', 'user');
GO

-- Tạo RFID cards mẫu
INSERT INTO rfid_cards (card_uid, user_id, is_active) VALUES
('A1B2C3D4', 1, 1),
('E5F6G7H8', 2, 1),
('I9J0K1L2', 3, 1);
GO

PRINT 'User Service: Data loaded';
GO

-- =============================================================
-- 2. MEMBERSHIP SERVICE - Dữ liệu gói tập và sản phẩm
-- =============================================================
USE membership_service;
GO

-- Tạo packages (gói tập)
INSERT INTO packages (name, price, package_desc, duration_days) VALUES
('Basic', 299000, 'Gói tập cơ bản', 30),
('VIP', 499000, 'Gói tập VIP', 30),
('Premium', 799000, 'Gói tập Premium', 90),
('Gold', 1500000, 'Gói tập Gold', 180),
('Platinum', 2500000, 'Gói tập Platinum', 365);
GO

-- Tạo products (sản phẩm bán lẻ)
INSERT INTO products (name, description, price, original_price, category, stock, is_featured) VALUES
(N'Whey Protein Isolate', N'Thuốc tăng cơ cao cấp, hấp thụ nhanh', 450000, 500000, 'supplement', 50, 1),
(N'Creatine Monohydrate', N'Tăng sức mạnh và năng lượng', 250000, NULL, 'supplement', 100, 0),
(N'BCAA', N'Amino axit tăng phục hồi', 280000, 320000, 'supplement', 60, 1),
(N'Pre-workout', N'Tăng năng lượng trước tập', 350000, NULL, 'supplement', 40, 0),
(N'Găng tay Gym', N'Găng tay bảo vệ cổ tay, chống trượt', 85000, 100000, 'accessory', 200, 1),
(N'Đai lưng Gym', N'Đai hỗ trợ thắt lưng', 120000, NULL, 'accessory', 80, 0),
(N'Thái dụng cụ tập', N'Bộ thái từ 5kg-20kg', 350000, 400000, 'equipment', 30, 0),
(N'Tạ tay 5kg', N'Tạ tay đôi 5kg mỗi quả', 280000, NULL, 'equipment', 25, 1),
(N'Bình nước 1L', N'Bình nước cá nhân', 50000, 60000, 'accessory', 150, 0),
(N'Túi trùm Gym', N'Túi đựng đồ tiện lợi', 95000, NULL, 'accessory', 100, 0),
(N'Áo thun Gym', N'Áo thoáng khí, co giãn tốt', 150000, NULL, 'wear', 80, 0),
(N'Quần tập Gym', N'Quần nhanh khô, co giãn', 180000, NULL, 'wear', 60, 0),
(N'Giày tập Gym', N'Giày chuyên dụng tập gym', 450000, 500000, 'wear', 40, 1);
GO

-- Tạo subscriptions (đăng ký mẫu)
INSERT INTO subscriptions (user_id, package_id, start_date, end_date, status) VALUES
(1, 1, '2026-01-01', '2026-01-31', 'active'),
(2, 2, '2026-02-01', '2026-02-28', 'active'),
(3, 3, '2026-03-01', '2026-05-30', 'active'),
(4, 4, '2025-12-01', '2026-05-29', 'active'),
(5, 5, '2026-01-01', '2026-12-31', 'active');
GO

PRINT 'Membership Service: Data loaded';
GO

-- =============================================================
-- 3. WORKOUT SERVICE - Dữ liệu bài tập
-- =============================================================
USE workout_service;
GO

-- Tạo exercises (bài tập)
INSERT INTO exercises (name, description, muscle_group, difficulty, equipment_required) VALUES
(N'Nâng tạ đôi', N'Bài tập vai', 'shoulders', 'beginner', 'dumbbell'),
(N'Ngồi xổm', N'Bài tập chân', 'legs', 'beginner', 'none'),
(N'Đẩy người', N'Bài tập ngực', 'chest', 'beginner', 'none'),
(N'Kéo xà', N'Bài tập lưng', 'back', 'intermediate', 'barbell'),
(N'Gập bụng', N'Bài tập bụng', 'abs', 'beginner', 'none'),
(N'Plank', N'Bài tập core', 'core', 'beginner', 'none'),
(N'Deadlift', N'Bài tập toàn thân', 'full_body', 'advanced', 'barbell'),
(N'Bench Press', N'Bài tập ngực', 'chest', 'intermediate', 'barbell'),
(N'Bicep Curl', N'Bài tập tay trước', 'arms', 'beginner', 'dumbbell'),
(N'Tricep Extension', N'Bài tập tay sau', 'arms', 'beginner', 'dumbbell');
GO

-- Tạo workout_plans (kế hoạch tập)
INSERT INTO workout_plans (user_id, name, description, duration_weeks, exercises_json) VALUES
(1, N'Kế hoạch tập 1 tháng', N'Chương trình tập cơ bản', 4, N'[
  {"day": 1, "exercises": [1, 2, 3]},
  {"day": 2, "exercises": [4, 5, 6]},
  {"day": 3, "exercises": []},
  {"day": 4, "exercises": [7, 8, 9]},
  {"day": 5, "exercises": [10, 1, 2]},
  {"day": 6, "exercises": []},
  {"day": 7, "exercises": []}
]'),
(2, N'Kế hoạch tập 3 tháng', N'Chương trình tập nâng cao', 12, N'[
  {"day": 1, "exercises": [3, 7, 8]},
  {"day": 2, "exercises": [2, 9, 10]},
  {"day": 3, "exercises": [4, 5, 6]},
  {"day": 4, "exercises": []},
  {"day": 5, "exercises": [1, 7, 8]},
  {"day": 6, "exercises": [2, 9, 10]},
  {"day": 7, "exercises": []}
]');
GO

-- Tạo workout_history (lịch sử tập)
INSERT INTO workout_history (user_id, exercise_id, sets, reps, weight, workout_date) VALUES
(1, 1, 3, 12, 10, '2026-05-10 10:00:00'),
(1, 2, 4, 15, 0, '2026-05-10 10:30:00'),
(2, 3, 3, 10, 0, '2026-05-11 08:00:00'),
(3, 7, 4, 8, 50, '2026-05-11 09:00:00');
GO

PRINT 'Workout Service: Data loaded';
GO

-- =============================================================
-- 4. FACILITY SERVICE - Dữ liệu cơ sở vật chất
-- =============================================================
USE facility_service;
GO

-- Tạo gym_areas (khu vực)
INSERT INTO gym_areas (name, capacity, description, is_active) VALUES
(N'Khu vực tạ', 20, N'Khu vực tập tạ tự do', 1),
(N'Khu vực máy', 30, N'Khu vực máy tập', 1),
(N'Khu vực cardio', 25, N'Khu vực chạy bộ, đạp xe', 1),
(N'Khu vực yoga', 15, N'Khu vực yoga, pilates', 1),
(N'Khu vực boxing', 10, N'Khu vực đấm bốc', 1);
GO

-- Tạo equipment (thiết bị)
INSERT INTO equipment (name, category, status, purchase_date, last_maintenance) VALUES
(N'Tạ đôi 5kg', 'dumbbell', 'operational', '2025-01-15', '2026-04-01'),
(N'Tạ đôi 10kg', 'dumbbell', 'operational', '2025-01-15', '2026-04-01'),
(N'Xà đơn', 'bar', 'operational', '2025-02-20', '2026-04-15'),
(N'Máy chạy bộ 1', 'cardio', 'operational', '2024-06-01', '2026-05-01'),
(N'Máy chạy bộ 2', 'cardio', 'maintenance', '2024-06-01', '2026-04-20'),
(N'Máy đạp xe 1', 'cardio', 'operational', '2024-07-01', '2026-04-25'),
(N'Máy ngực', 'machine', 'operational', '2024-03-01', '2026-03-15'),
(N'Máy chân', 'machine', 'operational', '2024-03-01', '2026-03-15'),
(N'Thái tạ', 'barbell', 'operational', '2025-01-10', '2026-04-10');
GO

-- Tạo maintenance_logs (bảo trì)
INSERT INTO maintenance_logs (equipment_id, maintenance_date, description, cost, performed_by) VALUES
(1, '2026-04-01', N'Bảo trì định kỳ', 50000, N'Nhân viên A'),
(2, '2026-04-01', N'Bảo trì định kỳ', 50000, N'Nhân viên A'),
(4, '2026-05-01', N'Sửa chữa motor', 500000, N'Kỹ thuật B'),
(5, '2026-04-20', N'Bảo trì định kỳ', 30000, N'Nhân viên C');
GO

PRINT 'Facility Service: Data loaded';
GO

-- =============================================================
-- 5. PAYMENT SERVICE - Dữ liệu thanh toán (mẫu)
-- =============================================================
USE payment_service;
GO

-- Tạo payments mẫu
INSERT INTO payments (user_id, subscription_id, amount, currency, payment_method, status, order_id) VALUES
(1, 1, 299000, 'VND', 'bank_transfer', 'success', 'GYMBILL-20260501-001'),
(2, 2, 499000, 'VND', 'bank_transfer', 'success', 'GYMBILL-20260502-002'),
(3, 3, 799000, 'VND', 'bank_transfer', 'pending', 'GYMBILL-20260503-003');
GO

PRINT 'Payment Service: Data loaded';
GO

-- =============================================================
-- HOÀN TẤT
-- =============================================================
PRINT '========== DATA LOADED SUCCESSFULLY ==========';
GO
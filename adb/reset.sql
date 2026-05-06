-- =============================================================
-- KỊCH BẢN RESET DỮ LIỆU BẰNG DELETE (VƯỢT LỖI FOREIGN KEY)
-- =============================================================

-- Bước 1: Workout Service (Xóa từ bảng con trước, bảng cha sau)
USE workout_service;
GO
DELETE FROM workout_history;
DELETE FROM workout_plans;
DELETE FROM exercises;
-- Reset ID về 1
DBCC CHECKIDENT ('workout_history', RESEED, 0);
DBCC CHECKIDENT ('workout_plans', RESEED, 0);
DBCC CHECKIDENT ('exercises', RESEED, 0);
GO

-- Bước 2: Membership Service
USE membership_service;
GO
DELETE FROM subscriptions;
DELETE FROM gym_packages;
IF OBJECT_ID('packages', 'U') IS NOT NULL DELETE FROM gym_packages;
DBCC CHECKIDENT ('subscriptions', RESEED, 0);
DBCC CHECKIDENT ('gym_packages', RESEED, 0);

GO

-- Bước 3: Facility Service
USE facility_service;
GO
DELETE FROM maintenance_logs;
DELETE FROM equipment;
DELETE FROM gym_areas;
DBCC CHECKIDENT ('maintenance_logs', RESEED, 0);
DBCC CHECKIDENT ('equipment', RESEED, 0);
GO

-- Bước 4: User Service
USE user_service;
GO
-- Tương tự, kiểm tra rfid_cards hay rfid
IF OBJECT_ID('rfid_cards', 'U') IS NOT NULL DELETE FROM rfid_cards;
DELETE FROM users;
DBCC CHECKIDENT ('users', RESEED, 0);
GO
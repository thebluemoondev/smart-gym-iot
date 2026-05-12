-- =============================================================
-- RESET.SQL - XÓA DỮ LIỆU VÀ TẠO TÀI KHOẢN ADMIN
-- =============================================================

-- =============================================================
-- BƯỚC 1: XÓA DỮ LIỆU CÁC SERVICE (TỪ BẢNG CON ĐẾN BẢNG CHA)
-- =============================================================

-- 1.1 Payment Service
USE payment_service;
GO
DELETE FROM payments;
DBCC CHECKIDENT ('payments', RESEED, 0);
PRINT 'Payment Service: Reset complete';
GO

-- 1.2 Workout Service
USE workout_service;
GO
DELETE FROM workout_history;
DELETE FROM workout_plans;
DELETE FROM exercises;
DBCC CHECKIDENT ('workout_history', RESEED, 0);
DBCC CHECKIDENT ('workout_plans', RESEED, 0);
DBCC CHECKIDENT ('exercises', RESEED, 0);
PRINT 'Workout Service: Reset complete';
GO

-- 1.3 Membership Service
USE membership_service;
GO
-- Xóa subscriptions trước (vì có FK đến packages)
DELETE FROM subscriptions;
-- Xóa gym_packages
DELETE FROM gym_packages;
DBCC CHECKIDENT ('subscriptions', RESEED, 0);
DBCC CHECKIDENT ('gym_packages', RESEED, 0);
PRINT 'Membership Service: Reset complete';
GO

-- 1.4 Facility Service
USE facility_service;
GO
DELETE FROM maintenance_logs;
DELETE FROM equipment;
DELETE FROM gym_areas;
DBCC CHECKIDENT ('maintenance_logs', RESEED, 0);
DBCC CHECKIDENT ('equipment', RESEED, 0);
DBCC CHECKIDENT ('gym_areas', RESEED, 0);
PRINT 'Facility Service: Reset complete';
GO

-- 1.5 User Service (xóa cuối vì các bảng khác có thể FK đến users)
USE user_service;
GO
DELETE FROM rfid_cards;
DELETE FROM users;
DBCC CHECKIDENT ('rfid_cards', RESEED, 0);
DBCC CHECKIDENT ('users', RESEED, 0);
PRINT 'User Service: Reset complete';
GO

-- =============================================================
-- BƯỚC 2: TẠO TÀI KHOẢN ADMIN
-- =============================================================

USE user_service;
GO

-- Tạo user admin (username: admin, password: admin - đã mã hóa bcrypt)
-- Password hash: $2b$12$4R9gX5aPDFuM36l.Zfc4ROGSuZuUAP6ZodgSPo1k8E6nd9RjX/wZG (admin)
INSERT INTO users (username, name, password, phonenumber, role) VALUES
('admin', 'Quản trị viên', '$2b$12$4R9gX5aPDFuM36l.Zfc4ROGSuZuUAP6ZodgSPo1k8E6nd9RjX/wZG', '0900000001', 'admin');
GO

PRINT 'Admin account created: admin / admin';
GO



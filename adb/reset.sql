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
-- Xóa products (nếu bảng đã được tạo)
-- DELETE FROM products;
-- Xóa packages (tên bảng đúng theo model)
DELETE FROM packages;
DBCC CHECKIDENT ('subscriptions', RESEED, 0);
-- DBCC CHECKIDENT ('products', RESEED, 0);
DBCC CHECKIDENT ('packages', RESEED, 0);
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

-- Tạo tài khoản admin với username: admin, password: admin, phonenumber: 000000000
INSERT INTO users (username, name, password, phonenumber, role)
VALUES ('admin', 'Administrator', 'admin', '000000000', 'admin');
GO

-- Xác nhận tài khoản đã tạo
SELECT id, username, name, phonenumber, role FROM users WHERE role = 'admin';
GO

PRINT '========== RESET HOÀN TẤT ==========';
PRINT 'Tài khoản admin đã được tạo:';
PRINT '  - Username: admin';
PRINT '  - Password: admin';
PRINT '  - Phonenumber: 000000000';
PRINT '  - Role: admin';
GO
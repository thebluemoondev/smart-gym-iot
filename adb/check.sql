-- =============================================================
-- CHECK.SQL - KIỂM TRA DỮ LIỆU TRONG TẤT CẢ CÁC BẢNG
-- =============================================================

-- 1. USER SERVICE
USE user_service;
GO
PRINT '========== USER SERVICE ==========';
SELECT '--- TABLE: users ---' AS [Status];
SELECT id, username, name, phonenumber, role, created_at FROM users;

SELECT '--- TABLE: rfid_cards ---' AS [Status];
SELECT * FROM rfid_cards;
GO

-- 2. MEMBERSHIP SERVICE
USE membership_service;
GO
PRINT '========== MEMBERSHIP SERVICE ==========';
SELECT '--- TABLE: gym_packages ---' AS [Status];
SELECT id, name, price, package_desc, duration_days FROM gym_packages;

SELECT '--- TABLE: subscriptions ---' AS [Status];
SELECT * FROM subscriptions;

SELECT '--- TABLE: products ---' AS [Status];
SELECT id, name, price, original_price, category, stock, is_featured, is_active FROM products;
GO

-- 3. WORKOUT SERVICE
USE workout_service;
GO
PRINT '========== WORKOUT SERVICE ==========';
SELECT '--- TABLE: exercises ---' AS [Status];
SELECT id, name, muscle_group, difficulty FROM exercises;

SELECT '--- TABLE: workout_plans ---' AS [Status];
SELECT id, user_id, name, description, duration_weeks FROM workout_plans;

SELECT '--- TABLE: workout_history ---' AS [Status];
SELECT id, user_id, exercise_id, sets, reps, weight, workout_date FROM workout_history;
GO

-- 4. FACILITY SERVICE
USE facility_service;
GO
PRINT '========== FACILITY SERVICE ==========';
SELECT '--- TABLE: gym_areas ---' AS [Status];
SELECT id, name, capacity, description, is_active FROM gym_areas;

SELECT '--- TABLE: equipment ---' AS [Status];
SELECT id, name, category, status, purchase_date, last_maintenance FROM equipment;

SELECT '--- TABLE: maintenance_logs ---' AS [Status];
SELECT id, equipment_id, maintenance_date, description, cost, performed_by FROM maintenance_logs;
GO

-- 5. PAYMENT SERVICE
USE payment_service;
GO
PRINT '========== PAYMENT SERVICE ==========';
SELECT '--- TABLE: payments ---' AS [Status];
SELECT id, user_id, subscription_id, amount, payment_method, status, order_id FROM payments;
GO

PRINT '========== KIỂM TRA HOÀN TẤT ==========';
GO
-- =============================================================
-- SCRIPT HIỆN TÊN BẢNG VÀ DỮ LIỆU TRÊN CÙNG MỘT KHUNG RESULT
-- =============================================================

-- 1. USER SERVICE
USE user_service;
GO
SELECT '--- TABLE: users ---' AS [Status];
SELECT * FROM users;

SELECT '--- TABLE: rfid_cards ---' AS [Status];
SELECT * FROM rfid_cards;
GO

-- 2. MEMBERSHIP SERVICE
USE membership_service;
GO
SELECT '--- TABLE: gym_packages ---' AS [Status];
SELECT * FROM gym_packages;

SELECT '--- TABLE: subscriptions ---' AS [Status];
SELECT * FROM subscriptions;
GO

-- 3. WORKOUT SERVICE
USE workout_service;
GO
SELECT '--- TABLE: exercises ---' AS [Status];
SELECT * FROM exercises;

SELECT '--- TABLE: workout_plans ---' AS [Status];
SELECT * FROM workout_plans;

SELECT '--- TABLE: workout_history ---' AS [Status];
SELECT * FROM workout_history;
GO

-- 4. FACILITY SERVICE
USE facility_service;
GO
SELECT '--- TABLE: gym_areas ---' AS [Status];
SELECT * FROM gym_areas;

SELECT '--- TABLE: equipment ---' AS [Status];
SELECT * FROM equipment;

SELECT '--- TABLE: maintenance_logs ---' AS [Status];
SELECT * FROM maintenance_logs;
GO
-- =============================================================
-- WORKOUT SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE workout_service;
GO

-- 1. Drop existing tables (if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'workout_history')
    DROP TABLE workout_history;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'workout_details')
    DROP TABLE workout_details;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'workout_plans')
    DROP TABLE workout_plans;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'exercises')
    DROP TABLE exercises;
GO

-- 2. Create tables
-- Exercises (thư viện bài tập)
CREATE TABLE exercises (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    muscle_group NVARCHAR(100),
    difficulty NVARCHAR(50),
    equipment_required NVARCHAR(100)
);
GO

-- Workout Plans (kế hoạch tập luyện)
CREATE TABLE workout_plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    duration_weeks INT,
    exercises_json NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Workout Details (chi tiết bài tập trong kế hoạch)
CREATE TABLE workout_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight FLOAT,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
GO

-- Workout History (nhật ký tập luyện)
CREATE TABLE workout_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight FLOAT,
    workout_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
GO

-- Indexes
CREATE INDEX IX_workout_history_user_id ON workout_history(user_id);
CREATE INDEX IX_workout_plans_user_id ON workout_plans(user_id);
GO
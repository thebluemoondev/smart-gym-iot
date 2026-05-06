-- CREATE DATABASE workout_service;
-- GO

-- USE workout_service;
-- GO

-- SELECT * FROM exercises

-- -- 1. Thư viện bài tập
-- CREATE TABLE exercises
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(255) NOT NULL,
--     description NVARCHAR(500),
--     muscle_group NVARCHAR(100) -- Nhóm cơ: Ngực, Chân, Vai...
-- );

-- -- 2. Kế hoạch tập luyện (Do User hoặc HLV tạo)
-- CREATE TABLE workout_plans
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     user_id INT NOT NULL, -- Khóa logic sang User Service
--     name NVARCHAR(255) NOT NULL,
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- 3. Chi tiết các bài tập trong một kế hoạch
-- CREATE TABLE workout_details
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     plan_id INT NOT NULL,
--     exercise_id INT NOT NULL,
--     sets INT NOT NULL,
--     reps INT NOT NULL,
--     weight FLOAT, -- Khối lượng tạ (kg)
--     FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
--     FOREIGN KEY (exercise_id) REFERENCES exercises(id)
-- );

-- -- 4. Nhật ký tập luyện thực tế (User lưu lại sau mỗi buổi tập)
-- CREATE TABLE workout_history
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     user_id INT NOT NULL, -- Khóa logic
--     exercise_id INT NOT NULL,
--     sets INT NOT NULL,
--     reps INT NOT NULL,
--     weight FLOAT,
--     workout_date DATETIME DEFAULT GETDATE(),
--     FOREIGN KEY (exercise_id) REFERENCES exercises(id)
-- );

-- -- Chỉ mục để truy vấn nhanh lịch sử theo người dùng
-- CREATE INDEX IX_workout_history_user_id ON workout_history(user_id);
-- CREATE INDEX IX_workout_plans_user_id ON workout_plans(user_id);
-- GO
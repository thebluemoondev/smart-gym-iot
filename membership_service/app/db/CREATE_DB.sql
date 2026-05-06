-- -- Tạo database riêng cho Membership Service
-- CREATE DATABASE membership_service;
-- GO

-- USE membership_service;
-- GO

-- -- 1. Bảng danh mục gói tập
-- CREATE TABLE gym_packages
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(255) NOT NULL,
--     price INT NOT NULL,
--     package_desc NVARCHAR(255),
--     duration_days INT NOT NULL
-- );

-- -- 2. Bảng đăng ký gói tập
-- -- Lưu ý: user_id ở đây là khóa logic, dùng để liên kết với User Service qua API
-- CREATE TABLE subscriptions
-- (
--     id INT PRIMARY KEY IDENTITY(1,1),
--     user_id INT NOT NULL,
--     package_id INT NOT NULL,
--     start_date DATE NOT NULL,
--     end_date DATE NOT NULL,
--     status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
--     FOREIGN KEY (package_id) REFERENCES gym_packages(id)
-- );

-- -- Tạo chỉ mục để tìm kiếm nhanh theo user_id
-- CREATE INDEX IX_subscriptions_user_id ON subscriptions(user_id);
-- GO
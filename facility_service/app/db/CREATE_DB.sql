-- CREATE DATABASE facility_service;
-- GO

-- USE facility_service;
-- GO

-- -- 1. Danh mục thiết bị (Máy chạy, tạ đơn, máy kéo cáp...)
-- CREATE TABLE equipment
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(255) NOT NULL,
--     category NVARCHAR(100), -- Cardio, Strength, Recovery
--     status NVARCHAR(50) DEFAULT 'operational', -- operational, under_repair, broken
--     purchase_date DATE,
--     last_maintenance DATE
-- );

-- -- 2. Nhật ký bảo trì thiết bị
-- CREATE TABLE maintenance_logs
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     equipment_id INT NOT NULL,
--     maintenance_date DATETIME DEFAULT GETDATE(),
--     description NVARCHAR(500),
--     cost INT DEFAULT 0,
--     performed_by NVARCHAR(255),
--     FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
-- );

-- -- 3. Thông tin khu vực phòng tập (Phòng Yoga, Khu tạ nặng, Phòng thay đồ)
-- CREATE TABLE gym_areas
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(255) NOT NULL,
--     capacity INT,
--     description NVARCHAR(500)
-- );

-- CREATE INDEX IX_equipment_status ON equipment(status);
-- GO

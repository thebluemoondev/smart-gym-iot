-- =============================================================
-- FACILITY SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE facility_service;
GO

-- 1. Drop existing tables (if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'maintenance_logs')
    DROP TABLE maintenance_logs;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'equipment')
    DROP TABLE equipment;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'gym_areas')
    DROP TABLE gym_areas;
GO

-- 2. Create tables
-- Equipment (danh mục thiết bị)
CREATE TABLE equipment (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category NVARCHAR(100),
    status NVARCHAR(50) DEFAULT 'operational',
    purchase_date DATE,
    last_maintenance DATE
);
GO

-- Maintenance Logs (nhật ký bảo trì)
CREATE TABLE maintenance_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    equipment_id INT NOT NULL,
    maintenance_date DATETIME DEFAULT GETDATE(),
    description NVARCHAR(500),
    cost INT DEFAULT 0,
    performed_by NVARCHAR(255),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);
GO

-- Gym Areas (khu vực phòng tập)
CREATE TABLE gym_areas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    capacity INT,
    description NVARCHAR(500)
);
GO

-- Index
CREATE INDEX IX_equipment_status ON equipment(status);
GO
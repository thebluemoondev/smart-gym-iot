-- =============================================================
-- MEMBERSHIP SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE membership_service;
GO

-- 1. Drop existing tables (if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'subscriptions')
    DROP TABLE subscriptions;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'gym_packages')
    DROP TABLE gym_packages;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
    DROP TABLE products;
GO

-- 2. Create tables
-- Gym Packages (gói tập)
CREATE TABLE gym_packages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price INT NOT NULL,
    package_desc NVARCHAR(255),
    duration_days INT NOT NULL
);
GO

-- Subscriptions (đăng ký gói tập)
CREATE TABLE subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (package_id) REFERENCES gym_packages(id)
);
GO

CREATE INDEX IX_subscriptions_user_id ON subscriptions(user_id);
GO

-- Products (sản phẩm bán lẻ)
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price FLOAT NOT NULL,
    original_price FLOAT,
    category NVARCHAR(50) NOT NULL,
    image_url NVARCHAR(500),
    stock INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    is_featured BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO
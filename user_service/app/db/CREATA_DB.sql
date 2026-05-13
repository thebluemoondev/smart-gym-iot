-- =============================================================
-- USER SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE user_service;
GO

-- 1. Drop existing tables (if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'rfid_cards')
    DROP TABLE rfid_cards;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    DROP TABLE users;
GO

-- 2. Create tables
-- Users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(10),
    role VARCHAR(10) DEFAULT 'user',
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- RFID Cards
CREATE TABLE rfid_cards (
    id INT IDENTITY(1,1) PRIMARY KEY,
    card_uid VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Indexes
CREATE INDEX IX_users_username ON users(username);
CREATE INDEX IX_users_phone ON users(phone);
GO

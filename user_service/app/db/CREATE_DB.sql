-- =============================================================
-- USER SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE user_service;
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'rfid_cards')
    DROP TABLE rfid_cards;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'rfid_access_logs')
    DROP TABLE rfid_access_logs;
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    DROP TABLE users;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE rfid_cards (
    id INT IDENTITY(1,1) PRIMARY KEY,
    card_uid VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL UNIQUE,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_rfid_cards_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE TABLE rfid_access_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    card_uid VARCHAR(50) NOT NULL,
    user_id INT NULL,
    access_granted BIT NOT NULL DEFAULT 0,
    reason NVARCHAR(255) NULL,
    checked_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE INDEX IX_users_username ON users(username);
CREATE INDEX IX_users_phonenumber ON users(phonenumber);
CREATE INDEX IX_rfid_access_logs_user_id ON rfid_access_logs(user_id);
CREATE INDEX IX_rfid_access_logs_checked_at ON rfid_access_logs(checked_at);
GO

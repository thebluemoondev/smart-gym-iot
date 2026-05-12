-- =============================================================
-- PAYMENT SERVICE - CREATE DATABASE AND TABLES
-- =============================================================

USE payment_service;
GO

-- 1. Drop existing tables (if exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
    DROP TABLE payments;
GO

-- 2. Create table
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_id INT NULL,
    amount FLOAT NOT NULL,
    currency NVARCHAR(10) DEFAULT 'VND',
    payment_method NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending',
    transaction_id NVARCHAR(100) NULL,
    order_id NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    payment_url NVARCHAR(MAX) NULL,
    qr_code NVARCHAR(MAX) NULL,
    callback_data NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    completed_at DATETIME NULL
);
GO

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
GO
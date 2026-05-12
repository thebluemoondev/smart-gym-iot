-- Tạo database payment_service
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'payment_service')
BEGIN
    CREATE DATABASE payment_service;
END
GO

USE payment_service;
GO

-- Tạo bảng payments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
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
END
GO

-- Tạo index
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
GO
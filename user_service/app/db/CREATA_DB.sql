-- use user_service

-- CREATE DATABASE user_service

-- CREATE TABLE users
-- (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     name NVARCHAR(255) NOT NULL,
--     username VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     phonenumber VARCHAR(10),
--     role VARCHAR(10) DEFAULT 'user'
-- );

-- CREATE TABLE rfid_cards (
--     id INT PRIMARY KEY IDENTITY(1,1),
--     card_uid VARCHAR(50) UNIQUE NOT NULL,
--     user_id INT UNIQUE NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- SELECT DB_NAME() AS CurrentDB

-- SELECT * FROM users
-- V5__create_otp_verifications_table.sql
-- Create OTP verifications table for storing OTP codes

CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    expiry_time DATETIME NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    used_at DATETIME,
    INDEX idx_email (email),
    INDEX idx_expiry (expiry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

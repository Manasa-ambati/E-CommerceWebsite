-- Remove OTP columns from users table since we're using in-memory OTP storage
ALTER TABLE users DROP COLUMN IF EXISTS otp;
ALTER TABLE users DROP COLUMN IF EXISTS otp_expiry;

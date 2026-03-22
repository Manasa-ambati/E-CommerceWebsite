-- Migration Script: Remove Email Verification Requirement
-- Date: 2026-03-10
-- Description: Mark all existing users as verified and remove OTP columns

-- Step 1: Update all existing users to have verified emails
UPDATE users SET email_verified = true WHERE email_verified = false;

-- Step 2: Drop OTP-related columns (optional - Hibernate will handle this automatically)
-- Uncomment the following lines if you want to manually remove the columns:

-- ALTER TABLE users DROP COLUMN otp_code;
-- ALTER TABLE users DROP COLUMN otp_expiry;

-- Note: With spring.jpa.hibernate.ddl-auto=update, Hibernate will automatically
-- remove the columns from the database when the application starts.

-- Migration Script: Enable All Users
-- Date: 2026-03-18
-- Description: Mark all existing users as verified to fix login issue

-- Update all existing users to have verified emails
UPDATE users SET email_verified = true;

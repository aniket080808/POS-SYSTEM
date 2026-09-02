-- Migration: Add enabled and password_changed_at columns to users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_changed_at'
    ) THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;
    END IF;
END $$;

-- Backfill any existing NULL values
UPDATE users SET enabled = true WHERE enabled IS NULL;
UPDATE users SET password_changed_at = COALESCE(created_at, NOW()) WHERE password_changed_at IS NULL;

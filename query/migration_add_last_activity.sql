-- Migration: Add lastActivity column to users table for JWT inactivity expiration
-- Date: 2025-01-03
-- Reason: P1-4 Backend JWT inactivity expiration
-- Idempotent: safe to re-run if column already exists

-- Add lastActivity column if not exists (nullable initially for backfill)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;

-- Backfill: set lastActivity to NOW() for all existing users
-- This ensures no existing sessions are invalidated on deploy
UPDATE users SET last_activity = NOW() WHERE last_activity IS NULL;

-- Create index if not exists for performance on activity checks
CREATE INDEX IF NOT EXISTS idx_user_last_activity ON users(last_activity);

-- Verify migration
SELECT id, email, last_activity FROM users LIMIT 5;

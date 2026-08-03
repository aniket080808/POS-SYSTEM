-- Migration: Add isActive column to branches table for soft delete
-- Date: 2025-01-XX
-- Reason: P1-1 Branch soft delete fix

-- Add isActive column with default true for existing rows
ALTER TABLE branches ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for performance on active-branch queries
CREATE INDEX idx_branch_store_active ON branches(store_id, is_active);

-- Verify migration
SELECT id, name, is_active FROM branches LIMIT 5;
-- ============================================================
-- Fix: Add INACTIVE to store_subscriptions status CHECK constraint
-- ============================================================
-- The Java enum StoreSubscriptionStatus was updated to include INACTIVE,
-- but the database CHECK constraint still only allows NONE,PENDING,ACTIVE,REJECTED.
-- This migration drops the old constraint and recreates it with INACTIVE included.

-- Step 1: Drop the old constraint
ALTER TABLE store_subscriptions DROP CONSTRAINT IF EXISTS store_subscriptions_status_check;

-- Step 2: Recreate with INACTIVE included
ALTER TABLE store_subscriptions ADD CONSTRAINT store_subscriptions_status_check
    CHECK (status IN ('NONE', 'PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'));

-- ============================================================
-- Verify: Check if any OTHER enum-backed columns have similar
-- hardcoded CHECK constraints that could cause issues
-- ============================================================
-- Run this query to find all CHECK constraints on the public schema:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE contype = 'c'
--   AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
-- ORDER BY conname;
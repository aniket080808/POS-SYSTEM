-- Migration: Convert users.role from integer ordinal to VARCHAR enum string
-- Step 1: Alter column type from integer/smallint to VARCHAR
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);

-- Step 2: Convert existing integer values to their enum string names
-- Based on UserRole enum order: ROLE_ADMIN=0, ROLE_STORE_ADMIN=1, ROLE_STORE_MANAGER=2,
-- ROLE_BRANCH_MANAGER=3, ROLE_BRANCH_ADMIN=4, ROLE_BRANCH_CASHIER=5, ROLE_CUSTOMER=6
UPDATE users SET role = 'ROLE_ADMIN' WHERE role = '0';
UPDATE users SET role = 'ROLE_STORE_ADMIN' WHERE role = '1';
UPDATE users SET role = 'ROLE_STORE_MANAGER' WHERE role = '2';
UPDATE users SET role = 'ROLE_BRANCH_MANAGER' WHERE role = '3';
UPDATE users SET role = 'ROLE_BRANCH_ADMIN' WHERE role = '4';
UPDATE users SET role = 'ROLE_BRANCH_CASHIER' WHERE role = '5';
UPDATE users SET role = 'ROLE_CUSTOMER' WHERE role = '6';

-- Step 3: Verify migration
SELECT id, email, role FROM users ORDER BY id;
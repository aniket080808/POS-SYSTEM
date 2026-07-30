-- Drop legacy columns from products table
-- These columns have been migrated to branch_inventory table
-- 
-- IMPORTANT: Do NOT run this migration until you have verified:
--   1. The V20260730120001__create_branch_inventory.sql migration ran successfully
--   2. Data integrity verification passed (row counts, stock sums, selling_price sums match)
--   3. The application code has been updated to use branch_inventory instead of product-level columns
--
-- Run after verification:
--   1. Stop the application
--   2. Run this migration
--   3. Restart the application

-- Step 1: Drop the store_id column (moved to branch_inventory.store_id)
ALTER TABLE products DROP COLUMN IF EXISTS store_id;

-- Step 2: Drop the stock column (moved to branch_inventory.stock)
ALTER TABLE products DROP COLUMN IF EXISTS stock;

-- Step 3: Drop the selling_price column (moved to branch_inventory.selling_price)
ALTER TABLE products DROP COLUMN IF EXISTS selling_price;

-- Verification after running (run these to confirm):
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
-- ORDER BY ordinal_position;
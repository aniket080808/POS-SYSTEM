-- ============================================================
-- SAFE PRODUCT DATA WIPE SCRIPT
-- ============================================================
-- 
-- Deletes ALL rows from branch_inventory and products.
-- Resets auto-increment sequences back to 1.
-- Does NOT affect: categories, stores, branches, users, orders,
--   customers, or any other tables.
--
-- Run these queries in order.
-- ============================================================

-- STEP 0: Find the actual sequence names (run this first)
SELECT c.relname AS sequence_name
FROM pg_class c
WHERE c.relkind = 'S'
  AND c.relname LIKE '%product%'
ORDER BY c.relname;

-- (This will show the real sequence names, e.g.:
--  "products_id_seq" or "product_seq" or similar)

-- STEP 1: Delete branch_inventory rows first (FOREIGN KEY to products.id)
DELETE FROM branch_inventory;

-- STEP 2: Delete products rows (now that FK references are cleared)
DELETE FROM products;

-- STEP 3: Reset sequences back to 1
-- IMPORTANT: Replace the sequence names below with the actual names
-- from STEP 0 output.
-- Examples:
--   ALTER SEQUENCE products_id_seq RESTART WITH 1;
--   ALTER SEQUENCE branch_inventory_id_seq RESTART WITH 1;
-- Or if using GENERATED AS IDENTITY:
--   ALTER TABLE products ALTER COLUMN id RESTART WITH 1;
--   ALTER TABLE branch_inventory ALTER COLUMN id RESTART WITH 1;

-- ============================================================
-- VERIFICATION (run after to confirm)
-- ============================================================
-- SELECT COUNT(*) FROM branch_inventory;  -- should be 0
-- SELECT COUNT(*) FROM products;          -- should be 0
-- 
-- ============================================================
-- SAFETY NOTE
-- This script ONLY affects:
--   - branch_inventory  (truncated)
--   - products          (truncated)
-- It does NOT touch:
--   - categories, stores, branches, users, orders, customers,
--     refunds, subscriptions, or any other table.
-- ============================================================
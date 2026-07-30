-- Verification queries for branch_inventory migration
-- Run these AFTER the migration to ensure data integrity

-- 1. Check row counts match
SELECT 
    (SELECT COUNT(*) FROM products WHERE store_id IS NOT NULL) as product_rows_with_store,
    (SELECT COUNT(*) FROM branch_inventory) as inventory_rows;

-- 2. Verify stock sums match
SELECT 
    (SELECT COALESCE(SUM(stock), 0) FROM products WHERE store_id IS NOT NULL) as total_product_stock,
    (SELECT COALESCE(SUM(stock), 0) FROM branch_inventory) as total_inventory_stock;

-- 3. Verify selling_price sums match
SELECT 
    (SELECT COALESCE(SUM(selling_price), 0) FROM products WHERE store_id IS NOT NULL) as total_product_selling_price,
    (SELECT COALESCE(SUM(selling_price), 0) FROM branch_inventory) as total_inventory_selling_price;

-- 4. Check for any orphaned branch_inventory rows (should be 0)
SELECT COUNT(*) as orphaned_inventory
FROM branch_inventory bi
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.id = bi.product_id);

-- 5. Check for any products that weren't migrated (should be 0)
SELECT COUNT(*) as unmigrated_products
FROM products p
WHERE p.store_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM branch_inventory bi WHERE bi.product_id = p.id);

-- 6. Sample data check (first 10 rows)
SELECT 
    p.id as product_id,
    p.name,
    p.sku,
    bi.store_id,
    bi.stock,
    bi.selling_price,
    bi.is_active
FROM products p
JOIN branch_inventory bi ON p.id = bi.product_id
ORDER BY p.created_at DESC
LIMIT 10;
-- Create branch_inventory table for PostgreSQL
-- This table links stores/branches to products with store-specific inventory data

CREATE TABLE IF NOT EXISTS branch_inventory (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    stock INTEGER DEFAULT 0,
    selling_price DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_store_product UNIQUE (store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_branch_inventory_store_id ON branch_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_branch_inventory_product_id ON branch_inventory(product_id);

-- Backfill data from existing products table
-- Each existing product row becomes a branch_inventory row
INSERT INTO branch_inventory (store_id, product_id, stock, selling_price, is_active, created_at, updated_at)
SELECT 
    store_id,
    id,
    stock,
    selling_price,
    TRUE,
    created_at,
    updated_at
FROM products
WHERE store_id IS NOT NULL;

-- Verification query (run this to check data integrity)
-- SELECT 
--     COUNT(*) as product_count,
--     SUM(stock) as total_stock,
--     AVG(selling_price) as avg_selling_price,
--     MIN(created_at) as earliest_product,
--     MAX(created_at) as latest_product
-- FROM products;
-- 
-- SELECT 
--     COUNT(*) as inventory_count,
--     SUM(stock) as total_branch_inventory_stock,
--     AVG(selling_price) as avg_branch_selling_price,
--     COUNT(DISTINCT store_id) as store_count,
--     COUNT(DISTINCT product_id) as product_count
-- FROM branch_inventory;
-- 
-- -- Verify row counts match
-- SELECT 
--     (SELECT COUNT(*) FROM products) as product_rows,
--     (SELECT COUNT(*) FROM branch_inventory) as inventory_rows;
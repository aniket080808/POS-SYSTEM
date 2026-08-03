-- Comprehensive diagnostic to find where store contact data is stored
-- Run this against your actual database to see the real schema

-- 1. Check all tables that might contain store contact info
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%store%' OR table_name LIKE '%contact%')
ORDER BY table_name;

-- 2. Check columns in stores table that contain 'contact', 'email', or 'phone'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'stores'
  AND (column_name LIKE '%contact%' OR column_name LIKE '%email%' OR column_name LIKE '%phone%')
ORDER BY ordinal_position;

-- 3. Check if there's a separate store_contact table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'store_contact'
ORDER BY ordinal_position;

-- 4. Show sample data from stores to see actual column values
SELECT id, brand, contact FROM stores LIMIT 5;

-- 5. Check for any existing unique constraints/indexes on stores
SELECT 
    indexname,
    indexdef,
    constraint_type
FROM pg_indexes 
LEFT JOIN information_schema.table_constraints 
    ON pg_indexes.indexname = information_schema.table_constraints.constraint_name
WHERE pg_indexes.tablename = 'stores'
  AND (indexname LIKE '%contact%' OR indexname LIKE '%email%' OR indexname LIKE '%phone%')
ORDER BY indexname;
-- Diagnostic: Check actual column names for store contact fields
-- Run this to see what columns exist in the stores table

-- List all columns in stores table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- Specifically look for email and phone columns (any naming pattern)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'stores' 
AND (
    column_name ILIKE '%email%' 
    OR column_name ILIKE '%phone%'
    OR column_name ILIKE '%contact%'
)
ORDER BY column_name;
-- Add stock column to products table
-- This migration adds a stock field with a default value of 0 for existing rows

-- Add the column (nullable first to avoid issues with existing rows)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER;

-- Update existing rows to have a default value of 0
UPDATE products SET stock = 0 WHERE stock IS NULL;

-- Optional: Add NOT NULL constraint after setting defaults
-- ALTER TABLE products ALTER COLUMN stock SET NOT NULL;

-- Add default value for future inserts
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;
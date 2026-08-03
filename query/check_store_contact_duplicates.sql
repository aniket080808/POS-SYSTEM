-- CORRECTED duplicate check: Dynamically finds the actual column names
-- Run this BEFORE applying the unique index migration

DO $$
DECLARE
    email_col TEXT;
    phone_col TEXT;
BEGIN
    -- Find actual email column name
    SELECT column_name INTO email_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_email' OR column_name = 'email')
    LIMIT 1;

    SELECT column_name INTO phone_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_phone' OR column_name = 'phone')
    LIMIT 1;

    IF email_col IS NULL AND phone_col IS NULL THEN
        RAISE NOTICE 'No contact email/phone columns found. Restart the Spring Boot app so Hibernate creates them.';
    ELSE
        RAISE NOTICE 'Found email column: %, phone column: %', email_col, phone_col;
    END IF;
END $$;

-- Check duplicate emails (using dynamic SQL)
DO $$
DECLARE
    email_col TEXT;
BEGIN
    SELECT column_name INTO email_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_email' OR column_name = 'email')
    LIMIT 1;

    IF email_col IS NOT NULL THEN
        EXECUTE format(
            'SELECT %I, COUNT(*) as count, array_agg(id) as store_ids, array_agg(brand) as store_names 
             FROM stores 
             WHERE %I IS NOT NULL AND %I != '''' 
             GROUP BY %I 
             HAVING COUNT(*) > 1', 
            email_col, email_col, email_col, email_col
        );
    END IF;
END $$;

-- Check duplicate phones (using dynamic SQL)
DO $$
DECLARE
    phone_col TEXT;
BEGIN
    SELECT column_name INTO phone_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_phone' OR column_name = 'phone')
    LIMIT 1;

    IF phone_col IS NOT NULL THEN
        EXECUTE format(
            'SELECT %I, COUNT(*) as count, array_agg(id) as store_ids, array_agg(brand) as store_names 
             FROM stores 
             WHERE %I IS NOT NULL AND %I != '''' 
             GROUP BY %I 
             HAVING COUNT(*) > 1', 
            phone_col, phone_col, phone_col, phone_col
        );
    END IF;
END $$;

-- Show total stores with contact info
DO $$
DECLARE
    email_col TEXT;
    phone_col TEXT;
BEGIN
    SELECT column_name INTO email_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_email' OR column_name = 'email')
    LIMIT 1;

    SELECT column_name INTO phone_col
    FROM information_schema.columns
    WHERE table_name = 'stores'
      AND (column_name = 'contact_phone' OR column_name = 'phone')
    LIMIT 1;

    IF email_col IS NOT NULL THEN
        EXECUTE format('SELECT COUNT(*) as stores_with_email FROM stores WHERE %I IS NOT NULL', email_col);
    END IF;
    
    IF phone_col IS NOT NULL THEN
        EXECUTE format('SELECT COUNT(*) as stores_with_phone FROM stores WHERE %I IS NOT NULL', phone_col);
    END IF;
END $$;
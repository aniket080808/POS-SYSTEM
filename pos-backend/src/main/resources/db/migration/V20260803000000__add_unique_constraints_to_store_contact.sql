-- CORRECTED Migration: Add unique constraints to store contact email and phone
-- 
-- IMPORTANT: Run this AFTER restarting the Spring Boot application so Hibernate
-- can create the contact columns first (ddl-auto: update in application.yml).
--
-- This migration dynamically discovers the actual column names and creates
-- unique indexes on them. It is safe to run multiple times.

DO $$
DECLARE
    email_col TEXT;
    phone_col TEXT;
BEGIN
    -- Dynamically find the email column in stores table
    -- Hibernate @Embedded fields are typically named: contact_email, contact_phone
    -- But they could also be just: email, phone (depending on naming strategy)
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

    -- Create unique index on email column if found
    IF email_col IS NOT NULL THEN
        BEGIN
            EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS uk_store_contact_email ON stores (%I)', email_col);
            RAISE NOTICE 'SUCCESS: Created unique index on column: %', email_col;
        EXCEPTION 
            WHEN duplicate_table THEN
                RAISE NOTICE 'SKIPPED: Unique index on % already exists', email_col;
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Could not create index on % - %', email_col, SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'PENDING: No email column found in stores table. Restart the application first so Hibernate creates it.';
    END IF;

    -- Create unique index on phone column if found
    IF phone_col IS NOT NULL THEN
        BEGIN
            EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS uk_store_contact_phone ON stores (%I)', phone_col);
            RAISE NOTICE 'SUCCESS: Created unique index on column: %', phone_col;
        EXCEPTION 
            WHEN duplicate_table THEN
                RAISE NOTICE 'SKIPPED: Unique index on % already exists', phone_col;
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Could not create index on % - %', phone_col, SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'PENDING: No phone column found in stores table. Restart the application first so Hibernate creates it.';
    END IF;
END $$;

-- VERIFICATION: Check if indexes were actually created
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'stores'
  AND indexname IN ('uk_store_contact_email', 'uk_store_contact_phone');

-- DIAGNOSTIC: Show all columns in stores table for reference
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stores'
ORDER BY ordinal_position;
-- Migration: Drop stale check constraints on orders and refunds for payment_type and status
-- This allows newly added PaymentType enum values (SPLIT, STORE_CREDIT) and OrderStatus values to be persisted without DB check constraint conflicts.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_type_check;
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        RAISE NOTICE 'SUCCESS: orders check constraints updated successfully.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'refunds'
    ) THEN
        ALTER TABLE refunds DROP CONSTRAINT IF EXISTS refunds_payment_type_check;
        ALTER TABLE refunds DROP CONSTRAINT IF EXISTS refunds_status_check;
        RAISE NOTICE 'SUCCESS: refunds check constraints updated successfully.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'inventories'
    ) THEN
        CREATE SEQUENCE IF NOT EXISTS inventories_id_seq;
        ALTER TABLE inventories ALTER COLUMN id SET DEFAULT nextval('inventories_id_seq');
        PERFORM setval('inventories_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM inventories), 0) + 1, 1), false);
        RAISE NOTICE 'SUCCESS: inventories ID sequence initialized successfully.';
    END IF;
END $$;

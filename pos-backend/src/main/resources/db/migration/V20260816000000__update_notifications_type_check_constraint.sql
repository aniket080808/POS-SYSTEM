-- Migration: Update notifications_type_check constraint to include all NotificationType enum values
-- Safe and idempotent to run multiple times across PostgreSQL environments.

DO $$
BEGIN
    -- Check if notifications table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'notifications'
    ) THEN
        -- Drop existing check constraint if present
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

        -- Recreate check constraint with all 16 operational NotificationType enum values
        ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
            type::text = ANY (ARRAY[
                'STORE_REGISTERED'::character varying,
                'STORE_APPROVED'::character varying,
                'STORE_REJECTED'::character varying,
                'STORE_BLOCKED'::character varying,
                'STORE_UNBLOCKED'::character varying,
                'STORE_DELETED'::character varying,
                'SUBSCRIPTION_APPROVED'::character varying,
                'SUBSCRIPTION_REJECTED'::character varying,
                'PROFILE_UPDATED'::character varying,
                'SYSTEM_ALERT'::character varying,
                'ORDER_CREATED'::character varying,
                'LOW_STOCK_ALERT'::character varying,
                'REFUND_CREATED'::character varying,
                'SHIFT_STARTED'::character varying,
                'SHIFT_ENDED'::character varying,
                'EMPLOYEE_ADDED'::character varying
            ]::text[])
        );
        RAISE NOTICE 'SUCCESS: notifications_type_check constraint updated successfully.';
    END IF;
END $$;

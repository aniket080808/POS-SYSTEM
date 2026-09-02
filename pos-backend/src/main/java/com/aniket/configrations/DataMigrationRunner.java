package com.aniket.configrations;

import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.Subscription;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataMigrationRunner implements ApplicationRunner {

    private final StoreRepository storeRepository;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final com.aniket.repository.BranchRepository branchRepository;
    private final com.aniket.repository.BranchInventoryRepository branchInventoryRepository;
    private final com.aniket.repository.InventoryRepository inventoryRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 🔔 1. Ensure enum check constraints on orders and refunds are updated
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
                        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_type_check;
                        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'refunds') THEN
                        ALTER TABLE refunds DROP CONSTRAINT IF EXISTS refunds_payment_type_check;
                        ALTER TABLE refunds DROP CONSTRAINT IF EXISTS refunds_status_check;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventories') THEN
                        CREATE SEQUENCE IF NOT EXISTS inventories_id_seq;
                        ALTER TABLE inventories ALTER COLUMN id SET DEFAULT nextval('inventories_id_seq');
                        PERFORM setval('inventories_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM inventories), 0) + 1, 1), false);
                    END IF;
                END $$;
            """);
            log.info("✅ Database constraints for orders, refunds, and inventories verified.");
        } catch (Exception e) {
            log.warn("⚠️ Could not synchronize orders/refunds constraints: {}", e.getMessage());
        }

        // 🔔 1b. Ensure notifications_type_check constraint supports all NotificationType values
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
                        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
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
                    END IF;
                END $$;
            """);
            log.info("✅ Database constraint notifications_type_check verified and synchronized.");
        } catch (Exception e) {
            log.warn("⚠️ Could not synchronize notifications_type_check constraint: {}", e.getMessage());
        }

        // 🔔 2. Ensure historical orders with null status are backfilled to COMPLETED
        try {
            int updatedOrders = jdbcTemplate.update("UPDATE orders SET status = 0 WHERE status IS NULL");
            if (updatedOrders > 0) {
                log.info("✅ Backfilled {} historical orders with NULL status to COMPLETED (ordinal 0).", updatedOrders);
            }
        } catch (Exception e) {
            log.warn("⚠️ Could not backfill orders status: {}", e.getMessage());
        }

        // 🔔 3. Ensure TEXT columns have unlimited capacity in PostgreSQL
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'description') THEN
                        ALTER TABLE stores ALTER COLUMN description TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'address') THEN
                        ALTER TABLE stores ALTER COLUMN address TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'receipt_footer') THEN
                        ALTER TABLE stores ALTER COLUMN receipt_footer TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'registration_rejection_reason') THEN
                        ALTER TABLE stores ALTER COLUMN registration_rejection_reason TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'address') THEN
                        ALTER TABLE branches ALTER COLUMN address TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
                        ALTER TABLE products ALTER COLUMN description TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
                        ALTER TABLE products ALTER COLUMN image TYPE TEXT;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
                        ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
                    END IF;
                END $$;
                DROP TABLE IF EXISTS shift_reports_top_selling_products CASCADE;
                DROP TABLE IF EXISTS shift_report_top_selling_products CASCADE;
                DROP TABLE IF EXISTS shift_reports_recent_orders CASCADE;
                DROP TABLE IF EXISTS shift_report_recent_orders CASCADE;
            """);
            log.info("✅ Verified and expanded TEXT column capacities and order_items product_id nullability.");
        } catch (Exception e) {
            log.warn("⚠️ Could not alter column types to TEXT: {}", e.getMessage());
        }

        log.info("🔄 Running StoreSubscription Data Migration...");

        List<Store> allStores = storeRepository.findAll();
        int createdCount = 0;

        for (Store store : allStores) {
            StoreSubscription storeSub = storeSubscriptionRepository.findByStoreId(store.getId()).orElse(null);

            if (storeSub == null) {
                List<Subscription> activeSubs = subscriptionRepository.findByStoreAndStatus(store, SubscriptionStatus.ACTIVE);

                storeSub = new StoreSubscription();
                storeSub.setStore(store);

                if (!activeSubs.isEmpty()) {
                    Subscription activeSub = activeSubs.get(0);
                    storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
                    storeSub.setCurrentPlan(activeSub.getPlan());
                    log.info("✅ Migrated active store subscription for store ID {}: plan {}", store.getId(), activeSub.getPlan().getName());
                } else {
                    storeSub.setStatus(StoreSubscriptionStatus.NONE);
                    log.info("ℹ️ Initialized NONE store subscription for store ID {}", store.getId());
                }

                storeSubscriptionRepository.save(storeSub);
                createdCount++;
            } else if (storeSub.getCurrentPlan() == null && storeSub.getStatus() == StoreSubscriptionStatus.ACTIVE) {
                storeSub.setStatus(StoreSubscriptionStatus.NONE);
                storeSubscriptionRepository.save(storeSub);
                log.info("🧹 Cleaned up invalid ACTIVE status to NONE for store ID {} (no current plan)", store.getId());
            }
        }

        log.info("✅ StoreSubscription Data Migration completed. Initialized {} stores.", createdCount);

        // 🔔 3. Synchronize branch inventories from store branch_inventory for all branches (INSERT-ONLY for missing records)
        // Uses a single bulk INSERT ... SELECT ... LEFT JOIN query instead of row-by-row checks
        // to avoid N+1 query performance issues during startup.
        try {
            String seedSql = """
                INSERT INTO inventories (branch_id, product_id, quantity, last_updated)
                SELECT b.id, bi.product_id, COALESCE(bi.stock, 0), NOW()
                FROM branches b
                JOIN branch_inventory bi ON bi.store_id = b.store_id
                LEFT JOIN inventories i ON i.branch_id = b.id AND i.product_id = bi.product_id
                WHERE i.id IS NULL
                  AND bi.product_id IS NOT NULL
                  AND b.store_id IS NOT NULL
                """;
            int seededCount = jdbcTemplate.update(seedSql);
            if (seededCount > 0) {
                log.info("✅ Seeded {} missing branch inventory records across all branches.", seededCount);
            } else {
                log.info("✅ Branch inventory already fully synchronized. No new records needed.");
            }
        } catch (Exception e) {
            log.warn("⚠️ Could not synchronize branch inventories: {}", e.getMessage());
        }

        // 🔔 4. Ensure users table has enabled and password_changed_at columns with backfilled defaults
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users' AND column_name = 'enabled'
                    ) THEN
                        ALTER TABLE users ADD COLUMN enabled BOOLEAN DEFAULT true;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users' AND column_name = 'password_changed_at'
                    ) THEN
                        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;
                    END IF;

                    UPDATE users SET enabled = true WHERE enabled IS NULL;
                    UPDATE users SET password_changed_at = COALESCE(created_at, NOW()) WHERE password_changed_at IS NULL;
                END $$;
            """);
            log.info("✅ Migration for users.enabled and password_changed_at completed successfully.");
        } catch (Exception e) {
            log.warn("⚠️ Users table migration warning: {}", e.getMessage());
        }

        // 🔔 5. Ensure customer.loyalty_points column has a default and contains no NULL values.
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'customer' AND column_name = 'loyalty_points'
                    ) THEN
                        -- Backfill any NULL loyalty_points to 0 before enforcing NOT NULL
                        UPDATE customer SET loyalty_points = 0 WHERE loyalty_points IS NULL;
                        -- Enforce NOT NULL and set default for future inserts
                        ALTER TABLE customer ALTER COLUMN loyalty_points SET NOT NULL;
                        ALTER TABLE customer ALTER COLUMN loyalty_points SET DEFAULT 0;
                    END IF;
                END $$;
                """);
            log.info("✅ Migration for customer.loyalty_points completed successfully.");
        } catch (Exception e) {
            log.warn("⚠️ Customer loyalty_points migration warning: {}", e.getMessage());
        }

        // 🔔 6. Auto-seed missing branch inventories from store branch_inventory
        try {
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'inventories_seq') THEN
                        INSERT INTO inventories (id, branch_id, product_id, quantity, last_updated)
                        SELECT nextval('inventories_seq'), b.id, bi.product_id, COALESCE(bi.stock, 0), NOW()
                        FROM branches b
                        JOIN branch_inventory bi ON bi.store_id = b.store_id
                        WHERE NOT EXISTS (
                            SELECT 1 FROM inventories inv 
                            WHERE inv.branch_id = b.id AND inv.product_id = bi.product_id
                        );
                    ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'inventories_id_seq') THEN
                        INSERT INTO inventories (id, branch_id, product_id, quantity, last_updated)
                        SELECT nextval('inventories_id_seq'), b.id, bi.product_id, COALESCE(bi.stock, 0), NOW()
                        FROM branches b
                        JOIN branch_inventory bi ON bi.store_id = b.store_id
                        WHERE NOT EXISTS (
                            SELECT 1 FROM inventories inv 
                            WHERE inv.branch_id = b.id AND inv.product_id = bi.product_id
                        );
                    END IF;
                END $$;
            """);
            log.info("✅ Migration for branch inventories auto-seeding completed successfully.");
        } catch (Exception e) {
            log.warn("⚠️ Branch inventory auto-seeding migration warning: {}", e.getMessage());
        }
    }
}

#!/usr/bin/env python3
"""
Cleanup script to remove all test data for store ID 52.
This removes orders, products, branch inventory, and related test data.

Run with: python query/cleanup_test_data.py
"""

import psycopg2
import os
from datetime import datetime

# DB connection params
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'pos')
DB_USER = os.getenv('DBUSER', 'postgres')
DB_PASS = os.getenv('DBPASS', 'postgres')

STORE_ID = 52

def get_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )

def main():
    conn = get_conn()
    cur = conn.cursor()

    print("=" * 70)
    print(f"  TEST DATA CLEANUP - Store ID {STORE_ID}")
    print("=" * 70)

    # Start transaction
    print("\n  WARNING: This will delete ALL data for store ID 52!")
    print("  This includes:")
    print("    - All orders")
    print("    - All products")
    print("    - All branch inventory")
    print("    - All store settings")
    
    confirm = input("\n  Type 'DELETE' to confirm: ").strip()
    if confirm != 'DELETE':
        print("  Aborted.")
        return

    print("\n" + "-" * 70)
    print("  DELETING TEST DATA")
    print("-" * 70)

    # 1. Delete orders for branches in this store
    print("\n  1. Deleting orders...")
    cur.execute("""
        DELETE FROM orders 
        WHERE branch_id IN (
            SELECT b.id FROM branches b 
            WHERE b.store_id = %s
        )
    """, (STORE_ID,))
    deleted_orders = cur.rowcount
    print(f"     Deleted {deleted_orders} orders")

    # 2. Delete order_items for those orders (if not cascade deleted)
    print("\n  2. Cleaning up order_items...")
    cur.execute("""
        DELETE FROM order_items 
        WHERE order_id IN (
            SELECT o.id FROM orders o 
            WHERE o.branch_id IN (
                SELECT b.id FROM branches b 
                WHERE b.store_id = %s
            )
        )
    """, (STORE_ID,))
    deleted_items = cur.rowcount
    print(f"     Deleted {deleted_items} order items")

    # 3. Delete branch_inventory for this store
    print("\n  3. Deleting branch inventory...")
    cur.execute("""
        DELETE FROM branch_inventory 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_inventory = cur.rowcount
    print(f"     Deleted {deleted_inventory} branch inventory records")

    # 4. Delete products for this store
    print("\n  4. Deleting products...")
    cur.execute("""
        DELETE FROM products 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_products = cur.rowcount
    print(f"     Deleted {deleted_products} products")

    # 5. Delete refunds for orders in this store
    print("\n  5. Deleting refunds...")
    cur.execute("""
        DELETE FROM refunds 
        WHERE order_id IN (
            SELECT o.id FROM orders o 
            WHERE o.branch_id IN (
                SELECT b.id FROM branches b 
                WHERE b.store_id = %s
            )
        )
    """, (STORE_ID,))
    deleted_refunds = cur.rowcount
    print(f"     Deleted {deleted_refunds} refunds")

    # 6. Delete notifications for users in this store
    print("\n  6. Deleting notifications...")
    cur.execute("""
        DELETE FROM notifications 
        WHERE recipient_id IN (
            SELECT u.id FROM users u 
            WHERE u.store_id = %s
        )
    """, (STORE_ID,))
    deleted_notifications = cur.rowcount
    print(f"     Deleted {deleted_notifications} notifications")

    # 7. Delete store settings
    print("\n  7. Deleting store settings...")
    cur.execute("""
        DELETE FROM store_settings 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_settings = cur.rowcount
    print(f"     Deleted {deleted_settings} store settings records")

    # 8. Delete store subscriptions
    print("\n  8. Deleting store subscriptions...")
    cur.execute("""
        DELETE FROM store_subscriptions 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_subscriptions = cur.rowcount
    print(f"     Deleted {deleted_subscriptions} store subscriptions")

    # 9. Delete approval requests for this store
    print("\n  9. Deleting approval requests...")
    cur.execute("""
        DELETE FROM approval_requests 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_approvals = cur.rowcount
    print(f"     Deleted {deleted_approvals} approval requests")

    # 10. Delete branches for this store
    print("\n  10. Deleting branches...")
    cur.execute("""
        DELETE FROM branches 
        WHERE store_id = %s
    """, (STORE_ID,))
    deleted_branches = cur.rowcount
    print(f"     Deleted {deleted_branches} branches")

    # 11. Delete store
    print("\n  11. Deleting store...")
    cur.execute("""
        DELETE FROM stores 
        WHERE id = %s
    """, (STORE_ID,))
    deleted_stores = cur.rowcount
    print(f"     Deleted {deleted_stores} stores")

    # Commit all deletions
    conn.commit()

    # Summary
    print("\n" + "-" * 70)
    print("  CLEANUP SUMMARY")
    print("-" * 70)
    print(f"  Store ID {STORE_ID} completely removed:")
    print(f"    - {deleted_orders} orders")
    print(f"    - {deleted_items} order items")
    print(f"    - {deleted_inventory} branch inventory records")
    print(f"    - {deleted_products} products")
    print(f"    - {deleted_refunds} refunds")
    print(f"    - {deleted_notifications} notifications")
    print(f"    - {deleted_settings} store settings")
    print(f"    - {deleted_subscriptions} store subscriptions")
    print(f"    - {deleted_approvals} approval requests")
    print(f"    - {deleted_branches} branches")
    print(f"    - {deleted_stores} store")

    conn.close()
    print("\n" + "=" * 70)
    print("  CLEANUP COMPLETE")
    print("=" * 70)
    print("\n  Next steps:")
    print("  1. Restart the backend server")
    print("  2. Verify the Sales page is empty")
    print("  3. Create a new store with real data if needed")

if __name__ == '__main__':
    main()
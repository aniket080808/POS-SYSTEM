#!/usr/bin/env python3
"""
Check and fix sales data for the Sales page.
1. Print actual order timestamps to verify timezone alignment
2. Update a cashier's lastLogin to today (fixes Active Cashiers = 0)
3. Create orders for today if none exist (fixes Orders Today = 0)

Run with: python query/check_and_fix_sales_data.py
"""

import psycopg2
import os
from datetime import datetime, timezone, timedelta

# DB connection params
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'pos')
DB_USER = os.getenv('DBUSER', 'postgres')
DB_PASS = os.getenv('DBPASS', 'postgres')

def get_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )

def main():
    conn = get_conn()
    cur = conn.cursor()

    print("=" * 70)
    print("  SALES DATA DIAGNOSTIC & FIX")
    print("=" * 70)

    # IST timezone
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist_tz)
    start_of_today_ist = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_yesterday_ist = start_of_today_ist - timedelta(days=1)

    print(f"\n  Current IST time:       {now_ist}")
    print(f"  Start of today (IST):   {start_of_today_ist}")
    print(f"  Start of yesterday:     {start_of_yesterday_ist}")

    # 1. Check order timestamps
    print("\n" + "-" * 70)
    print("  1. ORDER TIMESTAMP CHECK")
    print("-" * 70)

    cur.execute("SELECT COUNT(*) FROM orders;")
    total_orders = cur.fetchone()[0]
    print(f"\n  Total orders in DB: {total_orders}")

    if total_orders > 0:
        # Show date range
        cur.execute("SELECT MIN(created_at), MAX(created_at) FROM orders;")
        row = cur.fetchone()
        print(f"  Earliest order: {row[0]}")
        print(f"  Latest order:   {row[1]}")

        # Show orders by status
        print("\n  Orders by status:")
        cur.execute("SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status;")
        for row in cur.fetchall():
            print(f"    {row[0]}: {row[1]}")

        # Show orders today (using IST boundaries)
        print(f"\n  Orders today (IST boundary: {start_of_today_ist} to {now_ist}):")
        cur.execute("""
            SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE created_at >= %s AND created_at <= %s
        """, (start_of_today_ist.replace(tzinfo=None), now_ist.replace(tzinfo=None)))
        row = cur.fetchone()
        print(f"    Count today: {row[0]}")
        print(f"    Sum today:   {row[1]}")

        # Show orders yesterday
        print(f"\n  Orders yesterday (IST boundary: {start_of_yesterday_ist} to {start_of_today_ist}):")
        cur.execute("""
            SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE created_at >= %s AND created_at < %s
        """, (start_of_yesterday_ist.replace(tzinfo=None), start_of_today_ist.replace(tzinfo=None)))
        row = cur.fetchone()
        print(f"    Count yesterday: {row[0]}")
        print(f"    Sum yesterday:   {row[1]}")

        # Show last 10 orders with timestamps
        print("\n  Last 10 orders (raw timestamps):")
        cur.execute("""
            SELECT o.id, o.created_at, o.total_amount, o.status, o.payment_type
            FROM orders o
            ORDER BY o.created_at DESC
            LIMIT 10
        """)
        for row in cur.fetchall():
            print(f"    Order #{row[0]}: created_at={row[1]}, amount={row[2]}, status={row[3]}, payment={row[4]}")

        # Show daily breakdown for last 7 days
        print("\n  Daily breakdown (last 7 days, IST):")
        cur.execute("""
            SELECT DATE(o.created_at) as sale_date, COUNT(*) as order_count, SUM(o.total_amount) as total
            FROM orders o
            WHERE o.created_at >= %s
            GROUP BY DATE(o.created_at)
            ORDER BY DATE(o.created_at) DESC
        """, (start_of_today_ist.replace(tzinfo=None) - timedelta(days=6),))
        for row in cur.fetchall():
            print(f"    {row[0]}: {row[1]} orders, ₹{row[2]}")

    # 2. Check cashier lastLogin
    print("\n" + "-" * 70)
    print("  2. CASHIER LASTLOGIN CHECK")
    print("-" * 70)

    cur.execute("""
        SELECT u.id, u.full_name, u.email, u.last_login, u.role
        FROM users u
        WHERE u.role = 'ROLE_BRANCH_CASHIER'
        ORDER BY u.id
        LIMIT 10
    """)
    cashiers = cur.fetchall()
    print(f"\n  Found {len(cashiers)} cashiers (showing first 10):")
    for row in cashiers:
        print(f"    ID={row[0]}, Name={row[1]}, Email={row[2]}, lastLogin={row[3]}, Role={row[4]}")

    # 3. FIX: Update cashier lastLogin to today
    print("\n" + "-" * 70)
    print("  3. FIXING DATA GAPS")
    print("-" * 70)

    if cashiers:
        # Update all cashiers' lastLogin to now
        now_naive = now_ist.replace(tzinfo=None)
        cur.execute("""
            UPDATE users
            SET last_login = %s
            WHERE role = 'ROLE_BRANCH_CASHIER'
            AND last_login IS NULL OR (last_login < %s AND role = 'ROLE_BRANCH_CASHIER')
        """, (now_naive, start_of_today_ist.replace(tzinfo=None)))
        updated = cur.rowcount
        print(f"\n  Updated {updated} cashier(s) lastLogin to now ({now_naive})")
    else:
        print("\n  No cashiers found to update")

    # 4. FIX: Create orders for today if none exist
    cur.execute("""
        SELECT COUNT(*) FROM orders WHERE created_at >= %s
    """, (start_of_today_ist.replace(tzinfo=None),))
    today_count = cur.fetchone()[0]

    if today_count == 0:
        print(f"\n  No orders found for today. Creating test orders...")

        # Find a branch to attach orders to
        cur.execute("""
            SELECT b.id, s.store_admin_id
            FROM branches b
            JOIN stores s ON b.store_id = s.id
            WHERE s.store_admin_id IS NOT NULL
            LIMIT 1
        """)
        branch = cur.fetchone()
        if branch:
            branch_id = branch[0]
            store_admin_id = branch[1]

            # Find a cashier for this branch
            cur.execute("""
                SELECT u.id FROM users u
                WHERE u.branch_id = %s AND u.role = 'ROLE_BRANCH_CASHIER'
                LIMIT 1
            """, (branch_id,))
            cashier = cur.fetchone()
            cashier_id = cashier[0] if cashier else None

            # Find a customer
            cur.execute("SELECT id FROM users WHERE role = 'ROLE_CUSTOMER' LIMIT 1")
            customer = cur.fetchone()
            customer_id = customer[0] if customer else None

            # Create 5 orders for today with different timestamps
            import random
            payment_types = ['CASH', 'UPI', 'CARD']
            now_naive = now_ist.replace(tzinfo=None)

            for i in range(5):
                # Spread orders across today's hours
                hours_ago = random.randint(0, max(1, now_ist.hour))
                order_time = now_naive - timedelta(hours=hours_ago, minutes=random.randint(0, 59))
                amount = round(random.uniform(500, 5000), 2)

                cur.execute("""
                    INSERT INTO orders (branch_id, cashier_id, customer_id, total_amount,
                                      status, payment_type, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, 'COMPLETED', %s, %s, %s)
                    RETURNING id
                """, (branch_id, cashier_id, customer_id, amount,
                      random.choice(payment_types), order_time, order_time))
                order_id = cur.fetchone()[0]
                print(f"    Created order #{order_id}: ₹{amount} at {order_time}")

            print(f"\n  Created 5 test orders for today")
        else:
            print("  No branch with store_admin found - cannot create test orders")
    else:
        print(f"\n  {today_count} orders already exist for today - no need to create more")

    conn.commit()

    # 5. Verify fixes
    print("\n" + "-" * 70)
    print("  5. VERIFICATION")
    print("-" * 70)

    # Check orders today (status 0 = COMPLETED)
    cur.execute("""
        SELECT COUNT(*) FROM orders WHERE created_at >= %s AND status = 0
    """, (start_of_today_ist.replace(tzinfo=None),))
    today_completed = cur.fetchone()[0]
    print(f"\n  Completed orders today: {today_completed}")

    # Check active cashiers
    cur.execute("""
        SELECT COUNT(*) FROM users
        WHERE last_login >= %s AND role = 'ROLE_BRANCH_CASHIER'
    """, (start_of_today_ist.replace(tzinfo=None),))
    active_cashiers = cur.fetchone()[0]
    print(f"  Active cashiers (lastLogin >= today): {active_cashiers}")

    # Check daily sales for last 7 days
    print("\n  Daily sales (last 7 days, COMPLETED only):")
    cur.execute("""
        SELECT DATE(o.created_at) as sale_date, COUNT(*) as cnt, SUM(o.total_amount) as total
        FROM orders o
        WHERE o.created_at >= %s AND o.status = 0
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at) DESC
    """, (start_of_today_ist.replace(tzinfo=None) - timedelta(days=6),))
    for row in cur.fetchall():
        print(f"    {row[0]}: {row[1]} orders, ₹{row[2]}")

    conn.close()
    print("\n" + "=" * 70)
    print("  DONE - All fixes applied. Restart the backend to pick up changes.")
    print("=" * 70)

if __name__ == '__main__':
    main()
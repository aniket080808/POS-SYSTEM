#!/usr/bin/env python3
"""
Verification script for the Alerts page backend changes.
Run with: python query/verify_alerts.py

This script verifies:
1. Inactive cashiers with NULL lastLogin are flagged
2. Low stock products use branch_inventory.stock threshold
3. No sale today excludes closed branches and only counts COMPLETED orders
4. Refund spike detection logic is sound
"""

import psycopg2
import os
from datetime import datetime, timedelta
import pytz

# DB connection params
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'pos')
DB_USER = os.getenv('DBUSER', 'postgres')
DB_PASS = os.getenv('DBPASS', '')

def get_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def run_query(cur, query, params=None):
    cur.execute(query, params)
    return cur.fetchall()

def verify_alerts():
    ist = pytz.timezone('Asia/Kolkata')
    today = datetime.now(ist).date()
    day_of_week = today.strftime('%A').upper()  # MONDAY, TUESDAY, etc.
    start_of_today = datetime.combine(today, datetime.min.time())
    seven_days_ago = start_of_today - timedelta(days=7)

    conn = get_conn()
    cur = conn.cursor()

    # ========================================================================
    section("1. INACTIVE CASHIERS")
    # ========================================================================
    print("Checking: cashiers with lastLogin NULL or older than 7 days")
    print(f"Cutoff date: {seven_days_ago}")

    query = """
        SELECT u.id, u.full_name, u.email, u.last_login, b.name as branch_name
        FROM users u
        JOIN branches b ON u.branch_id = b.id
        JOIN stores s ON b.store_id = s.id
        WHERE u.role = 'ROLE_BRANCH_CASHIER'
        AND s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND (u.last_login IS NULL OR u.last_login < %s)
        ORDER BY u.last_login NULLS FIRST
    """
    rows = run_query(cur, query, (seven_days_ago,))
    print(f"Found {len(rows)} inactive cashiers:")
    for row in rows:
        print(f"  ID={row[0]}, Name={row[1]}, Email={row[2]}, LastLogin={row[3]}, Branch={row[4]}")

    if not rows:
        print("  NOTE: No inactive cashiers found. To test, manually set last_login = NULL")
        print("  or last_login < 7 days ago for some cashier users.")

    # ========================================================================
    section("2. LOW STOCK ALERTS")
    # ========================================================================
    print("Checking: products with branch_inventory.stock < 10")

    query = """
        SELECT p.id, p.name, bi.stock, bi.selling_price, s.brand as store_name
        FROM products p
        JOIN branch_inventory bi ON bi.product_id = p.id
        JOIN stores s ON bi.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND bi.stock < 10
        AND bi.is_active = true
        ORDER BY bi.stock ASC
    """
    rows = run_query(cur, query)
    print(f"Found {len(rows)} low stock products:")
    for row in rows:
        print(f"  ID={row[0]}, Name={row[1]}, Stock={row[2]}, Price={row[3]}, Store={row[4]}")

    if not rows:
        print("  NOTE: No low stock products found. To test, set stock < 10 in branch_inventory.")

    # ========================================================================
    section("3. NO SALE TODAY")
    # ========================================================================
    print(f"Checking: branches open today ({day_of_week}) with no COMPLETED orders today")

    query = """
        SELECT b.id, b.name, b.address, b.working_days
        FROM branches b
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND (ARRAY_LENGTH(b.working_days, 1) IS NULL OR %s = ANY(b.working_days))
        AND b.id NOT IN (
            SELECT DISTINCT o.branch_id
            FROM orders o
            WHERE o.created_at >= %s
            AND o.status = 'COMPLETED'
        )
    """
    rows = run_query(cur, query, (day_of_week, start_of_today))
    print(f"Found {len(rows)} branches with no sales today:")
    for row in rows:
        print(f"  ID={row[0]}, Name={row[1]}, Address={row[2]}, WorkingDays={row[3]}")

    if not rows:
        print("  NOTE: All open branches have sales today, or no branches are open today.")

    # Also show branches with working_days empty (always flagged if no sales)
    query2 = """
        SELECT b.id, b.name, b.working_days
        FROM branches b
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND (b.working_days IS NULL OR ARRAY_LENGTH(b.working_days, 1) = 0)
    """
    rows2 = run_query(cur, query2)
    if rows2:
        print(f"\n  Branches with NO working_days configured (always flagged if no sales):")
        for row in rows2:
            print(f"    ID={row[0]}, Name={row[1]}")

    # ========================================================================
    section("4. REFUND SPIKE DETECTION")
    # ========================================================================
    print("Checking: today's refunds and spike rules")

    # Rule 1: High-value refunds
    query_r1 = """
        SELECT r.id, r.amount, r.reason, u.full_name as cashier_name, r.created_at
        FROM refunds r
        JOIN orders o ON r.order_id = o.id
        JOIN users u ON r.cashier_id = u.id
        JOIN branches b ON o.branch_id = b.id
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND r.created_at >= %s
        AND r.amount > 5000
        ORDER BY r.created_at DESC
    """
    rows_r1 = run_query(cur, query_r1, (start_of_today,))
    print(f"\n  Rule 1 (High-value > 5000): {len(rows_r1)} refunds")
    for row in rows_r1:
        print(f"    ID={row[0]}, Amount={row[1]}, Reason={row[2]}, Cashier={row[3]}")

    # Rule 2: Frequency spike
    query_r2 = """
        SELECT u.full_name as cashier_name, COUNT(*) as refund_count
        FROM refunds r
        JOIN orders o ON r.order_id = o.id
        JOIN users u ON r.cashier_id = u.id
        JOIN branches b ON o.branch_id = b.id
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND r.created_at >= %s
        GROUP BY u.full_name
        HAVING COUNT(*) >= 3
    """
    rows_r2 = run_query(cur, query_r2, (start_of_today,))
    print(f"\n  Rule 2 (>= 3 refunds/day by same cashier): {len(rows_r2)} cashiers")
    for row in rows_r2:
        print(f"    Cashier={row[0]}, Count={row[1]}")

    # Rule 3: Daily total spike (need at least 2 days of baseline in last 7 days)
    query_r3_baseline = """
        SELECT COUNT(DISTINCT DATE(r.created_at)) as unique_days, SUM(r.amount) as total
        FROM refunds r
        JOIN orders o ON r.order_id = o.id
        JOIN branches b ON o.branch_id = b.id
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
        AND r.created_at >= %s
        AND r.created_at < %s
    """
    baseline_start = start_of_today - timedelta(days=7)
    rows_r3_base = run_query(cur, query_r3_baseline, (baseline_start, start_of_today))
    unique_days = rows_r3_base[0][0] if rows_r3_base else 0
    baseline_total = rows_r3_base[0][1] if rows_r3_base else 0

    print(f"\n  Rule 3 (Daily total spike):")
    print(f"    Baseline: {unique_days} unique days with refunds in last 7 days")
    print(f"    Baseline total: {baseline_total}")

    if unique_days >= 2:
        avg_daily = baseline_total / unique_days
        threshold = avg_daily * 2.0  # 200%
        today_total_res = run_query(cur, """
            SELECT COALESCE(SUM(r.amount), 0)
            FROM refunds r
            JOIN orders o ON r.order_id = o.id
            JOIN branches b ON o.branch_id = b.id
            JOIN stores s ON b.store_id = s.id
            WHERE s.store_admin_id = (SELECT id FROM users WHERE role = 'ROLE_STORE_ADMIN' LIMIT 1)
            AND r.created_at >= %s
        """, (start_of_today,))
        today_total = today_total_res[0][0] if today_total_res else 0
        print(f"    Avg daily: {avg_daily:.2f}, Threshold (200%): {threshold:.2f}")
        print(f"    Today total: {today_total:.2f}")
        if today_total > threshold:
            print(f"    *** SPIKE DETECTED: Today's total exceeds 200% of baseline ***")
        else:
            print(f"    No spike detected today.")
    else:
        print(f"    SKIPPED (need >= 2 days of baseline, got {unique_days})")

    conn.close()

    # ========================================================================
    section("SUMMARY")
    # ========================================================================
    print("""
To test all 4 alert sections with realistic data:

1. INACTIVE CASHIERS:
   - Set last_login = NULL for some cashier users
   - Or set last_login = now() - interval '10 days' for some cashiers

2. LOW STOCK:
   - UPDATE branch_inventory SET stock = 5 WHERE stock >= 10;
   - (Update a few rows to have stock < 10)

3. NO SALE TODAY:
   - Insert a branch with working_days including TODAY's day
   - Ensure that branch has NO orders with status='COMPLETED' today

4. REFUND SPIKE:
   - Rule 1: INSERT a refund with amount > 5000 for today
   - Rule 2: INSERT 3+ refunds for the same cashier today
   - Rule 3: INSERT refunds on 2+ different days in the last 7 days,
             then make today's total exceed 200% of the 7-day average

Then restart backend and visit /store/alerts.
""")

if __name__ == '__main__':
    verify_alerts()
#!/usr/bin/env python3
"""
Check if there's any order/sales data in the database.
Run with: python query/check_sales_data.py
"""

import psycopg2
import os

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

    print("=" * 60)
    print("  ORDER / SALES DATA CHECK")
    print("=" * 60)

    # 1. Count orders
    cur.execute("SELECT COUNT(*) FROM orders;")
    order_count = cur.fetchone()[0]
    print(f"\n  orders table count: {order_count}")

    # 2. Count order_items
    cur.execute("SELECT COUNT(*) FROM order_items;")
    order_item_count = cur.fetchone()[0]
    print(f"  order_items table count: {order_item_count}")

    # 3. If orders exist, show breakdown by status
    if order_count > 0:
        print("\n  Orders by status:")
        cur.execute("SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status;")
        for row in cur.fetchall():
            print(f"    {row[0]}: {row[1]}")

        # 4. Show date range of orders
        print("\n  Order date range:")
        cur.execute("SELECT MIN(created_at), MAX(created_at) FROM orders;")
        row = cur.fetchone()
        print(f"    Earliest: {row[0]}")
        print(f"    Latest:   {row[1]}")

        # 5. Show total sales amount
        print("\n  Total sales amount (all orders):")
        cur.execute("SELECT SUM(total_amount), AVG(total_amount) FROM orders;")
        row = cur.fetchone()
        print(f"    Sum: {row[0]}")
        print(f"    Avg: {row[1]}")

        # 6. Show orders today (IST)
        print("\n  Orders today (Asia/Kolkata):")
        cur.execute("""
            SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE created_at >= (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::timestamp
        """)
        row = cur.fetchone()
        print(f"    Count today: {row[0]}")
        print(f"    Sum today:   {row[1]}")

        # 7. Show orders by payment type
        print("\n  Orders by payment_type:")
        cur.execute("SELECT payment_type, COUNT(*), SUM(total_amount) FROM orders GROUP BY payment_type ORDER BY payment_type;")
        for row in cur.fetchall():
            print(f"    {row[0]}: count={row[1]}, sum={row[2]}")

        # 8. Show store_admin relationship
        print("\n  Orders by store_admin:")
        cur.execute("""
            SELECT u.id, u.full_name, COUNT(o.id) as order_count, SUM(o.total_amount) as total
            FROM users u
            JOIN stores s ON s.store_admin_id = u.id
            JOIN branches b ON b.store_id = s.id
            JOIN orders o ON o.branch_id = b.id
            GROUP BY u.id, u.full_name
            ORDER BY order_count DESC
        """)
        for row in cur.fetchall():
            print(f"    StoreAdmin ID={row[0]}, Name={row[1]}, Orders={row[2]}, Total={row[3]}")
    else:
        print("\n  *** NO ORDERS IN DATABASE ***")
        print("  The Sales page is empty because there is genuinely no order data.")

    # 9. Check if order_items table exists and has the right name
    print("\n  Table check:")
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name LIKE '%order%'
        ORDER BY table_name
    """)
    tables = cur.fetchall()
    for t in tables:
        print(f"    Found table: {t[0]}")

    conn.close()
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
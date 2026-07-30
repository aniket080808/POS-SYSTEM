import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="pos",
        user="postgres",
        password="postgres"
    )
    cur = conn.cursor()

    print("=" * 80)
    print("ALL USERS (employees + admins)")
    print("=" * 80)
    cur.execute("""
        SELECT u.id, u.email, u.full_name, u.role, u.store_id, u.branch_id,
               s.brand AS store_brand, s.id AS store_table_id
        FROM users u
        LEFT JOIN stores s ON u.store_id = s.id
        ORDER BY u.id DESC
        LIMIT 30
    """)
    rows = cur.fetchall()
    print(f"{'ID':<5} {'Email':<35} {'Role':<25} {'store_id(FK)':<12} {'branch_id':<10} {'StoreBrand'}")
    print("-" * 120)
    for r in rows:
        print(f"{r[0]:<5} {r[1]:<35} {r[3]:<25} {str(r[4]):<12} {str(r[5]):<10} {r[6]}")

    print()
    print("=" * 80)
    print("STORES TABLE")
    print("=" * 80)
    cur.execute("SELECT id, brand, store_admin_id, status FROM stores ORDER BY id DESC LIMIT 10")
    rows = cur.fetchall()
    print(f"{'ID':<5} {'Brand':<30} {'store_admin_id':<15} {'Status'}")
    print("-" * 70)
    for r in rows:
        print(f"{r[0]:<5} {r[1]:<30} {str(r[2]):<15} {r[3]}")

    print()
    print("=" * 80)
    print("DUPLICATE EMAIL CHECK")
    print("=" * 80)
    cur.execute("""
        SELECT email, COUNT(*) as cnt, array_agg(id) as user_ids
        FROM users
        GROUP BY email
        HAVING COUNT(*) > 1
        ORDER BY cnt DESC
    """)
    rows = cur.fetchall()
    if rows:
        print(f"{'Email':<35} {'Count':<8} {'User IDs'}")
        print("-" * 70)
        for r in rows:
            print(f"{r[0]:<35} {r[1]:<8} {r[2]}")
    else:
        print("No duplicate emails found.")

    print()
    print("=" * 80)
    print("DUPLICATE PHONE CHECK")
    print("=" * 80)
    cur.execute("""
        SELECT phone, COUNT(*) as cnt, array_agg(id) as user_ids
        FROM users
        WHERE phone IS NOT NULL AND phone != ''
        GROUP BY phone
        HAVING COUNT(*) > 1
        ORDER BY cnt DESC
    """)
    rows = cur.fetchall()
    if rows:
        print(f"{'Phone':<20} {'Count':<8} {'User IDs'}")
        print("-" * 60)
        for r in rows:
            print(f"{r[0]:<20} {r[1]:<8} {r[2]}")
    else:
        print("No duplicate phones found.")

    print()
    print("=" * 80)
    print("USERS WHERE store_id IS NULL (but role is employee-type)")
    print("=" * 80)
    cur.execute("""
        SELECT id, email, full_name, role, store_id, branch_id
        FROM users
        WHERE store_id IS NULL
        AND role IN ('ROLE_STORE_MANAGER','ROLE_BRANCH_MANAGER','ROLE_BRANCH_CASHIER','ROLE_CASHIER')
        ORDER BY id DESC
    """)
    rows = cur.fetchall()
    if rows:
        print(f"{'ID':<5} {'Email':<35} {'Role':<25} {'branch_id'}")
        print("-" * 80)
        for r in rows:
            print(f"{r[0]:<5} {r[1]:<35} {r[3]:<25} {str(r[5])}")
    else:
        print("None - all employees have store_id set.")

    print()
    print("=" * 80)
    print("USERS WITH owned_store (store_admin relationship)")
    print("=" * 80)
    cur.execute("""
        SELECT u.id, u.email, u.role, s.id as owned_store_id, s.brand
        FROM users u
        JOIN stores s ON s.store_admin_id = u.id
        ORDER BY u.id DESC
    """)
    rows = cur.fetchall()
    print(f"{'User ID':<8} {'Email':<35} {'Role':<20} {'OwnedStoreID':<13} {'Brand'}")
    print("-" * 90)
    for r in rows:
        print(f"{r[0]:<8} {r[1]:<35} {r[2]:<20} {str(r[3]):<13} {r[4]}")

    cur.close()
    conn.close()
    print("\nDone.")
except Exception as e:
    print(f"Error: {e}")
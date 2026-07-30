import psycopg2

conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/pos')
cur = conn.cursor()

print("=" * 80)
print("HYPOTHESIS TEST: Does the JPQL implicit INNER JOIN exclude store-level staff?")
print("=" * 80)

# 1. Raw data for store_id=52
print("\n[1] All users with store_id=52 (raw, no joins):")
cur.execute("""
    SELECT id, email, role, store_id, branch_id
    FROM users
    WHERE store_id = 52
    ORDER BY id
""")
for row in cur.fetchall():
    print(f"  {row}")

# 2. What Hibernate generates for: SELECT u FROM User u WHERE u.store.id = :storeId OR u.branch.store.id = :storeId
# Implicit path u.branch.store.id => INNER JOIN branch ON u.branch_id=branch.id, then branch.store_id
print("\n[2] SQL equivalent of the JPQL (implicit INNER JOIN on branch.store):")
cur.execute("""
    SELECT u.id, u.email, u.role, u.store_id, u.branch_id
    FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.store_id = 52 OR b.store_id = 52
    ORDER BY u.id
""")
print("  (LEFT JOIN version - what the query SHOULD do):")
for row in cur.fetchall():
    print(f"    {row}")

print("\n  (INNER JOIN version - what Hibernate implicit navigation actually does):")
cur.execute("""
    SELECT u.id, u.email, u.role, u.store_id, u.branch_id
    FROM users u
    JOIN branches b ON u.branch_id = b.id
    WHERE u.store_id = 52 OR b.store_id = 52
    ORDER BY u.id
""")
inner_rows = cur.fetchall()
for row in inner_rows:
    print(f"    {row}")
print(f"  >>> INNER JOIN returns {len(inner_rows)} rows")

# 3. Confirm: users with store_id=52 AND branch_id IS NULL
print("\n[3] Store-level staff (store_id=52, branch_id IS NULL) - these are the missing ones:")
cur.execute("""
    SELECT id, email, role, store_id, branch_id
    FROM users
    WHERE store_id = 52 AND branch_id IS NULL
    ORDER BY id
""")
null_branch_rows = cur.fetchall()
for row in null_branch_rows:
    print(f"  {row}")
print(f"  >>> {len(null_branch_rows)} store-level users have branch_id IS NULL")

cur.close()
conn.close()
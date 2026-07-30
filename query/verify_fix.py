import psycopg2

conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/pos')
cur = conn.cursor()

# Check Mari's record
cur.execute("SELECT id, email, role, store_id, branch_id FROM users WHERE id = 6")
print("Mari's record:", cur.fetchone())

# Check all distinct roles stored
cur.execute("SELECT DISTINCT role FROM users ORDER BY role")
print("\nAll distinct roles in DB:")
for row in cur.fetchall():
    print(f"  - {row[0]}")

# Check users with null branch_id (potential issue)
cur.execute("SELECT id, email, role, store_id, branch_id FROM users WHERE branch_id IS NULL AND store_id IS NOT NULL")
print("\nUsers with store_id but no branch_id:")
for row in cur.fetchall():
    print(f"  {row}")

# Check the branch for store_id=52
cur.execute("SELECT id, name, store_id FROM branches WHERE store_id = 52")
print("\nBranches for store_id=52:")
for row in cur.fetchall():
    print(f"  {row}")

cur.close()
conn.close()
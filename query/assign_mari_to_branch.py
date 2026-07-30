import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="pos",
    user="postgres",
    password="postgres"
)
conn.autocommit = True
cur = conn.cursor()

# Step 1: Get branches for store_id = 52
print("Branches for store_id = 52:")
cur.execute("SELECT id, name FROM branches WHERE store_id = 52;")
rows = cur.fetchall()
for r in rows:
    print(f"  id={r[0]}, name={r[1]}")

if rows:
    branch_id = rows[0][0]
    # Step 2: Assign Mari (user id 6) to this branch
    print(f"\nAssigning user id=6 (marigaming9@gmail.com) to branch_id={branch_id}...")
    cur.execute(f"UPDATE users SET branch_id = {branch_id} WHERE id = 6;")
    print("Update executed.")

    # Step 3: Verify
    print("\nVerifying update:")
    cur.execute("SELECT id, email, role, store_id, branch_id FROM users WHERE id = 6;")
    r = cur.fetchone()
    print(f"  id={r[0]}, email={r[1]}, role={r[2]}, store_id={r[3]}, branch_id={r[4]}")

cur.close()
conn.close()
print("\nDone!")
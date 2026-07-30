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

# Step 1: Convert integer string values to enum names
print("Converting role values to enum names...")
migrations = [
    ('0', 'ROLE_ADMIN'),
    ('1', 'ROLE_STORE_ADMIN'),
    ('2', 'ROLE_STORE_MANAGER'),
    ('3', 'ROLE_BRANCH_MANAGER'),
    ('4', 'ROLE_BRANCH_ADMIN'),
    ('5', 'ROLE_BRANCH_CASHIER'),
    ('6', 'ROLE_CUSTOMER'),
]
for old_val, new_val in migrations:
    cur.execute(f"UPDATE users SET role = '{new_val}' WHERE role = '{old_val}';")
    print(f"  Converted '{old_val}' -> '{new_val}'")

# Step 2: Verify
print("\nVerifying final state:")
cur.execute("SELECT id, email, role FROM users ORDER BY id;")
rows = cur.fetchall()
print(f"{'ID':<5} {'Email':<35} {'Role':<25}")
print("-" * 70)
for r in rows:
    print(f"{r[0]:<5} {r[1]:<35} {r[2]:<25}")

cur.close()
conn.close()
print("\nMigration complete!")
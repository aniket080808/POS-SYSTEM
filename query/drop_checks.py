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

print("All check constraints on users table:")
cur.execute("""
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'users'::regclass 
      AND contype = 'c';
""")
rows = cur.fetchall()
for r in rows:
    print(f"  {r[0]}: {r[1]}")

print("\nDropping all check constraints on users table...")
for r in rows:
    cur.execute(f"ALTER TABLE users DROP CONSTRAINT {r[0]};")
    print(f"  Dropped {r[0]}")

print("\nAltering role column type to VARCHAR(50) USING role::TEXT...")
try:
    cur.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::TEXT;")
    print("Altered successfully.")
except Exception as e:
    print(f"Alter failed: {e}")

cur.close()
conn.close()
import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="pos",
        user="postgres",
        password="postgres"
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("=" * 80)
    print("MIGRATION: Convert users.role from integer ordinal to VARCHAR enum string")
    print("=" * 80)

    # Step 0: Show current state
    print("\nStep 0: Current role values...")
    cur.execute("SELECT id, email, role FROM users ORDER BY id;")
    rows = cur.fetchall()
    for r in rows:
        print(f"  id={r[0]} email={r[1]} role={r[2]} (type={type(r[2]).__name__})")

    # Step 1: Drop any check constraints on users table that mention role
    print("\nStep 1: Dropping check constraints involving role column...")
    cur.execute("""
        SELECT conname, pg_get_constraintdef(oid) 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%role%';
    """)
    constraints = cur.fetchall()
    for con_name, con_def in constraints:
        print(f"  Found constraint: {con_name} -> {con_def}")
        cur.execute(f"ALTER TABLE users DROP CONSTRAINT {con_name};")
        print(f"  Dropped: {con_name}")
    if not constraints:
        print("  No role-related check constraints found.")

    # Step 2: Alter column type from integer to VARCHAR using explicit mapping
    print("\nStep 2: Altering role column type to VARCHAR(50)...")
    cur.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::VARCHAR(50);")
    print("Column type altered successfully.")

    # Step 3: Convert existing integer string values to their enum string names
    print("\nStep 3: Converting values to enum string names...")
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

    # Step 4: Verify migration
    print("\nStep 4: Verifying final state...")
    cur.execute("SELECT id, email, role FROM users ORDER BY id;")
    rows = cur.fetchall()
    print(f"\n{'ID':<5} {'Email':<35} {'Role':<25}")
    print("-" * 70)
    for r in rows:
        print(f"{r[0]:<5} {r[1]:<35} {r[2]:<25}")

    cur.close()
    conn.close()
    print("\nMigration completed successfully!")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
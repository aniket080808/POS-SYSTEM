import psycopg2

conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/pos')
cur = conn.cursor()

cur.execute("""
SELECT id, email, role, store_id, branch_id FROM users
WHERE email IN (
  'aniketmeshram445@gmail.com',
  'sm2021jadhav@gmail.com',
  'pranaykawade839@gmail.com',
  'marigaming9@gmail.com'
)
ORDER BY id;
""")

print("id  | email                          | role               | store_id | branch_id")
print("-" * 80)
for row in cur.fetchall():
    print(f"{row[0]:<4} | {row[1]:<32} | {row[2]:<18} | {str(row[3]):<8} | {str(row[4]):<9}")

cur.close()
conn.close()
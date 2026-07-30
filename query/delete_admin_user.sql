-- Delete store owned by admin@example.com
DELETE FROM stores 
WHERE store_admin_id = (SELECT id FROM users WHERE email = 'admin@example.com');

-- Delete admin user
DELETE FROM users 
WHERE email = 'admin@example.com';
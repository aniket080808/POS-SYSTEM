-- Delete store and user for gittepavan443@gmail.com / Pavan Mega Mart

-- 1. Delete store owned by user or named Pavan Mega Mart
DELETE FROM stores 
WHERE store_admin_id = (SELECT id FROM users WHERE email = 'gittepavan443@gmail.com') 
   OR brand ILIKE '%pavan mega mart%';

-- 2. Delete Store Admin user
DELETE FROM users 
WHERE email = 'gittepavan443@gmail.com';

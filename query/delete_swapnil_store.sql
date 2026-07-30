-- 1. Delete store_subscriptions referencing this store
DELETE FROM store_subscriptions 
WHERE store_id = (SELECT id FROM stores WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com'));

-- 2. Delete approval requests referencing this store
DELETE FROM approval_requests 
WHERE store_id = (SELECT id FROM stores WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com'));

-- 3. Delete branches referencing this store
DELETE FROM branches 
WHERE store_id = (SELECT id FROM stores WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com'));

-- 4. Delete products referencing this store
DELETE FROM products 
WHERE store_id = (SELECT id FROM stores WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com'));

-- 5. Remove store reference from any users linked to this store
UPDATE users 
SET store_id = NULL 
WHERE store_id = (SELECT id FROM stores WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com'));

-- 6. Delete store "Swapnil Mega Mart" owned by sm2021jadhav@gmail.com
DELETE FROM stores 
WHERE store_admin_id = (SELECT id FROM users WHERE email = 'sm2021jadhav@gmail.com')
   OR brand ILIKE '%swapnil mega mart%';

-- 7. Delete user sm2021jadhav@gmail.com
DELETE FROM users 
WHERE email = 'sm2021jadhav@gmail.com';
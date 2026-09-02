-- Idempotent category seed script for Swapnil Mega Mart (store_id: 1)
INSERT INTO categories (name, description, store_id)
SELECT v.name, v.description, 1
FROM (
  VALUES
    ('Grocery', 'Rice, wheat, flour, pulses, spices and other daily grocery items.'),
    ('Beverages', 'Water, soft drinks, juices, tea, coffee and other beverages.'),
    ('Snacks', 'Chips, biscuits, namkeen, popcorn and packaged snacks.'),
    ('Dairy Products', 'Milk, curd, butter, cheese and other dairy products.'),
    ('Fruits & Vegetables', 'Fresh fruits, vegetables and other fresh produce.'),
    ('Personal Care', 'Soaps, shampoos, toothpaste, skincare and hygiene products.'),
    ('Household', 'Detergents, cleaners, tissues and other household essentials.'),
    ('Bakery', 'Bread, cakes, buns, pastries and other bakery products.'),
    ('Chocolates & Confectionery', 'Chocolates, candies, toffees, chewing gum and sweets.'),
    ('Baby Care', 'Baby food, diapers, wipes and other baby-care products.'),
    ('Frozen Foods', 'Frozen vegetables, snacks, ice cream and other frozen products.'),
    ('Stationery', 'Pens, pencils, notebooks, paper and other stationery items.'),
    ('Spices & Masala', 'Cooking spices, masalas, seasoning and related products.'),
    ('Cooking Essentials', 'Cooking oil, salt, sugar, sauces and other kitchen essentials.'),
    ('Home & Kitchen', 'Kitchen utensils, storage items and basic household accessories.')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = v.name AND c.store_id = 1
);

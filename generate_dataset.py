import pandas as pd
import random
from datetime import datetime

# Configuration
STORE_ID = 52
TOTAL_PRODUCTS = 300
CATEGORIES_PER_CATEGORY = 10

# Category mapping
categories = [
    (1, "Grocery & Staples"),
    (2, "Fresh Fruits"),
    (3, "Fresh Vegetables"),
    (4, "Dairy & Eggs"),
    (5, "Bakery & Breads"),
    (6, "Snacks & Namkeen"),
    (7, "Beverages"),
    (8, "Frozen Foods"),
    (9, "Breakfast & Cereals"),
    (10, "Instant & Ready-to-Eat"),
    (11, "Personal Care"),
    (12, "Beauty & Cosmetics"),
    (13, "Health & Wellness"),
    (14, "Baby Care"),
    (15, "Household Cleaning"),
    (16, "Home Essentials"),
    (17, "Kitchen & Dining"),
    (18, "Stationery & Office Supplies"),
    (19, "Books & Educational Supplies"),
    (20, "Mobile & Electronics Accessories"),
    (21, "Computer Accessories"),
    (22, "Clothing & Apparel"),
    (23, "Footwear"),
    (24, "Fashion Accessories"),
    (25, "Home Decor"),
    (26, "Toys & Games"),
    (27, "Sports & Fitness"),
    (28, "Pet Care"),
    (29, "Automotive Accessories"),
    (30, "Seasonal & Festival Items"),
]

# Stable Wikimedia Commons image URLs by category type
IMAGE_URLS = {
    "grocery": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Indian_Rice_Bhel.jpg/320px-Indian_Rice_Bhel.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wheat_atta_flour.jpg/320px-Wheat_atta_flour.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Tur_dal.jpg/320px-Tur_dal.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sugar_crystals.jpg/320px-Sugar_crystals.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Salt_crystals.jpg/320px-Salt_crystals.jpg",
    ],
    "dairy": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Glass_of_Milk_%282008%29.jpg/320px-Glass_of_Milk_%282008%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Butter_on_saucer.jpg/320px-Butter_on_saucer.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Eggs.jpg/320px-Eggs.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Paneer.jpg/320px-Paneer.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Yogurt_with_fruit.jpg/320px-Yogurt_with_fruit.jpg",
    ],
    "beverages": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Water_glass.jpg/320px-Water_glass.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Tea_cup.jpg/320px-Tea_cup.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coffee_mug.jpg/320px-Coffee_mug.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Fruit_juice_glass.jpg/320px-Fruit_juice_glass.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Energy_drink_can.jpg/320px-Energy_drink_can.jpg",
    ],
    "snacks": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Biscuits.jpg/320px-Biscuits.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Indian_snacks.jpg/320px-Indian_snacks.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Namkeen_mix.jpg/320px-Namkeen_mix.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chakna.jpg/320px-Chakna.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mixture.jpg/320px-Mixture.jpg",
    ],
    "personal_care": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Soap_bars.jpg/320px-Soap_bars.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Shampoo_bottles.jpg/320px-Shampoo_bottles.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Toothpaste_and_brush.jpg/320px-Toothpaste_and_brush.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Hair_oil_bottle.jpg/320px-Hair_oil_bottle.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Face_wash.jpg/320px-Face_wash.jpg",
    ],
    "electronics": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Earphones.jpg/320px-Earphones.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/USB_Cable.jpg/320px-USB_Cable.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Power_bank.jpg/320px-Power_bank.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Phone_charger.jpg/320px-Phone_charger.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Smart_watch.jpg/320px-Smart_watch.jpg",
    ],
    "clothing": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camiseta_roja.jpg/320px-Camiseta_roja.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Pants.jpg/320px-Pants.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Shirt_white.jpg/320px-Shirt_white.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Mens_formal_shirt.jpg/320px-Mens_formal_shirt.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/T-shirt.jpg/320px-T-shirt.jpg",
    ],
    "footwear": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sneaker_shoe.jpg/320px-Sneaker_shoe.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Female_sandal.jpg/320px-Female_sandal.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Walking_shoe.jpg/320px-Walking_shoe.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Black_shoes.jpg/320px-Black_shoes.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Flip_flops.jpg/320px-Flip_flops.jpg",
    ],
    "kitchen": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Steel_container.jpg/320px-Steel_container.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Non_stick_pan_%28cropped%29.jpg/320px-Non_stick_pan_%28cropped%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Plastic_bottles.jpg/320px-Plastic_bottles.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Water_bottle_steel.jpg/320px-Water_bottle_steel.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Utensil_set.jpg/320px-Utensil_set.jpg",
    ],
    "home_decor": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Cushion_on_sofa.jpg/320px-Cushion_on_sofa.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Table_lamp.jpg/320px-Table_lamp.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Houseplant.jpg/320px-Houseplant.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Clock.jpg/320px-Clock.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Wall_hanging.jpg/320px-Wall_hanging.jpg",
    ],
    "toys": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lego_bricks.jpg/320px-Lego_bricks.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lego_Red_Box.jpg/320px-Lego_Red_Box.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Plush_toy_bear.jpg/320px-Plush_toy_bear.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Teddy_bear.jpg/320px-Teddy_bear.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Doll.jpg/320px-Doll.jpg",
    ],
    "stationery": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ballpoint_Pen.jpg/320px-Ballpoint_Pen.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Notepad.jpg/320px-Notepad.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Pencil_case.jpg/320px-Pencil_case.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Student_notebooks.jpg/320px-Student_notebooks.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Markers.jpg/320px-Markers.jpg",
    ],
    "default": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/White_product_box.jpg/320px-White_product_box.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Campos_abiertos.jpg/320px-Campos_abiertos.jpg",
    ],
}

# Product templates per category - simplified flat variants for reliable generation
product_templates = {
    1: [  # Grocery & Staples
        ("Aashirvaad", ["Atta 10kg", "Atta 5kg", "Methi Atta 5kg", "Multigrain Atta 5kg", "Sooji 1kg", "Maida 1kg"]),
        ("Tata", ["Salt 1kg", "Salt 500g", "Tea 500g", "Tea 1kg", "Coffee 100g"]),
        ("Fortune", ["Oil 5L", "Oil 2L", "Rice Bran Oil 1L", "Sunflower Oil 1L"]),
        ("India Gate", ["Basmati Rice 5kg", "Dubar Rice 5kg", "Mogra Rice 1kg"]),
        ("Shakti Bhog", ["Rice 5kg", "Basmati Rice 1kg"]),
    ],
    2: [  # Fresh Fruits
        ("Fresh", ["Apple 1kg", "Banana 1 dozen", "Orange 1kg", "Mango 1kg", "Grapes 500g", "Papaya 1kg", "Watermelon 1 piece", "Pineapple 1 piece", "Strawberry 250g", "Kiwi 4pcs", "Guava 1kg", "Pear 500g"]),
    ],
    3: [  # Fresh Vegetables
        ("Fresh", ["Potato 1kg", "Onion 1kg", "Tomato 1kg", "Carrot 500g", "Cauliflower 1 piece", "Cabbage 1 piece", "Spinach 250g", "Brinjal 500g", "Okra 500g", "Capsicum 500g", "Cucumber 1kg", "Green Chili 250g"]),
    ],
    4: [  # Dairy & Eggs
        ("Amul", ["Gold Milk 1L", "Taaza Milk 1L", "Butter 500g", "Cheese Slices 200g", "Paneer 200g", "Curd 1kg", "Lassi 200ml", "Milk 500ml", "Buttermilk 200ml"]),
        ("Mother Dairy", ["Milk 1L", "Milk 500ml", "Paneer 200g", "Curd 1kg", "Butter 100g"]),
    ],
    5: [  # Bakery & Breads
        ("Britannia", ["White Bread 400g", "Brown Bread 400g", "Sweet Bread 400g", "Multigrain Bread 400g", "Puffs 3pcs"]),
        ("Modern", ["Bread 400g", "Whole Wheat Bread 400g", "Buns 4pcs", "Pav 6pcs"]),
        ("Pablo", ["White Bread 350g", "Brown Bread 350g", "Garlic Bread 300g"]),
    ],
    6: [  # Snacks & Namkeen
        ("Parle", ["G Biscuits 100g", "Monaco 100g", "Krackjack 100g", "Hide & Seek 100g", "Coconut 100g"]),
        ("Haldiram's", ["Bhujia 200g", "Aloo Bhujia 200g", "Chana 200g", "Mixture 200g", "Sev 200g"]),
        ("Bingo", ["Tedhe Medhe 100g", "Mad Angles 100g", "Yumitos 100g"]),
        ("Kurkure", ["Masala Munch 100g", "Chilli Chips 100g"]),
        ("Lay's", ["Magic Masala 100g", "Classic Salted 100g"]),
    ],
    7: [  # Beverages
        ("Bisleri", ["Water 2L", "Water 1L", "Water 500ml", "Water 250ml"]),
        ("Coca-Cola", ["Thums Up 2L", "Sprite 2L", "Coca-Cola 2L", "Fanta 2L"]),
        ("Frooti", ["Mango Drink 1L", "Mango Drink 600ml", "Mango Drink 250ml"]),
        ("Tata", ["Tea Premium 500g", "Tea Gold 250g", "Tea Elaichi 100g"]),
        ("Nestle", ["Nescafe 50g", "Milo 200g"]),
        ("Real", ["Fruit Juice 1L", "Fruit Juice 200ml"]),
    ],
    8: [  # Frozen Foods
        ("Epigamia", ["Frozen Peas 500g", "Frozen Mixed Veggies 500g"]),
        ("Haldiram's", ["Frozen Samosa 6pcs", "Frozen Kachori 6pcs", "Frozen Aloo Tikki 4pcs"]),
        ("McCain", ["Smiles 400g", "Fries 400g", "Hash Browns 400g"]),
        ("Yummiez", ["Nuggets 500g", "Garlic Bread 300g"]),
    ],
    9: [  # Breakfast & Cereals
        ("Kellogg's", ["Corn Flakes 500g", "Choco Flakes 500g", "Oats 500g", "Muesli 500g"]),
        ("Saffola", ["Oats 1kg", "Oats 500g", "Masala Oats 500g"]),
        ("Bag-G-Char", ["Poha 1kg", "Poha 500g", "Upma Mix 200g"]),
        ("Tata", ["Sampann Toor Dal 500g"]),
    ],
    10: [  # Instant & Ready-to-Eat
        ("Maggi", ["Noodles 70g", "Pasta 70g", "Oats Noodles 70g", "Cheese Pasta 70g"]),
        ("Knorr", ["Soups 50g", "Soups 24g", "Pasta 70g"]),
        ("MTR", ["Ready to Eat Meals 300g", "Breakfast Mix 200g", "Upma Mix 200g"]),
        ("Gits", ["Dosa Mix 500g", "Idli Mix 500g", "Vada Mix 500g"]),
        ("Top Ramen", ["Noodles 70g", "Curry Noodles 70g"]),
    ],
    11: [  # Personal Care
        ("Dove", ["Soap 125g", "Shampoo 180ml", "Conditioner 180ml", "Body Wash 250ml"]),
        ("Himalaya", ["Soap 125g", "Shampoo 200ml", "Face Wash 100ml", "Cream 50ml", "Hair Oil 200ml"]),
        ("Santoor", ["Soap 125g", "Soap 3x125g", "Soap 4x125g"]),
        ("Colgate", ["Toothpaste 100g", "Toothpaste 200g", "Toothbrush 1pc", "Toothbrush 2pcs"]),
        ("Patanjali", ["Dant Kanti 100g", "Badam Oil 100ml", "Gel 100ml", "Soap 75g"]),
        ("Lux", ["Soap 125g", "Shower Gel 250ml"]),
    ],
    12: [  # Beauty & Cosmetics
        ("Lakme", ["Face Wash 100ml", "Moisturizer 100ml", "Lipstick 4g", "Kajal 3g", "Foundation 30ml"]),
        ("Maybelline", ["Mascara 9ml", "Lipstick 3.9g", "Compact 8g"]),
        ("L'Oreal", ["Shampoo 200ml", "Conditioner 200ml", "Serum 100ml"]),
        ("Nykaa", ["Lipstick 3.5g", "Kajal 1g", "Compact 10g"]),
        ("Mamaearth", ["Face Wash 100ml", "Sunscreen 100ml", "Mask 100g"]),
    ],
    13: [  # Health & Wellness
        ("Himalaya", ["Nutrive 60caps", "Liv.52 60tabs", "Septilin 60tabs"]),
        ("Dabur", ["Honey 500g", "Chyawanprash 500g", "Hajmola 120tabs"]),
        ("Patanjali", ["Ashwagandha 60caps", "Honey 250g", "Giloy Juice 500ml"]),
        ("Ensure", ["Nutrition Powder 400g", "Nutrition Powder 200g"]),
        ("Horlicks", ["Health Drink 500g", "Health Drink 200g"]),
    ],
    14: [  # Baby Care
        ("Pampers", ["Diapers M 30pcs", "Diapers L 24pcs", "Wipes 72pcs"]),
        ("Himalaya", ["Baby Soap 125g", "Baby Oil 200ml", "Baby Powder 400g", "Baby Cream 100ml", "Baby Shampoo 100ml", "Baby Lotion 200ml", "Baby Wipes 80pcs", "Baby Diaper S 26pcs"]),
        ("Johnson's", ["Baby Oil 200ml", "Baby Powder 500g", "Baby Shampoo 200ml", "Baby Soap 125g", "Baby Lotion 200ml", "Baby Wipes 80pcs"]),
        ("Sebamed", ["Baby Lotion 200ml", "Baby Shampoo 200ml", "Baby Cream 100ml", "Baby Soap 100g"]),
        ("Mamaearth", ["Baby Lotion 200ml", "Baby Shampoo 200ml", "Baby Powder 200g", "Baby Oil 100ml"]),
    ],
    15: [  # Household Cleaning
        ("Surf Excel", ["Detergent 1kg", "Detergent 500g", "Liquid Detergent 1L", "Stain Remover 500ml"]),
        ("Vim", ["Dishwash Liquid 1L", "Dishwash Liquid 500ml", "Dishwash Bar 200g"]),
        ("Harpic", ["Toilet Cleaner 1L", "Toilet Cleaner 500ml", "Bathroom Cleaner 500ml"]),
        ("Lizol", ["Floor Cleaner 1L", "Floor Cleaner 2L", "Disinfectant 500ml"]),
        ("Colin", ["Glass Cleaner 500ml", "Surface Cleaner 300ml"]),
        ("Godrej", ["Air Freshener 275ml", "Aer Refill 270ml", "Handwash 200ml"]),
    ],
    16: [  # Home Essentials
        ("Milton", ["Water Bottle 1L", "Thermos 500ml", "Steel Tiffin 3pcs", "Water Jug 2L"]),
        ("Cello", ["Pen 1pc", "Water Bottle 1L", "Steel Container 3pcs"]),
        ("Air Wick", ["Air Freshener 275ml", "Refill 250ml"]),
        ("3M", ["Scotch Brite 3pcs", "Duster 1pc", "Scrub Pad 5pcs"]),
    ],
    17: [  # Kitchen & Dining
        ("Prestige", ["Pressure Cooker 5L", "Pressure Cooker 3L", "Tawa 26cm", "Pan 24cm", "Gas Stove 2 Burner"]),
        ("Hawkins", ["Pressure Cooker 3L", "Pressure Cooker 5L", "Hard Anodised 5L"]),
        ("Pigeon", ["Non-stick Pan 24cm", "Tawa 28cm", "Pressure Cooker 5L"]),
        ("Borosil", ["Glass Tumbler 6pcs", "Microwave Container 3pcs", "Storage Jar 1L"]),
        ("Cello", ["Plastic Container 3pcs", "Water Bottle 1L"]),
        ("Milton", ["Thermosteel Flask 1L", "Steel Container 3pcs"]),
    ],
    18: [  # Stationery & Office Supplies
        ("Classmate", ["Notebook 200pgs", "Notebook 300pgs", "Register 200pgs", "Diary 300pgs", "Pen set 5pcs"]),
        ("DOMS", ["Pencil H/B 10pcs", "Eraser 1pc", "Sharpener 1pc", "Geometric Box 1pc"]),
        ("Camlin", ["Pencil HB 10pcs", "Eraser 1pc", "Sharpener 1pc", "Fountain Pen 1pc", "Box Crayons 12pcs", "Watercolors 12pcs", "Pastels 12pcs"]),
        ("Sakura", ["Pen 1pc", "Gelly Roll Pen 1pc", "Brush Pen 5pcs"]),
        ("Reynolds", ["Ball Pen 5pcs", "Gel Pen 5pcs", "Marker 1pc"]),
        ("Hero", ["Pen 1pc", "Pen 5pcs", "Pencil 2pcs"]),
    ],
    19: [  # Books & Educational Supplies
        ("NCERT", ["Class 10 Maths", "Class 10 Science", "Class 10 SST", "Class 9 Maths", "Class 12 Physics", "Class 12 Chemistry"]),
        ("Arihant", ["Class 10 Science", "Class 10 SST", "Class 12 Maths"]),
        ("Disha", ["Class 10 Science Guide", "Class 12 Physics Guide", "Class 10 Olympiad"]),
        ("Evergreen", ["Class 9 All Subjects", "Class 10 All Subjects", "Class 11 Physics", "Class 12 Chemistry"]),
        ("Schand", ["Class 10 Maths Solutions", "Class 10 Science Solutions", "Class 9 SST"]),
    ],
    20: [  # Mobile & Electronics Accessories
        ("Boat", ["Rockerz 255 Pro+ Earphones", "Airdopes 441 TWS", "Rockers 450 Headphones", "Powerbank 10000mAh", "Charger 20W", "Cable USB-C 1m", "AUX Cable 1m", "Car Charger 36W", "Speaker 5W", "Smart Watch Xtend"]),
        ("Noise", ["Buds VS102 TWS", "Buds VS404 TWS", "ColorFit Pro 4 Watch", "Powerbank 10000mAh", "Neckband 2.0"]),
        ("JBL", ["Tune 230NC TWS", "C100SI Earphones", "Go 3 Speaker", "Charge 5 Speaker"]),
        ("Samsung", ["Galaxy Buds2 Pro", "25W Adapter", "Type-C Cable 1.5m", "Galaxy Watch 4"]),
        ("Xiaomi", ["Redmi Buds 4", "Powerbank 20000mAh", "33W Charger", "Cable Type-C"]),
        ("Portronics", ["Konnect E Mouse", "Adaptor 65W", "Powerbank 20000mAh", "Car Charger"]),
        ("Realme", ["Narzo Buds TWS", "Cable Type-C", "Powerbank 10000mAh"]),
    ],
    21: [  # Computer Accessories
        ("Logitech", ["M235 Mouse", "K270 Keyboard", "H390 Headset", "C270 Webcam", "G102 Mouse"]),
        ("HP", ["Pavilion Keyboard", "X1000 Mouse", "v200 Webcam", "v150 Mouse"]),
        ("Dell", ["KM122 Keyboard Mouse Combo", "MS112 USB Mouse", "Wireless Mouse WM126"]),
        ("Zebronics", ["Keyboard Mouse Combo", "USB Mouse M272", "Headphone Zeb-Thunder"]),
        ("Lenovo", ["Wireless Mouse", "Keyboard K240", "Webcam C200"]),
    ],
    22: [  # Clothing & Apparel
        ("Allen Solly", ["Men Polo T-Shirt", "Men Formal Shirt", "Men Casual Shirt", "Women Top", "Kids T-Shirt"]),
        ("H&M", ["Cotton T-Shirt", "Slim Fit Jeans", "Oversized Hoodie"]),
        ("Puma", ["Graphic T-Shirt", "Track Pants", "Hoodie"]),
        ("Adidas", ["Essentials Tee", "Regular Fit Shirt", "Track Pants"]),
        ("Nike", ["Dri-FIT T-Shirt", "Sportswear Club Hoodie", "Joggers"]),
        ("Peter England", ["Formal Shirt", "Casual Shirt", "Trouser"]),
        ("Van Heusen", ["Formal Shirt", "Trousers", "Polo T-Shirt"]),
    ],
    23: [  # Footwear
        ("Bata", ["Casual Shoes Men", "Sandals Men", "Formal Shoes Men", "Loafer Men"]),
        ("Woodland", ["Leather Shoes", "Sneakers", "Sandals"]),
        ("Puma", ["Running Shoes", "Casual Shoes", "Slides"]),
        ("Adidas", ["Neo Daily Shoes", "Superstar Sneakers", "Running Shoes"]),
        ("Nike", ["Air Max Shoes", "Air Force 1", "Revolution 6"]),
        ("Skechers", ["Go Walk Shoes", "Sneakers"]),
        ("Liberty", ["School Shoes", "Casual Shoes", "Sandals"]),
    ],
    24: [  # Fashion Accessories
        ("Fastrack", ["Analog Watch Men", "Analog Watch Women", "Sunglasses", "Belt"]),
        ("Titan", ["Analog Watch", "Smartwatch", "Sunglasses", "Belt"]),
        ("Casio", ["Edifice Watch", "Enticer Watch", "G-Shock"]),
        ("Ray-Ban", ["Sunglasses", "Aviator Sunglasses", "Wayfarer"]),
        ("Fossil", ["Watch Men", "Watch Women", "Wallet"]),
        ("Tommy Hilfiger", ["Belt", "Wallet", "Sunglasses"]),
        ("Michael Kors", ["Watch Women", "Wallet"]),
    ],
    25: [  # Home Decor
        ("IKEA", ["Cushion Cover 45x45cm", "Table Lamp", "Wall Clock 30cm", "Photo Frame 10x15", "Rug 120x180cm"]),
        ("Home Centre", ["Curtains 7ft", "Table Runner", "Cushion Covers Set"]),
        ("Nidhi", ["Wall Hanging", "Showpiece", "Table Lamp"]),
        ("Aqua", ["Vase", "Artificial Flowers", "Photo Frame"]),
        ("Aapno", ["Wall Clock", "Cushion Cover", "Table Mat"]),
    ],
    26: [  # Toys & Games
        ("Funskool", ["Rubik's Cube 3x3", "Lego Set", "Board Game Ludo", "Teddy Bear", "Car Set"]),
        ("Mattel", ["Hot Wheels 5pcs", "Barbie Doll", "UNO Cards", "Board Game"]),
        ("Disney", ["Princess Doll", "Car Set 10pcs", "Puzzle 100pcs"]),
        ("Lego", ["Classic Box 10696", "City Set 60271", "Duplo Set 10572"]),
        ("Hasbro", ["Monopoly Game", "Jenga 54pcs", "Play-Doh 6pcs"]),
    ],
    27: [  # Sports & Fitness
        ("Nike", ["Running Shoes", "Dri-FIT T-Shirt", "Soccer Ball Size 5", "Duffle Bag"]),
        ("Adidas", ["Football Shoes", "Gym Bag", "Yoga Mat 6mm", "Water Bottle 1L", "Sports Socks 3pcs"]),
        ("Cosco", ["Football Size 5", "Cricket Kit Bag", "Badminton Racket", "Yoga Mat"]),
        ("Aeropostale", ["Duffle Bag", "Gym Kit Bag"]),
        ("Puma", ["Training Shoes", "Sports T-Shirt", "Joggers", "Cap"]),
    ],
    28: [  # Pet Care
        ("Royal Canin", ["Dog Food 3kg", "Cat Food 2kg", "Puppy Food 2kg"]),
        ("Pedigree", ["Dog Food 3kg", "Puppy Food 1.2kg", "Dog Treats 500g", "Cat Food 3kg"]),
        ("Whiskas", ["Cat Food 3kg", "Cat Treats 200g"]),
        ("Drools", ["Dog Food 3kg", "Cat Food 3kg", "Puppy Food 1.2kg"]),
        ("Farmina", ["Dog Food 2kg", "Cat Food 2kg"]),
        ("Himalaya", ["Flea & Tick Spray 200ml", "Tick Off 6tabs", "Pet Shampoo 200ml"]),
    ],
    29: [  # Automotive Accessories
        ("3M", ["Car Polish 500ml", "Car Wax 500ml", "Microfiber Cloth", "Headlight Restorer"]),
        ("Automotive", ["Car Cover Universal", "Seat Cover Set", "Car Perfume", "Wiper Blades 2pcs"]),
        ("Godrej", ["Car Security Alarm", "Steering Wheel Lock"]),
        ("Bosch", ["Wiper Blades 22inch", "Car Battery 55D23L"]),
        ("Michelin", ["Tyre Pressure Gauge", "Puncture Repair Kit"]),
        ("Amkette", ["Car Charger 2.4A", "FM Transmitter", "Car Phone Mount"]),
        ("Portronics", ["Car Charger", "Car Phone Holder", "FM Transmitter"]),
    ],
    30: [  # Seasonal & Festival Items
        ("Diwali", ["Diya Set 12pcs", "Rangoli Colors 500g", "Laxmi Ganesh Idol", "Diwali Decor Lights", "Puja Thali Set", "Laxmi Ganesh Sticker Set"]),
        ("Christmas", ["Christmas Tree 3ft", "Santa Claus Toy", "Christmas Lights", "Stocking Red", "Ornaments Set 6pcs"]),
        ("Holi", ["Holi Colors 500g", "Water Gun 1pc", "Pichkari 50cm", "Thandai Mix 100g"]),
        ("Navratri", ["Garba Dandiya 2pcs", "Chaniya Choli Kids", "Durga Idol", "Puja Samagri Kit"]),
        ("Eid", ["Decor Lights", "Gift Box", "Prayer Mat", "Arabian Perfume 50ml"]),
    ],
}

# Get image URL based on category
def get_image_url(category_id):
    if category_id in [1, 2, 3]:
        return random.choice(IMAGE_URLS["grocery"])
    elif category_id == 4:
        return random.choice(IMAGE_URLS["dairy"])
    elif category_id == 7:
        return random.choice(IMAGE_URLS["beverages"])
    elif category_id == 6:
        return random.choice(IMAGE_URLS["snacks"])
    elif category_id in [11, 12, 13]:
        return random.choice(IMAGE_URLS["personal_care"])
    elif category_id in [20, 21]:
        return random.choice(IMAGE_URLS["electronics"])
    elif category_id == 22:
        return random.choice(IMAGE_URLS["clothing"])
    elif category_id == 23:
        return random.choice(IMAGE_URLS["footwear"])
    elif category_id in [16, 17]:
        return random.choice(IMAGE_URLS["kitchen"])
    elif category_id == 25:
        return random.choice(IMAGE_URLS["home_decor"])
    elif category_id == 26:
        return random.choice(IMAGE_URLS["toys"])
    elif category_id == 18:
        return random.choice(IMAGE_URLS["stationery"])
    else:
        return random.choice(IMAGE_URLS["default"])

# Get realistic MRP range for category
def get_mrp_range(category_id):
    if category_id == 4:  # Dairy
        return (30, 75)
    elif category_id == 6:  # Snacks
        return (10, 120)
    elif category_id in [1, 2, 3, 9]:  # Staples, fruits, veg, breakfast
        return (60, 150)
    elif category_id in [20, 21]:  # Electronics
        return (199, 4999)
    elif category_id == 23:  # Footwear
        return (499, 4999)
    elif category_id in [5, 7, 8, 10, 12, 13]:  # Bakery, beverages, frozen, instant, beauty, health
        return (60, 300)
    elif category_id in [11, 14, 15]:  # Personal care, baby, cleaning
        return (40, 500)
    elif category_id == 22:  # Clothing
        return (299, 1999)
    elif category_id == 17:  # Kitchen
        return (99, 1999)
    elif category_id == 25:  # Home decor
        return (149, 999)
    elif category_id == 26:  # Toys
        return (99, 1999)
    elif category_id == 18:  # Stationery
        return (10, 500)
    else:
        return (50, 500)

# Get stock range for category
def get_stock_range(category_id):
    if category_id in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15]:  # FMCG
        return (100, 500)
    elif category_id in [20, 21, 29]:  # Electronics, auto
        return (10, 80)
    elif category_id == 23:  # Footwear
        return (15, 50)
    elif category_id == 19:  # Books
        return (20, 100)
    elif category_id == 26:  # Toys
        return (20, 80)
    elif category_id == 25:  # Home decor
        return (10, 60)
    elif category_id == 22:  # Clothing
        return (20, 100)
    elif category_id in [24, 27, 28]:  # Fashion, sports, pet
        return (10, 80)
    else:
        return (30, 150)

# Determine if color is applicable
def use_color(category_id):
    return category_id in [18, 22, 23, 24, 25, 26]

# SKU prefix mapping
def get_sku_prefix(category_id, brand):
    brand_upper = brand.upper()
    mapping = {
        "AMUL": "AMUL",
        "TATA": "TATA",
        "AASHIRVAAD": "AASH",
        "FORTUNE": "FORT",
        "INDIA GATE": "IGRICE",
        "BRITANNIA": "BRIT",
        "HALDIRAM": "HALDI",
        "PARLE": "PARLE",
        "BINGO": "BINGO",
        "KURKURE": "KURK",
        "LAY'S": "LAYS",
        "BISLERI": "BISL",
        "COCA-COLA": "COKE",
        "THUMS UP": "COKE",
        "SPRITE": "COKE",
        "FANTA": "COKE",
        "FROOTI": "FROO",
        "NESTLE": "NEST",
        "MAGGI": "MAGGI",
        "MTR": "MTR",
        "GITS": "GITS",
        "DOVE": "DOVE",
        "HIMALAYA": "HIMAL",
        "SANTOOR": "SANT",
        "COLGATE": "COLO",
        "PATAJALI": "PATA",
        "PATANJALI": "PATA",
        "LUX": "LUX",
        "LAKME": "LAKM",
        "MAYBELLINE": "MAYB",
        "L'OREAL": "LORE",
        "LOREAL": "LORE",
        "NYKAA": "NYKA",
        "MAMAEARTH": "MAMA",
        "MAMAAARTH": "MAMA",
        "DABUR": "DABU",
        "ENSURE": "ENSU",
        "HORLICKS": "HORL",
        "PAMPERS": "PAMP",
        "JOHNSON": "JOHN",
        "SEBAMED": "SEBA",
        "SURF EXCEL": "SURF",
        "VIM": "VIM",
        "HARPIC": "HARPI",
        "LIZOL": "LIZO",
        "COLIN": "COLI",
        "GODREJ": "GODR",
        "MILTON": "MILT",
        "CELLO": "CELL",
        "AIR WICK": "AIRW",
        "AIRWICK": "AIRW",
        "PRESTIGE": "PRES",
        "HAWKINS": "HAWK",
        "PIGEON": "PIGE",
        "BOROSIL": "BORO",
        "CLASSMATE": "CLASS",
        "DOMS": "DOMS",
        "CAMLIN": "CAML",
        "SAKURA": "SAKU",
        "REYNOLDS": "REYN",
        "HERO": "HERO",
        "NCERT": "NCERT",
        "ARIHANT": "ARIH",
        "DISHA": "DISH",
        "EVERGREEN": "EGRN",
        "SCHAND": "SCH",
        "BOAT": "BOAT",
        "NOISE": "NOIS",
        "JBL": "JBL",
        "SAMSUNG": "SAM",
        "XIAOMI": "XIAO",
        "REDMI": "XIAO",
        "PORTRONICS": "PORT",
        "REALME": "REAL",
        "LOGITECH": "LOGI",
        "HP": "HP",
        "DELL": "DELL",
        "ZEBRONICS": "ZEB",
        "LENOVO": "LENO",
        "ALLEN SOLLY": "ALLS",
        "ALLENSOLLY": "ALLS",
        "H&M": "HM",
        "PUMA": "PUMA",
        "ADIDAS": "ADID",
        "NIKE": "NIKE",
        "PETER ENGLAND": "PENG",
        "VAN HEUSEN": "VH",
        "BATA": "BATA",
        "WOODLAND": "WOOD",
        "SKECHERS": "SKEC",
        "LIBERTY": "LIBR",
        "FASTTRACK": "FAST",
        "TITAN": "TITA",
        "CASIO": "CASS",
        "RAY-BAN": "RAYB",
        "RAYBAN": "RAYB",
        "FOSSIL": "FOSS",
        "TOMMY HILFIGER": "TOMH",
        "MICHAEL KORS": "MK",
        "IKEA": "IKEA",
        "HOME CENTRE": "HMC",
        "HOMECENTRE": "HMC",
        "FUNSKOOL": "FUNS",
        "MATTEL": "MATT",
        "DISNEY": "DISN",
        "LEGO": "LEGO",
        "HASBRO": "HASB",
        "COSCO": "COSC",
        "AEROPOSTALE": "AERO",
        "ROYAL CANIN": "RCAN",
        "PEDIGREE": "PEDI",
        "WHISKAS": "WHIS",
        "DROOLS": "DROL",
        "3M": "3M",
        "AUTOMOTIVE": "AUTO",
        "BOSCH": "BOSC",
        "MICHELIN": "MICH",
        "AMKETTE": "AMK",
        "DIWALI": "DIWA",
        "CHRISTMAS": "XMAS",
        "HOLI": "HOLI",
        "NAVRATRI": "NAVR",
        "EID": "EID",
    }
    
    for key, prefix in mapping.items():
        if key in brand_upper:
            return prefix
    return "BRND"

# Generate unique products
products = []
skus_used = set()
products_used = set()
sku_counter = 1

for category_id, category_name in categories:
    templates = product_templates[category_id]
    generated = 0
    attempts = 0
    
    while generated < CATEGORIES_PER_CATEGORY and attempts < 1000:
        attempts += 1
        brand, variants = random.choice(templates)
        variant = random.choice(variants)
        product_name = f"{brand} {variant}"
        
        if product_name in products_used:
            continue
        
        # Generate SKU
        prefix = get_sku_prefix(category_id, brand)
        sku = f"{prefix}-{sku_counter:03d}"
        sku_counter += 1
        
        if sku in skus_used:
            continue
        
        # Generate pricing
        mrp_min, mrp_max = get_mrp_range(category_id)
        mrp = round(random.uniform(mrp_min, mrp_max), 2)
        discount = random.uniform(0, 0.15)
        selling_price = round(mrp * (1 - discount), 2)
        
        # Ensure selling price <= mrp
        if selling_price > mrp:
            selling_price = mrp
        
        # Color
        if use_color(category_id):
            colors = ["Red", "Blue", "Black", "White", "Brown", "Green", "Yellow", "Grey", "Navy", "Maroon"]
            color = random.choice(colors)
        else:
            color = "N/A"
        
        # Stock
        stock_min, stock_max = get_stock_range(category_id)
        stock = random.randint(stock_min, stock_max)
        
        # Image URL
        image_url = get_image_url(category_id)
        
        # Description - generate unique descriptive text
        descriptions = [
            f"High-quality {product_name.lower()} from {brand}. Perfect for everyday use with excellent durability and value for money.",
            f"{brand} presents the {product_name.lower()}. Made with premium materials ensuring long-lasting performance and reliability.",
            f"Experience superior quality with {product_name.lower()} by {brand}. Designed to meet your needs with excellent craftsmanship.",
            f"Trusted {brand} {product_name.lower()} offering great value. Durable, reliable, and perfect for daily usage.",
            f"{product_name.lower()} - an excellent choice from {brand}. Crafted with precision for optimal performance and satisfaction.",
        ]
        description = random.choice(descriptions)
        
        products.append({
            "Image URL": image_url,
            "Product Name": product_name,
            "SKU": sku,
            "Brand": brand,
            "Category": category_name,
            "CategoryId": category_id,
            "StoreId": STORE_ID,
            "Color": color,
            "MRP": mrp,
            "Selling Price": selling_price,
            "Stock": stock,
            "Description": description,
        })
        
        skus_used.add(sku)
        products_used.add(product_name)
        generated += 1

# Create DataFrame
df = pd.DataFrame(products)

# Verify constraints
print(f"Total products: {len(df)}")
print(f"Categories: {df['CategoryId'].nunique()}")
print(f"Products per category counts: {df.groupby('CategoryId').size().value_counts().to_dict()}")
print(f"StoreId values: {df['StoreId'].unique()}")
print(f"Price check (Selling Price <= MRP): {(df['Selling Price'] <= df['MRP']).all()}")
print(f"SKU duplicates: {df['SKU'].duplicated().sum()}")
print(f"Product Name duplicates: {df['Product Name'].duplicated().sum()}")

# Export to Excel
filename = "product_import_realistic_india.xlsx"
try:
    df.to_excel(filename, index=False, sheet_name="Products")
    print(f"Successfully exported to {filename}")
except Exception as e:
    print(f"Excel export failed: {e}")
    print("Falling back to CSV...")
    filename = "product_import_realistic_india.csv"
    df.to_csv(filename, index=False)
    print(f"Successfully exported to {filename}")

print(f"File saved: {filename}")
print("\nSample products:")
print(df.head(10).to_string())
print("\nCategory distribution:")
print(df.groupby(['CategoryId', 'Category']).size())
#!/usr/bin/env python3
"""
Script to populate the Django inventory with 300+ Indian products
Run this from the django_backend directory with:
python inventory/populate_products.py
"""

import os
import sys
import django

# Add the django_backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.settings')
django.setup()

from inventory.models import Product

# List of 200 authentic Indian products
products = [
    # Groceries & Staples (30 items)
    {"name": "Basmati Rice", "category": "Groceries", "price": 180, "stock": 45},
    {"name": "Toor Dal", "category": "Groceries", "price": 140, "stock": 35},
    {"name": "Wheat Flour", "category": "Groceries", "price": 45, "stock": 60},
    {"name": "Moong Dal", "category": "Groceries", "price": 120, "stock": 25},
    {"name": "Chana Dal", "category": "Groceries", "price": 95, "stock": 30},
    {"name": "Masoor Dal", "category": "Groceries", "price": 85, "stock": 28},
    {"name": "Urad Dal", "category": "Groceries", "price": 110, "stock": 22},
    {"name": "Besan", "category": "Groceries", "price": 70, "stock": 40},
    {"name": "Sooji", "category": "Groceries", "price": 50, "stock": 35},
    {"name": "Poha", "category": "Groceries", "price": 40, "stock": 50},
    {"name": "Upma Mix", "category": "Groceries", "price": 55, "stock": 25},
    {"name": "Rajma", "category": "Groceries", "price": 160, "stock": 20},
    {"name": "Chole", "category": "Groceries", "price": 90, "stock": 35},
    {"name": "Black Gram", "category": "Groceries", "price": 130, "stock": 18},
    {"name": "Brown Rice", "category": "Groceries", "price": 95, "stock": 30},
    {"name": "Atta", "category": "Groceries", "price": 40, "stock": 100},
    {"name": "Maida", "category": "Groceries", "price": 35, "stock": 80},
    {"name": "Idli Rice", "category": "Groceries", "price": 90, "stock": 45},
    {"name": "Dosa Batter", "category": "Groceries", "price": 50, "stock": 30},
    {"name": "Quinoa", "category": "Groceries", "price": 400, "stock": 15},
    {"name": "Barley", "category": "Groceries", "price": 80, "stock": 40},
    {"name": "Ragi", "category": "Groceries", "price": 70, "stock": 35},
    {"name": "Bajra", "category": "Groceries", "price": 60, "stock": 45},
    {"name": "Jowar", "category": "Groceries", "price": 65, "stock": 40},
    {"name": "Amaranth", "category": "Groceries", "price": 120, "stock": 25},
    {"name": "Buckwheat", "category": "Groceries", "price": 150, "stock": 20},
    {"name": "Millet", "category": "Groceries", "price": 90, "stock": 30},
    {"name": "Oats", "category": "Groceries", "price": 120, "stock": 35},
    {"name": "Cornflakes", "category": "Groceries", "price": 200, "stock": 40},
    {"name": "Muesli", "category": "Groceries", "price": 350, "stock": 20},

    # Spices & Seasonings (25 items)
    {"name": "Turmeric Powder", "category": "Spices", "price": 80, "stock": 45},
    {"name": "Red Chili Powder", "category": "Spices", "price": 120, "stock": 40},
    {"name": "Coriander Powder", "category": "Spices", "price": 90, "stock": 38},
    {"name": "Cumin Powder", "category": "Spices", "price": 200, "stock": 25},
    {"name": "Garam Masala", "category": "Spices", "price": 150, "stock": 30},
    {"name": "Cumin Seeds", "category": "Spices", "price": 350, "stock": 20},
    {"name": "Mustard Seeds", "category": "Spices", "price": 180, "stock": 25},
    {"name": "Fenugreek Seeds", "category": "Spices", "price": 160, "stock": 22},
    {"name": "Cardamom", "category": "Spices", "price": 1200, "stock": 8},
    {"name": "Cloves", "category": "Spices", "price": 800, "stock": 10},
    {"name": "Cinnamon", "category": "Spices", "price": 400, "stock": 15},
    {"name": "Bay Leaves", "category": "Spices", "price": 120, "stock": 20},
    {"name": "Black Pepper", "category": "Spices", "price": 600, "stock": 12},
    {"name": "Asafoetida", "category": "Spices", "price": 450, "stock": 8},
    {"name": "Fennel Seeds", "category": "Spices", "price": 280, "stock": 18},
    {"name": "Sambar Powder", "category": "Spices", "price": 120, "stock": 25},
    {"name": "Rasam Powder", "category": "Spices", "price": 100, "stock": 30},
    {"name": "Pav Bhaji Masala", "category": "Spices", "price": 80, "stock": 35},
    {"name": "Chole Masala", "category": "Spices", "price": 90, "stock": 40},
    {"name": "Biryani Masala", "category": "Spices", "price": 150, "stock": 20},
    {"name": "Chicken Masala", "category": "Spices", "price": 120, "stock": 25},
    {"name": "Tandoori Masala", "category": "Spices", "price": 100, "stock": 30},
    {"name": "Chat Masala", "category": "Spices", "price": 70, "stock": 45},
    {"name": "Amchur Powder", "category": "Spices", "price": 80, "stock": 35},
    {"name": "Saffron", "category": "Spices", "price": 2000, "stock": 5},

    # Vegetables (20 items)
    {"name": "Onion", "category": "Vegetables", "price": 30, "stock": 80},
    {"name": "Potato", "category": "Vegetables", "price": 25, "stock": 90},
    {"name": "Tomato", "category": "Vegetables", "price": 35, "stock": 70},
    {"name": "Green Chili", "category": "Vegetables", "price": 60, "stock": 40},
    {"name": "Ginger", "category": "Vegetables", "price": 80, "stock": 35},
    {"name": "Garlic", "category": "Vegetables", "price": 120, "stock": 25},
    {"name": "Carrot", "category": "Vegetables", "price": 45, "stock": 50},
    {"name": "Cabbage", "category": "Vegetables", "price": 20, "stock": 60},
    {"name": "Cauliflower", "category": "Vegetables", "price": 40, "stock": 35},
    {"name": "Green Beans", "category": "Vegetables", "price": 50, "stock": 40},
    {"name": "Okra", "category": "Vegetables", "price": 60, "stock": 30},
    {"name": "Brinjal", "category": "Vegetables", "price": 35, "stock": 45},
    {"name": "Bottle Gourd", "category": "Vegetables", "price": 25, "stock": 20},
    {"name": "Ridge Gourd", "category": "Vegetables", "price": 40, "stock": 25},
    {"name": "Bitter Gourd", "category": "Vegetables", "price": 55, "stock": 18},
    {"name": "Pumpkin", "category": "Vegetables", "price": 30, "stock": 30},
    {"name": "Spinach", "category": "Vegetables", "price": 25, "stock": 35},
    {"name": "Mint Leaves", "category": "Vegetables", "price": 15, "stock": 25},
    {"name": "Coriander Leaves", "category": "Vegetables", "price": 12, "stock": 40},
    {"name": "Curry Leaves", "category": "Vegetables", "price": 20, "stock": 30},

    # Fruits (15 items)
    {"name": "Apple", "category": "Fruits", "price": 180, "stock": 50},
    {"name": "Banana", "category": "Fruits", "price": 60, "stock": 80},
    {"name": "Orange", "category": "Fruits", "price": 80, "stock": 60},
    {"name": "Mango", "category": "Fruits", "price": 120, "stock": 40},
    {"name": "Grapes", "category": "Fruits", "price": 90, "stock": 35},
    {"name": "Pomegranate", "category": "Fruits", "price": 200, "stock": 25},
    {"name": "Papaya", "category": "Fruits", "price": 40, "stock": 30},
    {"name": "Watermelon", "category": "Fruits", "price": 25, "stock": 20},
    {"name": "Pineapple", "category": "Fruits", "price": 60, "stock": 15},
    {"name": "Guava", "category": "Fruits", "price": 50, "stock": 40},
    {"name": "Sweet Lime", "category": "Fruits", "price": 70, "stock": 35},
    {"name": "Lemon", "category": "Fruits", "price": 80, "stock": 45},
    {"name": "Coconut", "category": "Fruits", "price": 35, "stock": 25},
    {"name": "Dates", "category": "Fruits", "price": 300, "stock": 20},
    {"name": "Kiwi", "category": "Fruits", "price": 250, "stock": 15},

    # Dairy Products (10 items)
    {"name": "Milk", "category": "Dairy", "price": 55, "stock": 100},
    {"name": "Curd", "category": "Dairy", "price": 45, "stock": 60},
    {"name": "Paneer", "category": "Dairy", "price": 350, "stock": 30},
    {"name": "Butter", "category": "Dairy", "price": 120, "stock": 40},
    {"name": "Ghee", "category": "Dairy", "price": 450, "stock": 25},
    {"name": "Cheese", "category": "Dairy", "price": 280, "stock": 20},
    {"name": "Cream", "category": "Dairy", "price": 85, "stock": 30},
    {"name": "Buttermilk", "category": "Dairy", "price": 25, "stock": 50},
    {"name": "Lassi", "category": "Dairy", "price": 40, "stock": 35},
    {"name": "Shrikhand", "category": "Dairy", "price": 120, "stock": 15},

    # Beverages (15 items)
    {"name": "Tea", "category": "Beverages", "price": 250, "stock": 50},
    {"name": "Coffee", "category": "Beverages", "price": 320, "stock": 35},
    {"name": "Bournvita", "category": "Beverages", "price": 180, "stock": 25},
    {"name": "Horlicks", "category": "Beverages", "price": 450, "stock": 20},
    {"name": "Coca Cola", "category": "Beverages", "price": 40, "stock": 60},
    {"name": "Pepsi", "category": "Beverages", "price": 40, "stock": 55},
    {"name": "Thumbs Up", "category": "Beverages", "price": 40, "stock": 45},
    {"name": "Sprite", "category": "Beverages", "price": 40, "stock": 40},
    {"name": "Fanta", "category": "Beverages", "price": 40, "stock": 35},
    {"name": "Limca", "category": "Beverages", "price": 40, "stock": 30},
    {"name": "Mango Frooti", "category": "Beverages", "price": 20, "stock": 80},
    {"name": "Real Juice", "category": "Beverages", "price": 80, "stock": 40},
    {"name": "Tang", "category": "Beverages", "price": 150, "stock": 25},
    {"name": "Rooh Afza", "category": "Beverages", "price": 120, "stock": 20},
    {"name": "Coconut Water", "category": "Beverages", "price": 30, "stock": 50},

    # Snacks & Namkeen (15 items)
    {"name": "Kurkure", "category": "Snacks", "price": 20, "stock": 100},
    {"name": "Lays", "category": "Snacks", "price": 20, "stock": 90},
    {"name": "Bingo", "category": "Snacks", "price": 10, "stock": 80},
    {"name": "Haldiram Bhujia", "category": "Snacks", "price": 80, "stock": 45},
    {"name": "Bikano Namkeen", "category": "Snacks", "price": 120, "stock": 30},
    {"name": "Chana Jor", "category": "Snacks", "price": 60, "stock": 40},
    {"name": "Mixture", "category": "Snacks", "price": 100, "stock": 35},
    {"name": "Sev", "category": "Snacks", "price": 70, "stock": 25},
    {"name": "Mathri", "category": "Snacks", "price": 90, "stock": 20},
    {"name": "Samosa", "category": "Snacks", "price": 15, "stock": 60},
    {"name": "Kachori", "category": "Snacks", "price": 20, "stock": 50},
    {"name": "Dhokla", "category": "Snacks", "price": 80, "stock": 25},
    {"name": "Khakhra", "category": "Snacks", "price": 60, "stock": 30},
    {"name": "Chakli", "category": "Snacks", "price": 120, "stock": 20},
    {"name": "Murukku", "category": "Snacks", "price": 100, "stock": 25},

    # Sweets & Desserts (15 items)
    {"name": "Gulab Jamun", "category": "Sweets", "price": 200, "stock": 30},
    {"name": "Rasgulla", "category": "Sweets", "price": 180, "stock": 25},
    {"name": "Jalebi", "category": "Sweets", "price": 220, "stock": 20},
    {"name": "Barfi", "category": "Sweets", "price": 350, "stock": 15},
    {"name": "Laddu", "category": "Sweets", "price": 300, "stock": 25},
    {"name": "Sandesh", "category": "Sweets", "price": 250, "stock": 20},
    {"name": "Kulfi", "category": "Sweets", "price": 40, "stock": 50},
    {"name": "Ice Cream", "category": "Sweets", "price": 120, "stock": 35},
    {"name": "Kheer", "category": "Sweets", "price": 80, "stock": 30},
    {"name": "Halwa", "category": "Sweets", "price": 150, "stock": 25},
    {"name": "Mysore Pak", "category": "Sweets", "price": 280, "stock": 15},
    {"name": "Kaju Katli", "category": "Sweets", "price": 800, "stock": 10},
    {"name": "Soan Papdi", "category": "Sweets", "price": 120, "stock": 20},
    {"name": "Petha", "category": "Sweets", "price": 200, "stock": 18},
    {"name": "Chocolate", "category": "Sweets", "price": 50, "stock": 60},

    # Cooking Oils & Essentials (15 items)
    {"name": "Mustard Oil", "category": "Cooking Oil", "price": 180, "stock": 50},
    {"name": "Sunflower Oil", "category": "Cooking Oil", "price": 160, "stock": 45},
    {"name": "Groundnut Oil", "category": "Cooking Oil", "price": 200, "stock": 30},
    {"name": "Coconut Oil", "category": "Cooking Oil", "price": 220, "stock": 25},
    {"name": "Sesame Oil", "category": "Cooking Oil", "price": 350, "stock": 15},
    {"name": "Refined Oil", "category": "Cooking Oil", "price": 140, "stock": 60},
    {"name": "Salt", "category": "Cooking Essentials", "price": 20, "stock": 80},
    {"name": "Sugar", "category": "Cooking Essentials", "price": 42, "stock": 70},
    {"name": "Jaggery", "category": "Cooking Essentials", "price": 60, "stock": 40},
    {"name": "Vinegar", "category": "Cooking Essentials", "price": 45, "stock": 30},
    {"name": "Tomato Sauce", "category": "Cooking Essentials", "price": 80, "stock": 35},
    {"name": "Soy Sauce", "category": "Cooking Essentials", "price": 120, "stock": 20},
    {"name": "Maggi", "category": "Cooking Essentials", "price": 12, "stock": 100},
    {"name": "Top Ramen", "category": "Cooking Essentials", "price": 15, "stock": 80},
    {"name": "Pasta", "category": "Cooking Essentials", "price": 80, "stock": 35},

    # Bakery Items (10 items)
    {"name": "Bread", "category": "Bakery", "price": 25, "stock": 60},
    {"name": "Pav", "category": "Bakery", "price": 8, "stock": 80},
    {"name": "Rusk", "category": "Bakery", "price": 40, "stock": 40},
    {"name": "Parle-G", "category": "Bakery", "price": 10, "stock": 100},
    {"name": "Marie Gold", "category": "Bakery", "price": 25, "stock": 60},
    {"name": "Oreo", "category": "Bakery", "price": 45, "stock": 40},
    {"name": "Good Day", "category": "Bakery", "price": 20, "stock": 50},
    {"name": "Monaco", "category": "Bakery", "price": 20, "stock": 55},
    {"name": "Cake", "category": "Bakery", "price": 200, "stock": 20},
    {"name": "Pastry", "category": "Bakery", "price": 80, "stock": 30},

    # Traditional Indian Items (10 items)
    {"name": "Pickle", "category": "Traditional", "price": 180, "stock": 30},
    {"name": "Papad", "category": "Traditional", "price": 60, "stock": 40},
    {"name": "Chutney", "category": "Traditional", "price": 120, "stock": 25},
    {"name": "Gulkand", "category": "Traditional", "price": 150, "stock": 15},
    {"name": "Murabba", "category": "Traditional", "price": 200, "stock": 20},
    {"name": "Paan Leaves", "category": "Traditional", "price": 20, "stock": 50},
    {"name": "Supari", "category": "Traditional", "price": 100, "stock": 25},
    {"name": "Camphor", "category": "Traditional", "price": 80, "stock": 30},
    {"name": "Henna", "category": "Traditional", "price": 60, "stock": 20},
    {"name": "Kumkum", "category": "Traditional", "price": 40, "stock": 35},

    # Indian Beverages (10 items)
    {"name": "Masala Chai", "category": "Indian Beverages", "price": 300, "stock": 25},
    {"name": "Filter Coffee", "category": "Indian Beverages", "price": 400, "stock": 20},
    {"name": "Thandai", "category": "Indian Beverages", "price": 180, "stock": 15},
    {"name": "Kokam Juice", "category": "Indian Beverages", "price": 120, "stock": 20},
    {"name": "Aam Panna", "category": "Indian Beverages", "price": 80, "stock": 30},
    {"name": "Jaljeera", "category": "Indian Beverages", "price": 25, "stock": 40},
    {"name": "Nimbu Paani", "category": "Indian Beverages", "price": 20, "stock": 50},
    {"name": "Sugarcane Juice", "category": "Indian Beverages", "price": 30, "stock": 35},
    {"name": "Badam Milk", "category": "Indian Beverages", "price": 60, "stock": 25},
    {"name": "Kesari Milk", "category": "Indian Beverages", "price": 80, "stock": 20},

    # Personal Care & Hygiene (25 items)
    {"name": "Colgate Toothpaste", "category": "Personal Care", "price": 45, "stock": 50},
    {"name": "Pepsodent Toothpaste", "category": "Personal Care", "price": 40, "stock": 45},
    {"name": "Sensodyne Toothpaste", "category": "Personal Care", "price": 180, "stock": 20},
    {"name": "Oral-B Toothbrush", "category": "Personal Care", "price": 35, "stock": 40},
    {"name": "Lux Soap", "category": "Personal Care", "price": 35, "stock": 60},
    {"name": "Dove Soap", "category": "Personal Care", "price": 80, "stock": 30},
    {"name": "Lifebuoy Soap", "category": "Personal Care", "price": 25, "stock": 50},
    {"name": "Medimix Soap", "category": "Personal Care", "price": 45, "stock": 35},
    {"name": "Mysore Sandal Soap", "category": "Personal Care", "price": 60, "stock": 25},
    {"name": "Head & Shoulders Shampoo", "category": "Personal Care", "price": 180, "stock": 30},
    {"name": "Clinic Plus Shampoo", "category": "Personal Care", "price": 90, "stock": 40},
    {"name": "Sunsilk Shampoo", "category": "Personal Care", "price": 120, "stock": 35},
    {"name": "Pantene Shampoo", "category": "Personal Care", "price": 200, "stock": 25},
    {"name": "Coconut Hair Oil", "category": "Personal Care", "price": 150, "stock": 40},
    {"name": "Mustard Hair Oil", "category": "Personal Care", "price": 180, "stock": 35},
    {"name": "Almond Hair Oil", "category": "Personal Care", "price": 350, "stock": 20},
    {"name": "Face Wash", "category": "Personal Care", "price": 120, "stock": 30},
    {"name": "Moisturizer", "category": "Personal Care", "price": 200, "stock": 25},
    {"name": "Sunscreen", "category": "Personal Care", "price": 250, "stock": 20},
    {"name": "Deodorant", "category": "Personal Care", "price": 180, "stock": 35},
    {"name": "Perfume", "category": "Personal Care", "price": 500, "stock": 15},
    {"name": "Aftershave", "category": "Personal Care", "price": 300, "stock": 18},
    {"name": "Hair Gel", "category": "Personal Care", "price": 120, "stock": 25},
    {"name": "Hair Wax", "category": "Personal Care", "price": 150, "stock": 20},
    {"name": "Talcum Powder", "category": "Personal Care", "price": 80, "stock": 30},

    # Household Items (25 items)
    {"name": "Detergent Powder", "category": "Household", "price": 180, "stock": 40},
    {"name": "Vim Dishwash", "category": "Household", "price": 80, "stock": 50},
    {"name": "Harpic Toilet Cleaner", "category": "Household", "price": 120, "stock": 30},
    {"name": "Colin Glass Cleaner", "category": "Household", "price": 90, "stock": 25},
    {"name": "Lizol Floor Cleaner", "category": "Household", "price": 150, "stock": 35},
    {"name": "Dettol Antiseptic", "category": "Household", "price": 120, "stock": 40},
    {"name": "Savlon Antiseptic", "category": "Household", "price": 100, "stock": 30},
    {"name": "Phenyl", "category": "Household", "price": 60, "stock": 45},
    {"name": "Toilet Paper", "category": "Household", "price": 80, "stock": 35},
    {"name": "Tissues", "category": "Household", "price": 45, "stock": 50},
    {"name": "Matchbox", "category": "Household", "price": 5, "stock": 100},
    {"name": "Candles", "category": "Household", "price": 20, "stock": 60},
    {"name": "Incense Sticks", "category": "Household", "price": 25, "stock": 80},
    {"name": "Mosquito Coil", "category": "Household", "price": 15, "stock": 70},
    {"name": "All Out Refill", "category": "Household", "price": 180, "stock": 25},
    {"name": "Good Knight Refill", "category": "Household", "price": 160, "stock": 30},
    {"name": "Broom", "category": "Household", "price": 120, "stock": 20},
    {"name": "Mop", "category": "Household", "price": 200, "stock": 15},
    {"name": "Bucket", "category": "Household", "price": 350, "stock": 10},
    {"name": "Plastic Bags", "category": "Household", "price": 80, "stock": 40},
    {"name": "Aluminum Foil", "category": "Household", "price": 120, "stock": 25},
    {"name": "Cling Film", "category": "Household", "price": 150, "stock": 20},
    {"name": "Steel Wool", "category": "Household", "price": 40, "stock": 50},
    {"name": "Sponge", "category": "Household", "price": 25, "stock": 60},
    {"name": "Rubber Gloves", "category": "Household", "price": 80, "stock": 25},

    # Electronics & Mobile Accessories (20 items)
    {"name": "Phone Charger", "category": "Electronics", "price": 250, "stock": 30},
    {"name": "Earphones", "category": "Electronics", "price": 150, "stock": 25},
    {"name": "Power Bank", "category": "Electronics", "price": 800, "stock": 15},
    {"name": "Memory Card", "category": "Electronics", "price": 400, "stock": 20},
    {"name": "Mobile Cover", "category": "Electronics", "price": 200, "stock": 35},
    {"name": "Screen Guard", "category": "Electronics", "price": 100, "stock": 40},
    {"name": "Battery AAA", "category": "Electronics", "price": 80, "stock": 30},
    {"name": "Battery AA", "category": "Electronics", "price": 70, "stock": 35},
    {"name": "LED Bulb", "category": "Electronics", "price": 120, "stock": 25},
    {"name": "CFL Bulb", "category": "Electronics", "price": 180, "stock": 20},
    {"name": "Torch", "category": "Electronics", "price": 200, "stock": 20},
    {"name": "Extension Cord", "category": "Electronics", "price": 350, "stock": 15},
    {"name": "Adapter", "category": "Electronics", "price": 180, "stock": 25},
    {"name": "USB Cable", "category": "Electronics", "price": 120, "stock": 30},
    {"name": "Bluetooth Speaker", "category": "Electronics", "price": 1200, "stock": 10},
    {"name": "Phone Stand", "category": "Electronics", "price": 150, "stock": 20},
    {"name": "Car Charger", "category": "Electronics", "price": 300, "stock": 15},
    {"name": "Headphones", "category": "Electronics", "price": 800, "stock": 12},
    {"name": "Wireless Mouse", "category": "Electronics", "price": 600, "stock": 18},
    {"name": "Keyboard", "category": "Electronics", "price": 1000, "stock": 10},

    # Medicines & Health (20 items)
    {"name": "Paracetamol", "category": "Medicine", "price": 20, "stock": 50},
    {"name": "Crocin", "category": "Medicine", "price": 25, "stock": 40},
    {"name": "Disprin", "category": "Medicine", "price": 15, "stock": 60},
    {"name": "Vicks VapoRub", "category": "Medicine", "price": 80, "stock": 30},
    {"name": "Bandage", "category": "Medicine", "price": 35, "stock": 25},
    {"name": "Cotton", "category": "Medicine", "price": 40, "stock": 35},
    {"name": "Antiseptic Liquid", "category": "Medicine", "price": 60, "stock": 20},
    {"name": "Thermometer", "category": "Medicine", "price": 150, "stock": 15},
    {"name": "Hand Sanitizer", "category": "Medicine", "price": 80, "stock": 40},
    {"name": "Face Mask", "category": "Medicine", "price": 5, "stock": 100},
    {"name": "Multivitamin", "category": "Medicine", "price": 400, "stock": 25},
    {"name": "Vitamin C", "category": "Medicine", "price": 200, "stock": 30},
    {"name": "Vitamin D", "category": "Medicine", "price": 250, "stock": 28},
    {"name": "Calcium Tablets", "category": "Medicine", "price": 180, "stock": 25},
    {"name": "Iron Tablets", "category": "Medicine", "price": 150, "stock": 30},
    {"name": "ORS Powder", "category": "Medicine", "price": 10, "stock": 80},
    {"name": "Cough Syrup", "category": "Medicine", "price": 120, "stock": 20},
    {"name": "Antacid", "category": "Medicine", "price": 80, "stock": 25},
    {"name": "Pain Relief Gel", "category": "Medicine", "price": 100, "stock": 22},
    {"name": "First Aid Kit", "category": "Medicine", "price": 300, "stock": 15},

    # Stationery & Office Supplies (20 items)
    {"name": "Pen", "category": "Stationery", "price": 10, "stock": 100},
    {"name": "Pencil", "category": "Stationery", "price": 5, "stock": 80},
    {"name": "Eraser", "category": "Stationery", "price": 5, "stock": 70},
    {"name": "Notebook", "category": "Stationery", "price": 40, "stock": 50},
    {"name": "A4 Paper", "category": "Stationery", "price": 300, "stock": 25},
    {"name": "Marker", "category": "Stationery", "price": 25, "stock": 40},
    {"name": "Glue Stick", "category": "Stationery", "price": 15, "stock": 35},
    {"name": "Scissors", "category": "Stationery", "price": 80, "stock": 20},
    {"name": "Stapler", "category": "Stationery", "price": 120, "stock": 15},
    {"name": "Envelope", "category": "Stationery", "price": 2, "stock": 200},
    {"name": "Highlighter", "category": "Stationery", "price": 20, "stock": 45},
    {"name": "Ruler", "category": "Stationery", "price": 15, "stock": 30},
    {"name": "Compass", "category": "Stationery", "price": 50, "stock": 25},
    {"name": "Calculator", "category": "Stationery", "price": 200, "stock": 20},
    {"name": "Sticky Notes", "category": "Stationery", "price": 30, "stock": 35},
    {"name": "Paper Clips", "category": "Stationery", "price": 20, "stock": 40},
    {"name": "Rubber Bands", "category": "Stationery", "price": 15, "stock": 45},
    {"name": "Tape", "category": "Stationery", "price": 25, "stock": 50},
    {"name": "Whiteboard Marker", "category": "Stationery", "price": 40, "stock": 25},
    {"name": "File Folder", "category": "Stationery", "price": 35, "stock": 30},

    # Baby Care (15 items)
    {"name": "Baby Soap", "category": "Baby Care", "price": 80, "stock": 25},
    {"name": "Baby Oil", "category": "Baby Care", "price": 120, "stock": 20},
    {"name": "Baby Powder", "category": "Baby Care", "price": 100, "stock": 30},
    {"name": "Baby Lotion", "category": "Baby Care", "price": 150, "stock": 18},
    {"name": "Diapers", "category": "Baby Care", "price": 400, "stock": 15},
    {"name": "Baby Shampoo", "category": "Baby Care", "price": 180, "stock": 20},
    {"name": "Baby Cream", "category": "Baby Care", "price": 120, "stock": 25},
    {"name": "Feeding Bottle", "category": "Baby Care", "price": 200, "stock": 12},
    {"name": "Baby Wipes", "category": "Baby Care", "price": 150, "stock": 20},
    {"name": "Baby Food", "category": "Baby Care", "price": 180, "stock": 15},
    {"name": "Baby Bib", "category": "Baby Care", "price": 50, "stock": 25},
    {"name": "Baby Towel", "category": "Baby Care", "price": 200, "stock": 15},
    {"name": "Baby Pacifier", "category": "Baby Care", "price": 80, "stock": 20},
    {"name": "Baby Rattle", "category": "Baby Care", "price": 120, "stock": 18},
    {"name": "Baby Teether", "category": "Baby Care", "price": 100, "stock": 22},

    # Pet Care (10 items)
    {"name": "Dog Food", "category": "Pet Care", "price": 400, "stock": 20},
    {"name": "Cat Food", "category": "Pet Care", "price": 300, "stock": 15},
    {"name": "Bird Food", "category": "Pet Care", "price": 150, "stock": 10},
    {"name": "Fish Food", "category": "Pet Care", "price": 80, "stock": 12},
    {"name": "Pet Shampoo", "category": "Pet Care", "price": 200, "stock": 8},
    {"name": "Dog Collar", "category": "Pet Care", "price": 250, "stock": 12},
    {"name": "Cat Litter", "category": "Pet Care", "price": 300, "stock": 10},
    {"name": "Pet Brush", "category": "Pet Care", "price": 150, "stock": 15},
    {"name": "Pet Toy", "category": "Pet Care", "price": 120, "stock": 18},
    {"name": "Pet Bowl", "category": "Pet Care", "price": 180, "stock": 20},

    # Automotive (15 items)
    {"name": "Engine Oil", "category": "Automotive", "price": 800, "stock": 15},
    {"name": "Car Shampoo", "category": "Automotive", "price": 200, "stock": 20},
    {"name": "Car Polish", "category": "Automotive", "price": 300, "stock": 15},
    {"name": "Air Freshener", "category": "Automotive", "price": 80, "stock": 25},
    {"name": "Car Wax", "category": "Automotive", "price": 400, "stock": 12},
    {"name": "Tire Cleaner", "category": "Automotive", "price": 250, "stock": 15},
    {"name": "Windshield Wiper", "category": "Automotive", "price": 150, "stock": 18},
    {"name": "Coolant", "category": "Automotive", "price": 300, "stock": 10},
    {"name": "Brake Fluid", "category": "Automotive", "price": 200, "stock": 12},
    {"name": "Car Sponge", "category": "Automotive", "price": 50, "stock": 30},
    {"name": "Microfiber Cloth", "category": "Automotive", "price": 100, "stock": 25},
    {"name": "Jumper Cables", "category": "Automotive", "price": 800, "stock": 8},
    {"name": "Car Mat", "category": "Automotive", "price": 500, "stock": 10},
    {"name": "Seat Cover", "category": "Automotive", "price": 1200, "stock": 5},
    {"name": "Steering Wheel Cover", "category": "Automotive", "price": 300, "stock": 12},

    # Books & Media (10 items)
    {"name": "Novel", "category": "Books", "price": 200, "stock": 25},
    {"name": "Magazine", "category": "Books", "price": 50, "stock": 40},
    {"name": "Newspaper", "category": "Books", "price": 5, "stock": 100},
    {"name": "Comics", "category": "Books", "price": 80, "stock": 30},
    {"name": "Dictionary", "category": "Books", "price": 300, "stock": 15},
    {"name": "Atlas", "category": "Books", "price": 400, "stock": 10},
    {"name": "Children's Book", "category": "Books", "price": 120, "stock": 20},
    {"name": "Recipe Book", "category": "Books", "price": 250, "stock": 15},
    {"name": "Travel Guide", "category": "Books", "price": 350, "stock": 12},
    {"name": "Puzzle Book", "category": "Books", "price": 100, "stock": 18},

    # Sports & Fitness (15 items)
    {"name": "Cricket Ball", "category": "Sports", "price": 150, "stock": 20},
    {"name": "Cricket Bat", "category": "Sports", "price": 1500, "stock": 8},
    {"name": "Football", "category": "Sports", "price": 800, "stock": 12},
    {"name": "Badminton Racket", "category": "Sports", "price": 600, "stock": 15},
    {"name": "Shuttlecock", "category": "Sports", "price": 100, "stock": 25},
    {"name": "Table Tennis Ball", "category": "Sports", "price": 50, "stock": 30},
    {"name": "Skipping Rope", "category": "Sports", "price": 200, "stock": 18},
    {"name": "Yoga Mat", "category": "Sports", "price": 800, "stock": 12},
    {"name": "Dumbbell", "category": "Sports", "price": 1200, "stock": 10},
    {"name": "Resistance Band", "category": "Sports", "price": 300, "stock": 15},
    {"name": "Water Bottle", "category": "Sports", "price": 150, "stock": 25},
    {"name": "Sports Shoes", "category": "Sports", "price": 2000, "stock": 15},
    {"name": "Track Suit", "category": "Sports", "price": 1500, "stock": 12},
    {"name": "Sports T-Shirt", "category": "Sports", "price": 500, "stock": 20},
    {"name": "Sports Cap", "category": "Sports", "price": 200, "stock": 25},

    # Kitchen Utensils (20 items)
    {"name": "Pressure Cooker", "category": "Kitchen", "price": 2000, "stock": 8},
    {"name": "Non-Stick Pan", "category": "Kitchen", "price": 800, "stock": 15},
    {"name": "Steel Plate", "category": "Kitchen", "price": 100, "stock": 30},
    {"name": "Steel Bowl", "category": "Kitchen", "price": 80, "stock": 35},
    {"name": "Steel Glass", "category": "Kitchen", "price": 60, "stock": 40},
    {"name": "Knife Set", "category": "Kitchen", "price": 500, "stock": 15},
    {"name": "Cutting Board", "category": "Kitchen", "price": 200, "stock": 20},
    {"name": "Mixer Grinder", "category": "Kitchen", "price": 3000, "stock": 5},
    {"name": "Rice Cooker", "category": "Kitchen", "price": 1500, "stock": 8},
    {"name": "Electric Kettle", "category": "Kitchen", "price": 1200, "stock": 10},
    {"name": "Tiffin Box", "category": "Kitchen", "price": 200, "stock": 25},
    {"name": "Storage Container", "category": "Kitchen", "price": 150, "stock": 30},
    {"name": "Spoon Set", "category": "Kitchen", "price": 120, "stock": 25},
    {"name": "Ladle", "category": "Kitchen", "price": 80, "stock": 30},
    {"name": "Spatula", "category": "Kitchen", "price": 60, "stock": 35},
    {"name": "Strainer", "category": "Kitchen", "price": 100, "stock": 20},
    {"name": "Grater", "category": "Kitchen", "price": 120, "stock": 18},
    {"name": "Peeler", "category": "Kitchen", "price": 40, "stock": 40},
    {"name": "Can Opener", "category": "Kitchen", "price": 80, "stock": 25},
    {"name": "Kitchen Towel", "category": "Kitchen", "price": 50, "stock": 35},

    # Home Decor (10 items)
    {"name": "Photo Frame", "category": "Home Decor", "price": 200, "stock": 20},
    {"name": "Wall Clock", "category": "Home Decor", "price": 500, "stock": 15},
    {"name": "Flower Vase", "category": "Home Decor", "price": 300, "stock": 12},
    {"name": "Curtains", "category": "Home Decor", "price": 800, "stock": 10},
    {"name": "Cushion Cover", "category": "Home Decor", "price": 150, "stock": 25},
    {"name": "Table Lamp", "category": "Home Decor", "price": 600, "stock": 15},
    {"name": "Wall Sticker", "category": "Home Decor", "price": 100, "stock": 20},
    {"name": "Artificial Plant", "category": "Home Decor", "price": 250, "stock": 18},
    {"name": "Wind Chimes", "category": "Home Decor", "price": 200, "stock": 15},
    {"name": "Door Mat", "category": "Home Decor", "price": 300, "stock": 12},
]

def populate_products():
    """Populate the database with Indian products"""
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    print("Starting product population...")
    print(f"Total products to add: {len(products)}")
    print("-" * 50)
    
    for i, product_data in enumerate(products, 1):
        try:
            # Check if product already exists
            if Product.objects.filter(name=product_data["name"]).exists():
                print(f"⚠️  Skipped: {product_data['name']} (already exists)")
                skipped_count += 1
                continue
            
            # Create new product with demand_level set to 'Normal'
            product = Product.objects.create(
                name=product_data["name"],
                category=product_data["category"],
                price=product_data["price"],
                stock=product_data["stock"],
                demand_level="Normal"
            )
            
            success_count += 1
            print(f"✅ Added: {product.name} - ₹{product.price} ({product.category}) - Stock: {product.stock}")
            
        except Exception as e:
            error_count += 1
            print(f"❌ Error adding {product_data['name']}: {str(e)}")
            
        # Progress update every 25 items
        if i % 25 == 0:
            print(f"\n📊 Progress: {i}/{len(products)} products processed")
            print(f"   ✅ Added: {success_count} | ⚠️  Skipped: {skipped_count} | ❌ Errors: {error_count}")
            print("-" * 50)
            
    print(f"\n🎉 Product Population Complete!")
    print(f"=" * 50)
    print(f"✅ Successfully added: {success_count} products")
    print(f"⚠️  Skipped (already exist): {skipped_count} products")
    print(f"❌ Failed to add: {error_count} products")
    print(f"📊 Total processed: {success_count + skipped_count + error_count} products")
    print(f"📈 Total products in database: {Product.objects.count()}")
    
    # Show category breakdown
    print(f"\n📋 Category Breakdown:")
    categories = Product.objects.values('category').distinct()
    for category in categories:
        count = Product.objects.filter(category=category['category']).count()
        print(f"   {category['category']}: {count} products")

if __name__ == "__main__":
    populate_products()


# cd StoreZen/django_backend
# python inventory/populate_products.py
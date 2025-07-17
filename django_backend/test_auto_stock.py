#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/Users/ishan/StoreZen/django_backend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.settings')

# Setup Django
django.setup()

from inventory.models import Product

# Clear existing products
Product.objects.all().delete()

# Add sample products with different stock levels to test automatic in_stock
products = [
    # Products with stock > 0 (should be in_stock = True)
    Product(name="iPhone 15", category="Electronics", price=82999.00, stock=25),
    Product(name="Samsung Galaxy S24", category="Electronics", price=74999.00, stock=18),
    Product(name="MacBook Pro 16-inch", category="Electronics", price=199999.00, stock=5),
    Product(name="Wireless Headphones", category="Electronics", price=15999.00, stock=30),
    Product(name="Nike Air Max", category="Footwear", price=10999.00, stock=50),
    Product(name="Levi's Jeans", category="Clothing", price=6499.00, stock=28),
    Product(name="Coffee Mug", category="Home", price=999.00, stock=100),
    Product(name="Gaming Chair", category="Furniture", price=24999.00, stock=3),
    
    # Products with stock = 0 (should be in_stock = False automatically)
    Product(name="Adidas Ultraboost", category="Footwear", price=14999.00, stock=0),
    Product(name="Office Desk", category="Furniture", price=15999.00, stock=0),
    Product(name="Bluetooth Speaker", category="Electronics", price=3999.00, stock=0),
    Product(name="Winter Jacket", category="Clothing", price=7499.00, stock=0),
]

for product in products:
    product.save()  # This will automatically set in_stock based on stock

print("Sample products added successfully!")
print(f"Total products: {Product.objects.count()}")

print("\n✅ Products IN STOCK (stock > 0):")
for product in Product.objects.filter(in_stock=True):
    print(f"  - {product.name} | Stock: {product.stock} | In Stock: {product.in_stock}")

print("\n❌ Products OUT OF STOCK (stock = 0):")
for product in Product.objects.filter(in_stock=False):
    print(f"  - {product.name} | Stock: {product.stock} | In Stock: {product.in_stock}")

print(f"\n📊 Summary:")
print(f"  - In Stock: {Product.objects.filter(in_stock=True).count()} products")
print(f"  - Out of Stock: {Product.objects.filter(in_stock=False).count()} products")

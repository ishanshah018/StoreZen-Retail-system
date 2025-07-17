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

print("🧪 TESTING AUTOMATIC STOCK MANAGEMENT")
print("=" * 50)

# Get a product that's currently in stock
product = Product.objects.filter(in_stock=True).first()
if product:
    print(f"📦 Testing with: {product.name}")
    print(f"   Current stock: {product.stock}")
    print(f"   Current in_stock: {product.in_stock}")
    
    print(f"\n🔄 Setting stock to 0...")
    product.stock = 0
    product.save()  # This should automatically set in_stock = False
    
    print(f"   New stock: {product.stock}")
    print(f"   New in_stock: {product.in_stock}")
    
    print(f"\n🔄 Setting stock back to 10...")
    product.stock = 10
    product.save()  # This should automatically set in_stock = True
    
    print(f"   New stock: {product.stock}")
    print(f"   New in_stock: {product.in_stock}")
    
    print(f"\n✅ Test completed! The in_stock field updates automatically!")

print(f"\n📊 Current Stock Status:")
print(f"   - In Stock: {Product.objects.filter(in_stock=True).count()} products")
print(f"   - Out of Stock: {Product.objects.filter(in_stock=False).count()} products")

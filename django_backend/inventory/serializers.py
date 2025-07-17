from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer for managers"""
    in_stock = serializers.ReadOnlyField()  # Make in_stock read-only
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['in_stock']  # Ensure in_stock is read-only

class CustomerProductSerializer(serializers.ModelSerializer):
    """Product serializer for customers (excludes demand_level)"""
    in_stock = serializers.ReadOnlyField()  # Make in_stock read-only
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'stock', 'in_stock']
        read_only_fields = ['in_stock']  # Ensure in_stock is read-only
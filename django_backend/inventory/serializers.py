from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Full product serializer - Used by manager dashboard with all fields including profit data
    """
    in_stock = serializers.ReadOnlyField()  # Make in_stock read-only
    profit_per_unit = serializers.ReadOnlyField()  # Auto-calculated field
    profit_margin = serializers.ReadOnlyField()  # Auto-calculated field
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['in_stock', 'profit_per_unit', 'profit_margin']


class CustomerProductSerializer(serializers.ModelSerializer):
    """
    Customer product serializer - Limited fields for public customer view (cost_price hidden)
    """
    in_stock = serializers.ReadOnlyField()  # Make in_stock read-only
    price = serializers.DecimalField(source='selling_price', max_digits=10, decimal_places=2, read_only=True)  # Alias for compatibility
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'stock', 'in_stock']
        read_only_fields = ['in_stock']
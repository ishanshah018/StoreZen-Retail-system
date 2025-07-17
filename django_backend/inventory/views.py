from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer, CustomerProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """Full CRUD operations for managers"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

@api_view(['GET'])
def customer_products(request):
    """Get products for customers (excludes demand_level)"""
    category = request.GET.get('category')
    if category:
        products = Product.objects.filter(in_stock=True, category=category)
    else:
        products = Product.objects.filter(in_stock=True)
    serializer = CustomerProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    """Get all unique categories from products"""
    categories = Product.objects.filter(in_stock=True).values_list('category', flat=True).distinct()
    return Response(list(categories))
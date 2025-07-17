from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, customer_products, get_categories

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('customer/products/', customer_products, name='customer-products'),
    path('customer/categories/', get_categories, name='customer-categories'),
]
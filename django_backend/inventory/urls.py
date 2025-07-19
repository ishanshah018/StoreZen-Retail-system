from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, 
    customer_products, 
    get_categories,
    manager_profile,
    test_whatsapp_alert,
    check_low_stock_alerts,
    low_stock_alerts_history,
    download_stock_pdf
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('customer/products/', customer_products, name='customer-products'),
    path('customer/categories/', get_categories, name='customer-categories'),
    path('manager/profile/', manager_profile, name='manager-profile'),
    path('manager/test-whatsapp/', test_whatsapp_alert, name='test-whatsapp'),
    path('manager/check-alerts/', check_low_stock_alerts, name='check-alerts'),
    path('manager/alerts-history/', low_stock_alerts_history, name='alerts-history'),
    path('manager/download-stock-pdf/', download_stock_pdf, name='download-stock-pdf'),
]
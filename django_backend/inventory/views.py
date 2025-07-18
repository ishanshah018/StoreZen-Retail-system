import json
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Product, ManagerProfile, LowStockAlert
from .serializers import ProductSerializer, CustomerProductSerializer
from .whatsapp_service import WhatsAppService


# Node.js server configuration for manager profile data
NODE_SERVER_URL = 'http://localhost:8000'


def get_manager_profile_from_mongodb():
    """
    Fetch manager profile from Node.js MongoDB server
    """
    try:
        response = requests.get(f'{NODE_SERVER_URL}/manager/profile')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('manager')
        return None
    except Exception as e:
        print(f"Error fetching manager profile from MongoDB: {e}")
        return None


class ProductViewSet(viewsets.ModelViewSet):
    """
    Product management - Full CRUD operations for manager dashboard
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def update(self, request, *args, **kwargs):
        """Override update to check for low stock alerts after product update"""
        response = super().update(request, *args, **kwargs)
        
        # After updating product, check if we need to send alerts
        if response.status_code == 200:
            product = self.get_object()
            self.check_low_stock_alert(product)
        
        return response
    
    def create(self, request, *args, **kwargs):
        """Override create to check for low stock alerts after product creation"""
        response = super().create(request, *args, **kwargs)
        
        # After creating product, check if we need to send alerts
        if response.status_code == 201:
            product_id = response.data.get('id')
            if product_id:
                product = Product.objects.get(id=product_id)
                self.check_low_stock_alert(product)
        
        return response
    
    def check_low_stock_alert(self, product):
        """Check if product stock is below threshold and send WhatsApp alert"""
        try:
            # Get manager profile from MongoDB via Node.js
            manager_profile = get_manager_profile_from_mongodb()
            
            if manager_profile and manager_profile.get('whatsappAlertsEnabled') and manager_profile.get('whatsappNumber'):
                threshold = manager_profile.get('lowStockThreshold', 10)
                if product.stock <= threshold:
                    whatsapp_service = WhatsAppService()
                    whatsapp_service.check_and_send_alerts(
                        manager_profile['whatsappNumber'],
                        threshold
                    )
        except Exception as e:
            print(f"Error checking low stock alert: {e}")


@api_view(['GET'])
def customer_products(request):
    """
    Get products for customer view - excludes sensitive data like demand_level
    """
    category = request.GET.get('category')
    if category:
        products = Product.objects.filter(in_stock=True, category=category)
    else:
        products = Product.objects.filter(in_stock=True)
    serializer = CustomerProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_categories(request):
    """
    Get all unique product categories for customer filtering
    """
    categories = Product.objects.filter(in_stock=True).values_list('category', flat=True).distinct()
    return Response(list(categories))


@api_view(['GET', 'POST'])
def manager_profile(request):
    """
    Legacy manager profile endpoint - kept for backward compatibility
    """
    if request.method == 'GET':
        try:
            profile = ManagerProfile.objects.first()
            if not profile:
                profile = ManagerProfile.objects.create()
            
            return Response({
                'id': profile.id,
                'name': profile.name,
                'store_address': profile.store_address,
                'email': profile.email,
                'contact': profile.contact,
                'whatsapp_number': profile.whatsapp_number,
                'low_stock_threshold': profile.low_stock_threshold,
                'whatsapp_alerts_enabled': profile.whatsapp_alerts_enabled,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            profile = ManagerProfile.objects.first()
            if not profile:
                profile = ManagerProfile.objects.create()
            
            # Update profile fields
            profile.name = request.data.get('name', profile.name)
            profile.store_address = request.data.get('store_address', profile.store_address)
            profile.email = request.data.get('email', profile.email)
            profile.contact = request.data.get('contact', profile.contact)
            profile.whatsapp_number = request.data.get('whatsapp_number', profile.whatsapp_number)
            profile.low_stock_threshold = request.data.get('low_stock_threshold', profile.low_stock_threshold)
            profile.whatsapp_alerts_enabled = request.data.get('whatsapp_alerts_enabled', profile.whatsapp_alerts_enabled)
            
            profile.save()
            
            return Response({
                'message': 'Profile updated successfully',
                'profile': {
                    'id': profile.id,
                    'name': profile.name,
                    'store_address': profile.store_address,
                    'email': profile.email,
                    'contact': profile.contact,
                    'whatsapp_number': profile.whatsapp_number,
                    'low_stock_threshold': profile.low_stock_threshold,
                    'whatsapp_alerts_enabled': profile.whatsapp_alerts_enabled,
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def test_whatsapp_alert(request):
    """
    Test WhatsApp alert functionality - sends sample message to manager
    """
    try:
        # Get manager profile from MongoDB via Node.js
        manager_profile = get_manager_profile_from_mongodb()
        
        if not manager_profile:
            return Response({'error': 'Manager profile not found'}, status=400)
        
        whatsapp_number = manager_profile.get('whatsappNumber')
        if not whatsapp_number:
            return Response({'error': 'Manager WhatsApp number not configured'}, status=400)
        
        threshold = manager_profile.get('lowStockThreshold', 10)
        
        whatsapp_service = WhatsAppService()
        success = whatsapp_service.send_low_stock_alert(
            whatsapp_number,
            "Test Product",
            5,
            threshold
        )
        
        if success:
            return Response({'message': f'Test WhatsApp message sent successfully (threshold: {threshold})'})
        else:
            return Response({'error': 'Failed to send WhatsApp message'}, status=500)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def check_low_stock_alerts(request):
    """
    Manually trigger low stock alert check - scans all products and sends alerts
    """
    try:
        # Get manager profile from MongoDB via Node.js
        manager_profile = get_manager_profile_from_mongodb()
        
        if not manager_profile:
            return Response({'error': 'Manager profile not found'}, status=400)
        
        if not manager_profile.get('whatsappAlertsEnabled', False):
            return Response({'message': 'WhatsApp alerts are disabled'})
        
        whatsapp_number = manager_profile.get('whatsappNumber')
        if not whatsapp_number:
            return Response({'error': 'Manager WhatsApp number not configured'}, status=400)
        
        threshold = manager_profile.get('lowStockThreshold', 10)
        
        whatsapp_service = WhatsAppService()
        whatsapp_service.check_and_send_alerts(
            whatsapp_number,
            threshold
        )
        
        return Response({
            'message': f'Low stock check completed',
            'threshold': threshold
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def low_stock_alerts_history(request):
    """
    Get history of sent low stock alerts for monitoring
    """
    try:
        alerts = LowStockAlert.objects.all().order_by('-sent_at')[:50]  # Last 50 alerts
        
        alerts_data = []
        for alert in alerts:
            alerts_data.append({
                'id': alert.id,
                'product_name': alert.product.name,
                'stock_at_alert': alert.stock_at_alert,
                'threshold_value': alert.threshold_value,
                'sent_at': alert.sent_at.isoformat(),
                'is_resolved': alert.is_resolved,
                'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None,
            })
        
        return Response(alerts_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
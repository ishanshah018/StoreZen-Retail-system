import json
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Product, ManagerProfile, LowStockAlert
from .serializers import ProductSerializer, CustomerProductSerializer
from .whatsapp_service import WhatsAppService


# Node.js server configuration for manager profile data
NODE_SERVER_URL = 'http://localhost:8080'


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
            
            if manager_profile and manager_profile.get('whatsappAlertsEnabled') and manager_profile.get('contact'):
                threshold = manager_profile.get('lowStockThreshold', 10)
                if product.stock <= threshold:
                    whatsapp_service = WhatsAppService()
                    whatsapp_service.check_and_send_alerts(
                        manager_profile['contact'],
                        threshold
                    )
        except Exception as e:
            print(f"Error checking low stock alert: {e}")


@api_view(['GET'])
def customer_products(request):
    """
    Get products for customer view - shows ALL products (in-stock and out-of-stock)
    Excludes sensitive data like demand_level
    """
    category = request.GET.get('category')
    if category:
        products = Product.objects.filter(category=category)
    else:
        products = Product.objects.all()
    serializer = CustomerProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_categories(request):
    """
    Get all unique product categories (includes categories of out-of-stock products)
    """
    categories = Product.objects.all().values_list('category', flat=True).distinct()
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
        
        whatsapp_number = manager_profile.get('contact')
        if not whatsapp_number:
            return Response({'error': 'Manager contact number not configured'}, status=400)
        
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
        
        whatsapp_number = manager_profile.get('contact')
        if not whatsapp_number:
            return Response({'error': 'Manager contact number not configured'}, status=400)
        
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


@api_view(['POST'])
def restock_product(request):
    """
    Restock a specific product - Updates stock quantity for wishlisted items
    """
    try:
        product_id = request.data.get('productId')
        add_quantity = request.data.get('quantity', 0)
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=400)
        
        if not add_quantity or add_quantity < 1:
            return Response({'error': 'Quantity must be greater than 0'}, status=400)
        
        # Find the product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        
        # Store original stock for logging
        original_stock = product.stock
        
        # Update stock
        product.stock += int(add_quantity)
        product.save()  # This will automatically update in_stock field via model's save method
        
        return Response({
            'success': True,
            'message': f'Successfully restocked {product.name}',
            'data': {
                'productId': product.id,
                'productName': product.name,
                'originalStock': original_stock,
                'addedQuantity': int(add_quantity),
                'newStock': product.stock,
                'inStock': product.in_stock,
                'updatedAt': product.name  # Using name as timestamp placeholder
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Error restocking product: {str(e)}'
        }, status=500)


@api_view(['GET'])
def twilio_account_status(request):
    """
    Check Twilio account status and recent message delivery
    """
    try:
        whatsapp_service = WhatsAppService()
        status = whatsapp_service.check_account_status()
        return Response(status)
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


@require_http_methods(["GET"])
@csrf_exempt
def download_stock_pdf(request):
    """
    Generate and download PDF report of current stock inventory
    """
    print("PDF download endpoint called")  # Debug log
    
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from datetime import datetime
        import io

        print("Imports successful")  # Debug log

        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1,  # Center alignment
            textColor=colors.darkblue
        )
        
        # Title
        title = Paragraph("Stock Inventory Report", title_style)
        elements.append(title)
        
        # Date - Use system local time instead of Django timezone
        import time
        date_style = ParagraphStyle('DateStyle', parent=styles['Normal'], fontSize=10, alignment=1)
        # Get current local time using system time
        local_time = time.localtime()
        formatted_date = time.strftime('%B %d, %Y at %I:%M %p', local_time)
        date_text = Paragraph(f"Generated on: {formatted_date}", date_style)
        elements.append(date_text)
        elements.append(Spacer(1, 20))
        
        # Get products data
        products = Product.objects.all().order_by('category', 'name')
        print(f"Found {products.count()} products")  # Debug log
        
        # Prepare table data
        data = [['Product Name', 'Category', 'Price (Rs)', 'Stock', 'Status']]
        
        for product in products:
            status = 'Out of Stock' if product.stock == 0 else 'Low Stock' if product.stock <= 10 else 'In Stock'
            data.append([
                product.name[:30] + '...' if len(product.name) > 30 else product.name,
                product.category,
                f"{product.price}",
                str(product.stock),
                status
            ])
        
        print(f"Prepared table with {len(data)} rows")  # Debug log
        
        # Create table
        table = Table(data, colWidths=[2.5*inch, 1.5*inch, 1*inch, 0.8*inch, 1*inch])
        
        # Table style
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(table)
        
        # Summary
        elements.append(Spacer(1, 20))
        total_products = products.count()
        total_value = sum(p.price * p.stock for p in products)
        out_of_stock = products.filter(stock=0).count()
        low_stock = products.filter(stock__lte=10, stock__gt=0).count()
        
        summary_data = [
            ['Total Products', str(total_products)],
            ['Total Inventory Value', f"{total_value:,.2f} Rs."],
            ['Out of Stock Items', str(out_of_stock)],
            ['Low Stock Items', str(low_stock)]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightblue),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        elements.append(summary_table)
        
        print("Building PDF...")  # Debug log
        
        # Build PDF
        doc.build(elements)
        
        # Return PDF response
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        
        print(f"PDF generated successfully, size: {len(pdf_data)} bytes")  # Debug log
        
        response = HttpResponse(pdf_data, content_type='application/pdf')
        # Use local time for filename
        local_time_str = time.strftime('%Y%m%d_%H%M%S', time.localtime())
        response['Content-Disposition'] = f'attachment; filename="stock_inventory_{local_time_str}.pdf"'
        
        return response
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")  # Debug log
        print(f"Error type: {type(e).__name__}")  # Debug log
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # Debug log
        
        return HttpResponse(
            f"Error generating PDF: {str(e)}", 
            status=500, 
            content_type='text/plain'
        )
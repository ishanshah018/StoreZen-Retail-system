import os
from twilio.rest import Client
from django.conf import settings
from .models import Product, LowStockAlert, ManagerProfile
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        # Twilio credentials - Add these to your environment variables
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID', 'your_account_sid_here')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN', 'your_auth_token_here')
        self.whatsapp_from = os.getenv('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')  # Twilio Sandbox number
        
        try:
            self.client = Client(self.account_sid, self.auth_token)
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")
            self.client = None
    
    def send_low_stock_alert(self, manager_phone, product_name, current_stock, threshold):
        """
        Send WhatsApp message for low stock alert
        """
        print(f"[WhatsApp] Attempting to send alert to {manager_phone} for {product_name}")
        
        if not self.client:
            print("[WhatsApp] ERROR: Twilio client not initialized")
            logger.error("Twilio client not initialized")
            return False
        
        # Format phone number for WhatsApp
        if not manager_phone.startswith('whatsapp:'):
            manager_phone = f'whatsapp:{manager_phone}'
        
        print(f"[WhatsApp] Formatted phone number: {manager_phone}")
        
        message_body = f"""
🚨 *LOW STOCK ALERT* 🚨

Product: *{product_name}*
Current Stock: *{current_stock}*
Threshold: *{threshold}*

⚠️ Please restock this item soon!

- StoreZen Management System
        """.strip()
        
        print(f"[WhatsApp] Message body prepared, length: {len(message_body)} chars")
        print(f"[WhatsApp] Using credentials - SID: {self.account_sid[:10]}..., From: {self.whatsapp_from}")
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.whatsapp_from,
                to=manager_phone
            )
            
            print(f"[WhatsApp] SUCCESS: Message sent with SID: {message.sid}")
            print(f"[WhatsApp] Message status: {message.status}")
            logger.info(f"WhatsApp message sent successfully. SID: {message.sid}")
            return True
            
        except Exception as e:
            print(f"[WhatsApp] ERROR: Failed to send message - {str(e)}")
            print(f"[WhatsApp] Exception type: {type(e).__name__}")
            logger.error(f"Failed to send WhatsApp message: {e}")
            return False
    
    def check_and_send_alerts(self, manager_phone, threshold):
        """
        Check all products for low stock and send alerts
        Intelligent spam prevention: 
        - Sends alert when stock first goes below threshold
        - After restocking above threshold, allows new alert when it goes below again
        - Prevents multiple alerts for same low stock episode
        """
        if not manager_phone:
            logger.warning("Manager phone number not provided")
            return
        
        try:
            # First, mark alerts as resolved for products that are now above threshold
            resolved_count = LowStockAlert.objects.filter(
                product__stock__gt=threshold,
                is_resolved=False
            ).update(is_resolved=True)
            
            if resolved_count > 0:
                logger.info(f"Marked {resolved_count} alerts as resolved (stock replenished)")
            
            # Get all products below threshold
            low_stock_products = Product.objects.filter(stock__lte=threshold)
            
            alerts_sent = 0
            for product in low_stock_products:
                # Check if there's an unresolved alert for this product at current threshold
                existing_unresolved_alert = LowStockAlert.objects.filter(
                    product=product,
                    threshold_value=threshold,
                    is_resolved=False
                ).first()
                
                # Only send alert if no unresolved alert exists
                # This means: either first time below threshold, or was restocked and now below again
                if not existing_unresolved_alert:
                    # Send alert and create record
                    success = self.send_low_stock_alert(
                        manager_phone, 
                        product.name, 
                        product.stock, 
                        threshold
                    )
                    
                    if success:
                        LowStockAlert.objects.create(
                            product=product,
                            threshold_value=threshold,
                            stock_at_alert=product.stock,
                            manager_phone=manager_phone,
                            is_resolved=False
                        )
                        alerts_sent += 1
                        logger.info(f"New alert sent for {product.name} (stock: {product.stock})")
                    else:
                        logger.warning(f"Failed to send alert for {product.name}")
                else:
                    logger.debug(f"Skipping {product.name} - alert already active (stock: {product.stock})")
            
            logger.info(f"Sent {alerts_sent} new low stock alerts")
            return alerts_sent
            
        except Exception as e:
            logger.error(f"Error in check_and_send_alerts: {e}")
            return 0

    def get_alert_status_for_product(self, product_name):
        """
        Helper method to check alert status for a specific product
        """
        try:
            product = Product.objects.get(name=product_name)
            unresolved_alerts = LowStockAlert.objects.filter(
                product=product,
                is_resolved=False
            ).count()
            
            resolved_alerts = LowStockAlert.objects.filter(
                product=product,
                is_resolved=True
            ).count()
            
            return {
                'product_name': product.name,
                'current_stock': product.stock,
                'unresolved_alerts': unresolved_alerts,
                'resolved_alerts': resolved_alerts,
                'can_send_new_alert': unresolved_alerts == 0
            }
        except Product.DoesNotExist:
            return {'error': 'Product not found'}

    def check_account_status(self):
        """
        Check Twilio account status and recent messages
        """
        if not self.client:
            return {"error": "Twilio client not initialized"}
        
        try:
            # Get account info
            account = self.client.api.accounts.get(self.account_sid).fetch()
            
            # Get recent messages
            messages = self.client.messages.list(limit=5)
            
            recent_messages = []
            for msg in messages:
                recent_messages.append({
                    'sid': msg.sid,
                    'to': msg.to,
                    'from': msg.from_,
                    'status': msg.status,
                    'date_sent': str(msg.date_sent),
                    'error_code': msg.error_code,
                    'error_message': msg.error_message
                })
            
            return {
                'account_status': account.status,
                'account_type': account.type,
                'recent_messages': recent_messages
            }
            
        except Exception as e:
            return {"error": str(e)}

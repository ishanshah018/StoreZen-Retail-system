import os
import logging
from twilio.rest import Client
from .models import Product, LowStockAlert

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    WhatsApp Service - Handles Twilio WhatsApp API for sending low stock alerts
    """
    
    def __init__(self):
        # Twilio credentials from environment variables
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID', 'your_account_sid_here')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN', 'your_auth_token_here')
        self.whatsapp_from = os.getenv('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')
        
        try:
            self.client = Client(self.account_sid, self.auth_token)
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")
            self.client = None
    

    def send_low_stock_alert(self, manager_phone, product_name, current_stock, threshold):
        """
        Send WhatsApp low stock alert message to manager
        """
        if not self.client:
            logger.error("Twilio client not initialized")
            return False
        
        # Format phone number for WhatsApp
        if not manager_phone.startswith('whatsapp:'):
            manager_phone = f'whatsapp:{manager_phone}'
        
        message_body = f"""
🚨 *LOW STOCK ALERT* 🚨

Product: *{product_name}*
Current Stock: *{current_stock}*
Threshold: *{threshold}*

⚠️ Please restock this item soon!

- StoreZen Management System
        """.strip()
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.whatsapp_from,
                to=manager_phone
            )
            
            logger.info(f"WhatsApp message sent successfully. SID: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            return False
    

    def check_and_send_alerts(self, manager_phone, threshold):
        """
        Check all products for low stock and send alerts
        Prevents duplicate alerts until stock is replenished
        """
        if not manager_phone:
            logger.warning("Manager phone number not provided")
            return
        
        try:
            # Get all products below threshold
            low_stock_products = Product.objects.filter(stock__lte=threshold)
            
            alerts_sent = 0
            for product in low_stock_products:
                # Check if alert already sent for this product
                existing_alert = LowStockAlert.objects.filter(
                    product=product,
                    threshold_value=threshold,
                    is_resolved=False
                ).first()
                
                if not existing_alert:
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
                            manager_phone=manager_phone
                        )
                        alerts_sent += 1
            
            # Mark alerts as resolved for products that are now above threshold
            LowStockAlert.objects.filter(
                product__stock__gt=threshold,
                is_resolved=False
            ).update(is_resolved=True)
            
            logger.info(f"Sent {alerts_sent} low stock alerts")
            
        except Exception as e:
            logger.error(f"Error in check_and_send_alerts: {e}")

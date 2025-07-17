from django.db import models
from django.utils import timezone

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)  # Number of items in stock
    in_stock = models.BooleanField(default=True)  # Automatically managed
    demand_level = models.CharField(
        max_length=10,
        choices=[('High', 'High'), ('Normal', 'Normal'), ('Low', 'Low')],
        default='Normal'
    )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Automatically set in_stock based on stock quantity
        self.in_stock = self.stock > 0
        super().save(*args, **kwargs)


class ManagerProfile(models.Model):
    name = models.CharField(max_length=100, default="Store Manager")
    store_address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    contact = models.CharField(max_length=20, blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, help_text="Include country code (e.g., +1234567890)")
    low_stock_threshold = models.IntegerField(default=10)
    whatsapp_alerts_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Manager: {self.name}"
    
    class Meta:
        verbose_name = "Manager Profile"
        verbose_name_plural = "Manager Profiles"


class LowStockAlert(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    threshold_value = models.IntegerField()
    stock_at_alert = models.IntegerField()
    manager_phone = models.CharField(max_length=20)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Alert: {self.product.name} - Stock: {self.stock_at_alert}"
    
    def save(self, *args, **kwargs):
        if self.is_resolved and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-sent_at']
        verbose_name = "Low Stock Alert"
        verbose_name_plural = "Low Stock Alerts"
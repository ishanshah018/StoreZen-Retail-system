from django.db import models

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
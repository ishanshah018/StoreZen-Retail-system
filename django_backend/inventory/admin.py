from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'stock', 'in_stock', 'demand_level']
    list_filter = ['category', 'demand_level', 'in_stock']
    search_fields = ['name', 'category']
    list_editable = ['price', 'stock', 'demand_level']  # Removed in_stock from editable
    ordering = ['name']
    readonly_fields = ['in_stock']  # Make in_stock read-only
    
    fieldsets = (
        ('Product Information', {
            'fields': ('name', 'category', 'price')
        }),
        ('Stock Management', {
            'fields': ('stock', 'in_stock'),
            'description': 'Stock availability is automatically calculated based on stock quantity'
        }),
        ('Business Intelligence', {
            'fields': ('demand_level',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        # Always make in_stock read-only
        readonly = list(self.readonly_fields)
        return readonly

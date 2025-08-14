from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'selling_price', 'cost_price', 'profit_per_unit', 'profit_margin', 'stock', 'in_stock', 'demand_level']
    list_filter = ['category', 'demand_level', 'in_stock']
    search_fields = ['name', 'category']
    list_editable = ['selling_price', 'cost_price', 'stock', 'demand_level']  # Updated to new field names
    ordering = ['name']
    readonly_fields = ['in_stock', 'profit_per_unit', 'profit_margin']  # Auto-calculated fields are read-only
    
    fieldsets = (
        ('Product Information', {
            'fields': ('name', 'category')
        }),
        ('Pricing & Profit', {
            'fields': ('selling_price', 'cost_price', 'profit_per_unit', 'profit_margin'),
            'description': 'Profit per unit and margin are automatically calculated'
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
        # Always make calculated fields read-only
        readonly = list(self.readonly_fields)
        return readonly

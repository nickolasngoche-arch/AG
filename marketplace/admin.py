from django.contrib import admin

from .models import BuyerRequest, MarketPrice, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "farmer", "price_per_kg", "quantity_kg", "county", "is_available", "created_at")
    list_filter = ("category", "county", "is_available")
    search_fields = ("name", "farmer__email", "location")


@admin.register(BuyerRequest)
class BuyerRequestAdmin(admin.ModelAdmin):
    list_display = ("product_name", "buyer", "quantity_kg", "max_price_per_kg", "county", "is_open", "created_at")
    list_filter = ("category", "county", "is_open")
    search_fields = ("product_name", "buyer__email", "location")


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    """Edit prices inline from the list page: change the price, tick, Save."""

    list_display = ("commodity", "market", "county", "price_per_kg", "unit", "source", "updated_on")
    list_editable = ("price_per_kg",)
    list_filter = ("county", "category", "market")
    search_fields = ("commodity", "market")

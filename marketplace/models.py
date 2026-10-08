from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from accounts.constants import COUNTY_CHOICES

CATEGORY_CHOICES = [
    ("cereals", "Cereals"),
    ("legumes", "Legumes"),
    ("vegetables", "Vegetables"),
    ("fruits", "Fruits"),
    ("tubers", "Roots & tubers"),
    ("other", "Other"),
]

POSITIVE = [MinValueValidator(Decimal("0.01"))]


class Product(models.Model):
    """Produce a farmer is offering for sale."""

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products"
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, validators=POSITIVE)
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2, validators=POSITIVE)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=15)
    county = models.CharField(max_length=20, choices=COUNTY_CHOICES)
    location = models.CharField(max_length=120)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.quantity_kg} kg)"


class BuyerRequest(models.Model):
    """Produce a buyer wants to purchase from farmers."""

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="requests"
    )
    product_name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2, validators=POSITIVE)
    max_price_per_kg = models.DecimalField(
        max_digits=10, decimal_places=2, validators=POSITIVE, null=True, blank=True
    )
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=15)
    county = models.CharField(max_length=20, choices=COUNTY_CHOICES)
    location = models.CharField(max_length=120)
    needed_by = models.DateField(null=True, blank=True)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Wanted: {self.product_name} ({self.quantity_kg} kg)"


class MarketPrice(models.Model):
    """Current price of a commodity in a Nyanza market. Maintained by admins."""

    commodity = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    market = models.CharField(max_length=100)
    county = models.CharField(max_length=20, choices=COUNTY_CHOICES)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, validators=POSITIVE)
    unit = models.CharField(max_length=20, default="kg")
    source = models.CharField(max_length=100, blank=True)
    updated_on = models.DateField(auto_now=True)

    class Meta:
        ordering = ["commodity", "market"]
        constraints = [
            models.UniqueConstraint(fields=["commodity", "market"], name="unique_price_per_market")
        ]

    def __str__(self):
        return f"{self.commodity} @ {self.market}: KSh {self.price_per_kg}/{self.unit}"

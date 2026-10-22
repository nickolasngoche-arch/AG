from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from accounts.constants import COUNTY_CHOICES, ROUTE_COUNTY_CHOICES

CATEGORY_CHOICES = [
    ("cereals", "Cereals"),
    ("legumes", "Legumes"),
    ("vegetables", "Vegetables"),
    ("fruits", "Fruits"),
    ("tubers", "Roots & tubers"),
    ("other", "Other"),
]

VEHICLE_CHOICES = [
    ("pickup", "Pickup / small truck"),
    ("lorry_3t", "Lorry (up to 3 tonnes)"),
    ("lorry_7t", "Lorry (up to 7 tonnes)"),
    ("lorry_10t", "Lorry (10+ tonnes)"),
    ("trailer", "Trailer / large truck"),
    ("boda", "Motorcycle (boda boda)"),
    ("other", "Other vehicle"),
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
    image = models.ImageField(upload_to="products/", blank=True, null=True)
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


class TransportListing(models.Model):
    """A transporter advertising route availability and cargo space
    (business plan section 3.3: origin, destination, route, dates, vehicle
    type, payload/space and price)."""

    transporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transports"
    )
    origin_county = models.CharField(max_length=20, choices=COUNTY_CHOICES)
    origin_location = models.CharField(max_length=120)
    destination_county = models.CharField(max_length=20, choices=ROUTE_COUNTY_CHOICES)
    destination_location = models.CharField(max_length=120)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES, default="other")
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2, validators=POSITIVE)
    price_per_trip = models.DecimalField(
        max_digits=10, decimal_places=2, validators=POSITIVE, null=True, blank=True
    )
    available_date = models.DateField()
    accepts_return_loads = models.BooleanField(
        default=True,
        help_text="Willing to carry cargo on a return/empty leg at a negotiated rate.",
    )
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.origin_location} → {self.destination_location} ({self.get_vehicle_type_display()})"


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
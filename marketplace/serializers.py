from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from accounts.validators import normalize_phone

from .models import BuyerRequest, MarketPrice, Product


def _person(user):
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "name": profile.full_name if profile else user.get_username(),
        "member_since": user.date_joined.date().isoformat(),
    }


class _PhoneMixin:
    def validate_phone(self, value):
        try:
            return normalize_phone(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)


class ProductSerializer(_PhoneMixin, serializers.ModelSerializer):
    farmer = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    county_display = serializers.CharField(source="get_county_display", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "category", "category_display", "price_per_kg", "quantity_kg",
            "description", "phone", "county", "county_display", "location",
            "is_available", "created_at", "farmer", "is_owner",
        ]
        read_only_fields = ["id", "created_at"]

    def get_farmer(self, obj):
        return _person(obj.farmer)

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and obj.farmer_id == request.user.id)


class BuyerRequestSerializer(_PhoneMixin, serializers.ModelSerializer):
    buyer = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    county_display = serializers.CharField(source="get_county_display", read_only=True)

    class Meta:
        model = BuyerRequest
        fields = [
            "id", "product_name", "category", "category_display", "quantity_kg",
            "max_price_per_kg", "description", "phone", "county", "county_display",
            "location", "needed_by", "is_open", "created_at", "buyer", "is_owner",
        ]
        read_only_fields = ["id", "created_at"]

    def get_buyer(self, obj):
        return _person(obj.buyer)

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and obj.buyer_id == request.user.id)


class MarketPriceSerializer(serializers.ModelSerializer):
    county_display = serializers.CharField(source="get_county_display", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = MarketPrice
        fields = [
            "id", "commodity", "category", "category_display", "market", "county",
            "county_display", "price_per_kg", "unit", "source", "updated_on",
        ]

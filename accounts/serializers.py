from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .constants import COUNTY_CHOICES
from .models import Profile
from .validators import normalize_phone

User = get_user_model()


def user_payload(user):
    """The shape of the user object the frontend receives."""
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": profile.full_name if profile else user.get_username(),
        "role": profile.role if profile else None,
        "phone": profile.phone if profile else "",
        "county": profile.county if profile else "",
        "location": profile.location if profile else "",
    }


class SignupSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES)
    phone = serializers.CharField(max_length=20)
    county = serializers.ChoiceField(choices=COUNTY_CHOICES)
    location = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_phone(self, value):
        try:
            return normalize_phone(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)

    def validate(self, attrs):
        try:
            validate_password(attrs["password"], user=User(username=attrs["email"]))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        Profile.objects.create(
            user=user,
            full_name=validated_data["full_name"],
            role=validated_data["role"],
            phone=validated_data["phone"],
            county=validated_data["county"],
            location=validated_data.get("location", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"].lower(),
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Incorrect email or password.")
        attrs["user"] = user
        return attrs

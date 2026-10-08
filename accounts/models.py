from django.conf import settings
from django.db import models

from .constants import COUNTY_CHOICES


class Profile(models.Model):
    ROLE_CHOICES = [("farmer", "Farmer"), ("buyer", "Buyer")]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    full_name = models.CharField(max_length=120)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    county = models.CharField(max_length=20, choices=COUNTY_CHOICES)
    location = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.role})"

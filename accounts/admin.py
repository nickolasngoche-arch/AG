from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "role", "phone", "county", "location")
    list_filter = ("role", "county")
    search_fields = ("full_name", "phone", "user__email")

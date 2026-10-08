from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "AgriGenius administration"
admin.site.site_title = "AgriGenius admin"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("marketplace.urls")),
]

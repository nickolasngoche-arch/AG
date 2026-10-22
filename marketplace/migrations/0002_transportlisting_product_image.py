import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models

NYANZA = [("kisii", "Kisii"), ("nyamira", "Nyamira"), ("kisumu", "Kisumu"),
          ("siaya", "Siaya"), ("homa_bay", "Homa Bay"), ("migori", "Migori")]

ROUTE = NYANZA + [("uasin_gishu", "Uasin Gishu (Eldoret)"), ("kakamega", "Kakamega"),
                  ("kericho", "Kericho"), ("bomet", "Bomet"), ("nakuru", "Nakuru"),
                  ("nyandarua", "Nyandarua"), ("nairobi", "Nairobi"), ("mombasa", "Mombasa")]

VEHICLES = [("pickup", "Pickup / small truck"), ("lorry_3t", "Lorry (up to 3 tonnes)"),
            ("lorry_7t", "Lorry (up to 7 tonnes)"), ("lorry_10t", "Lorry (10+ tonnes)"),
            ("trailer", "Trailer / large truck"), ("boda", "Motorcycle (boda boda)"),
            ("other", "Other vehicle")]


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_profile_role"),
        ("marketplace", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="products/"),
        ),
        migrations.CreateModel(
            name="TransportListing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("origin_county", models.CharField(choices=NYANZA, max_length=20)),
                ("origin_location", models.CharField(max_length=120)),
                ("destination_county", models.CharField(choices=ROUTE, max_length=20)),
                ("destination_location", models.CharField(max_length=120)),
                ("vehicle_type", models.CharField(choices=VEHICLES, default="other", max_length=20)),
                ("capacity_kg", models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal("0.01"))])),
                ("price_per_trip", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, validators=[django.core.validators.MinValueValidator(Decimal("0.01"))])),
                ("available_date", models.DateField()),
                ("accepts_return_loads", models.BooleanField(default=True, help_text="Willing to carry cargo on a return/empty leg at a negotiated rate.")),
                ("description", models.TextField(blank=True)),
                ("phone", models.CharField(max_length=15)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("transporter", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transports", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
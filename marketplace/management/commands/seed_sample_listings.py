import io
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image, ImageDraw, ImageFont

from accounts.models import Profile
from marketplace.models import BuyerRequest, Product, TransportListing

User = get_user_model()
PASSWORD = "Demo-pass-2026"  # all demo accounts share this password
DOMAIN = "demo.agrigenius.test"

# email prefix, full name, role, phone (2547XXXXXXXX), county, location
USERS = [
    ("farmer.kisii", "Mary Nyaboke", "farmer", "254712000001", "kisii", "Nyamache"),
    ("farmer.nyamira", "Peter Ogega", "farmer", "254712000002", "nyamira", "Keroka"),
    ("farmer.siaya", "Grace Achieng", "farmer", "254712000003", "siaya", "Bondo"),
    ("buyer.kisumu", "Kibuye Fresh Traders", "buyer", "254722000001", "kisumu", "Kibuye Market"),
    ("buyer.migori", "Rongo Hotel Supplies", "buyer", "254722000002", "migori", "Rongo Town"),
    ("transporter.kisii", "James Onyango Logistics", "transporter", "254733000001", "kisii", "Kisii Town"),
]

# farmer prefix, name, category, KSh/kg, kg, description, county, location, image colour
PRODUCTS = [
    ("farmer.kisii", "Maize", "cereals", 60, 2000, "Dry white maize, well sorted and bagged.", "kisii", "Nyamache", (230, 190, 60)),
    ("farmer.kisii", "Beans", "legumes", 150, 600, "Rosecoco beans, freshly harvested.", "kisii", "Nyamache", (150, 70, 50)),
    ("farmer.kisii", "Bananas", "fruits", 50, 800, "Ripe cooking bananas (matoke).", "kisii", "Suneka", (240, 210, 70)),
    ("farmer.nyamira", "Tomatoes", "vegetables", 85, 400, "Firm red tomatoes, ready for market.", "nyamira", "Keroka", (210, 50, 40)),
    ("farmer.nyamira", "Irish potatoes", "tubers", 55, 1500, "Clean Shangi potatoes.", "nyamira", "Nyansiongo", (190, 150, 100)),
    ("farmer.siaya", "Sweet potatoes", "tubers", 48, 900, "Orange-fleshed sweet potatoes.", "siaya", "Bondo", (220, 120, 40)),
    ("farmer.siaya", "Kales (sukuma wiki)", "vegetables", 40, 300, "Fresh kales cut this morning.", "siaya", "Yala", (40, 140, 60)),
    ("farmer.siaya", "Green grams", "legumes", 140, 500, "Clean, dry green grams.", "siaya", "Bondo", (110, 160, 70)),
]

# buyer prefix, product, category, kg, max price or None, description, county, location, days until needed
REQUESTS = [
    ("buyer.kisumu", "Maize", "cereals", 1500, 65, "Need white maize for milling, weekly supply possible.", "kisumu", "Kibuye Market", 10),
    ("buyer.kisumu", "Tomatoes", "vegetables", 300, None, "Fresh tomatoes for the market, price negotiable.", "kisumu", "Kondele", 5),
    ("buyer.migori", "Beans", "legumes", 400, 155, "Beans for hotel kitchens.", "migori", "Rongo Town", 14),
    ("buyer.migori", "Irish potatoes", "tubers", 1000, 60, "Potatoes for chips supplier.", "migori", "Migori Town", 7),
]

# transporter prefix, origin county, origin, dest county, dest, vehicle, kg, price, days ahead, return loads
TRANSPORTS = [
    ("transporter.kisii", "kisii", "Kisii Town", "uasin_gishu", "Eldoret", "lorry_7t", 7000, 18000, 6, True),
    ("transporter.kisii", "kisii", "Kisii Town", "kisumu", "Kibuye Market", "pickup", 1500, 5000, 3, True),
    ("transporter.kisii", "nyamira", "Keroka", "nairobi", "Wakulima Market", "lorry_10t", 10000, 32000, 9, False),
]


def make_photo(label, colour):
    """Draw a simple placeholder product photo so listings show an image."""
    img = Image.new("RGB", (800, 600), colour)
    draw = ImageDraw.Draw(img)
    dark = tuple(int(c * 0.6) for c in colour)
    draw.ellipse((100, 380, 700, 780), fill=dark)
    try:
        font = ImageFont.load_default(size=64)
    except TypeError:  # older Pillow
        font = ImageFont.load_default()
    w = draw.textlength(label, font=font)
    draw.text(((800 - w) / 2, 220), label, fill="white", font=font)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85)
    return ContentFile(buf.getvalue())


class Command(BaseCommand):
    help = "Create demo farmers, buyers, a transporter and sample posts (with photos). Safe to re-run."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Delete the demo accounts (and their posts) first.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            User.objects.filter(username__endswith=f"@{DOMAIN}").delete()

        users = {}
        for prefix, name, role, phone, county, location in USERS:
            email = f"{prefix}@{DOMAIN}"
            user, created = User.objects.get_or_create(username=email, defaults={"email": email})
            if created:
                user.set_password(PASSWORD)
                user.save()
            Profile.objects.get_or_create(
                user=user,
                defaults={"full_name": name, "role": role, "phone": phone, "county": county, "location": location},
            )
            users[prefix] = user

        n_prod = n_req = n_trans = 0
        for prefix, name, cat, price, qty, desc, county, loc, colour in PRODUCTS:
            farmer = users[prefix]
            product, created = Product.objects.get_or_create(
                farmer=farmer, name=name,
                defaults={
                    "category": cat, "price_per_kg": Decimal(price), "quantity_kg": Decimal(qty),
                    "description": desc, "phone": farmer.profile.phone, "county": county, "location": loc,
                },
            )
            if created:
                product.image.save(f"{name.lower().replace(' ', '_')}.jpg", make_photo(name, colour), save=True)
                n_prod += 1

        for prefix, name, cat, qty, max_price, desc, county, loc, days in REQUESTS:
            buyer = users[prefix]
            _, created = BuyerRequest.objects.get_or_create(
                buyer=buyer, product_name=name,
                defaults={
                    "category": cat, "quantity_kg": Decimal(qty),
                    "max_price_per_kg": Decimal(max_price) if max_price else None,
                    "description": desc, "phone": buyer.profile.phone, "county": county,
                    "location": loc, "needed_by": date.today() + timedelta(days=days),
                },
            )
            n_req += created

        for prefix, oc, ol, dc, dl, vehicle, cap, price, days, ret in TRANSPORTS:
            t = users[prefix]
            _, created = TransportListing.objects.get_or_create(
                transporter=t, origin_location=ol, destination_location=dl,
                defaults={
                    "origin_county": oc, "destination_county": dc, "vehicle_type": vehicle,
                    "capacity_kg": Decimal(cap), "price_per_trip": Decimal(price),
                    "available_date": date.today() + timedelta(days=days),
                    "accepts_return_loads": ret, "phone": t.profile.phone,
                },
            )
            n_trans += created

        self.stdout.write(self.style.SUCCESS(
            f"Created {n_prod} products, {n_req} buyer requests, {n_trans} transport listings."
        ))
        self.stdout.write(f"Demo logins: <prefix>@{DOMAIN} / {PASSWORD}  "
                          "(e.g. farmer.kisii, buyer.kisumu, transporter.kisii)")

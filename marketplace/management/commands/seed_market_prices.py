import random

from django.core.management.base import BaseCommand

from marketplace.models import MarketPrice

SAMPLE = "Sample data"

# (commodity, category, indicative KSh/kg)
COMMODITIES = [
    ("Maize", "cereals", 60), ("Sorghum", "cereals", 70), ("Finger millet", "cereals", 105),
    ("Beans", "legumes", 150), ("Green grams", "legumes", 140),
    ("Tomatoes", "vegetables", 85), ("Onions", "vegetables", 95), ("Kales (sukuma wiki)", "vegetables", 40),
    ("Cabbage", "vegetables", 35), ("Bananas", "fruits", 50),
    ("Irish potatoes", "tubers", 55), ("Sweet potatoes", "tubers", 48), ("Cassava", "tubers", 42),
]

MARKETS = [
    ("Kisii Main Market", "kisii"), ("Daraja Mbili", "kisii"),
    ("Nyamira Market", "nyamira"), ("Keroka", "nyamira"),
    ("Kibuye (Kisumu)", "kisumu"), ("Kondele", "kisumu"),
    ("Siaya Town", "siaya"), ("Bondo", "siaya"),
    ("Homa Bay Town", "homa_bay"), ("Oyugis", "homa_bay"),
    ("Migori Town", "migori"), ("Rongo", "migori"),
]


class Command(BaseCommand):
    help = (
        "Fill the market price table with SAMPLE prices so the dashboard can be "
        "demonstrated. Replace them with real prices through the Django admin."
    )

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Delete existing sample rows first.")

    def handle(self, *args, **options):
        if options["clear"]:
            MarketPrice.objects.filter(source=SAMPLE).delete()
        rng = random.Random(2026)  # deterministic: same sample every run
        created = 0
        for commodity, category, base in COMMODITIES:
            for market, county in MARKETS:
                price = round(base * rng.uniform(0.88, 1.15))
                _, was_created = MarketPrice.objects.get_or_create(
                    commodity=commodity, market=market,
                    defaults={"category": category, "county": county, "price_per_kg": price, "source": SAMPLE},
                )
                created += was_created
        self.stdout.write(self.style.SUCCESS(f"{created} sample price rows created."))

from django.core.management import call_command
from rest_framework.test import APITestCase

from .models import MarketPrice, Product

PASSWORD = "Str0ng-pass-2026"


def signup_payload(role, email, **extra):
    return {
        "full_name": f"Test {role.title()}", "email": email, "password": PASSWORD,
        "role": role, "phone": "0712345678", "county": "kisii", "location": "Kisii Town", **extra,
    }


class MarketplaceApiTests(APITestCase):
    def signup(self, role, email):
        res = self.client.post("/api/auth/signup/", signup_payload(role, email), format="json")
        self.assertEqual(res.status_code, 201, res.data)
        return res.data["token"]

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def product_payload(self, **extra):
        return {
            "name": "Maize", "category": "cereals", "price_per_kg": "60", "quantity_kg": "100",
            "description": "Dry white maize", "phone": "0722000111", "county": "kisii",
            "location": "Nyamache", **extra,
        }

    def test_signup_login_me_logout(self):
        token = self.signup("farmer", "a@example.com")
        self.auth(token)
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.data["role"], "farmer")
        self.assertEqual(me.data["phone"], "254712345678")  # normalised
        self.client.credentials()
        login = self.client.post("/api/auth/login/", {"email": "A@example.com", "password": PASSWORD}, format="json")
        self.assertEqual(login.status_code, 200)
        self.auth(login.data["token"])
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_signup_validation(self):
        self.signup("farmer", "dup@example.com")
        dup = self.client.post("/api/auth/signup/", signup_payload("buyer", "dup@example.com"), format="json")
        self.assertEqual(dup.status_code, 400)
        weak = self.client.post("/api/auth/signup/", signup_payload("buyer", "w@example.com", password="123"), format="json")
        self.assertIn("password", weak.data)
        bad_phone = self.client.post("/api/auth/signup/", signup_payload("buyer", "p@example.com", phone="12345"), format="json")
        self.assertIn("phone", bad_phone.data)

    def test_bad_login(self):
        res = self.client.post("/api/auth/login/", {"email": "no@example.com", "password": "x"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_requires_authentication(self):
        self.assertEqual(self.client.get("/api/products/").status_code, 401)
        self.assertEqual(self.client.get("/api/requests/").status_code, 401)

    def test_only_farmers_post_products_and_only_buyers_post_requests(self):
        farmer, buyer = self.signup("farmer", "f@example.com"), self.signup("buyer", "b@example.com")
        self.auth(buyer)
        self.assertEqual(self.client.post("/api/products/", self.product_payload(), format="json").status_code, 403)
        self.auth(farmer)
        res = self.client.post("/api/products/", self.product_payload(), format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["farmer"]["name"], "Test Farmer")
        self.assertEqual(res.data["phone"], "254722000111")
        self.assertTrue(res.data["is_owner"])
        req = {"product_name": "Beans", "category": "legumes", "quantity_kg": "500", "phone": "0733000222", "county": "kisumu", "location": "Kondele"}
        self.assertEqual(self.client.post("/api/requests/", req, format="json").status_code, 403)
        self.auth(buyer)
        res = self.client.post("/api/requests/", req, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["buyer"]["name"], "Test Buyer")

    def test_invalid_product_rejected(self):
        self.auth(self.signup("farmer", "f@example.com"))
        res = self.client.post("/api/products/", self.product_payload(price_per_kg="-5", county="nairobi"), format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("price_per_kg", res.data)
        self.assertIn("county", res.data)

    def test_filters_and_visibility(self):
        farmer = self.signup("farmer", "f@example.com")
        self.auth(farmer)
        self.client.post("/api/products/", self.product_payload(), format="json")
        sold = self.client.post("/api/products/", self.product_payload(name="Beans", county="migori"), format="json")
        self.client.patch(f"/api/products/{sold.data['id']}/", {"is_available": False}, format="json")
        self.assertEqual(len(self.client.get("/api/products/").data), 1)  # sold items hidden
        self.assertEqual(len(self.client.get("/api/products/?mine=1").data), 2)
        self.assertEqual(len(self.client.get("/api/products/?search=mai").data), 1)
        self.assertEqual(len(self.client.get("/api/products/?county=migori").data), 0)

    def test_only_owner_can_modify_or_delete(self):
        owner, other = self.signup("farmer", "o@example.com"), self.signup("farmer", "x@example.com")
        self.auth(owner)
        pid = self.client.post("/api/products/", self.product_payload(), format="json").data["id"]
        self.auth(other)
        self.assertEqual(self.client.delete(f"/api/products/{pid}/").status_code, 404)
        self.assertEqual(self.client.patch(f"/api/products/{pid}/", {"price_per_kg": 1}, format="json").status_code, 404)
        self.auth(owner)
        self.assertEqual(self.client.delete(f"/api/products/{pid}/").status_code, 204)
        self.assertFalse(Product.objects.exists())

    def test_market_prices_public_and_filterable(self):
        call_command("seed_market_prices", verbosity=0)
        res = self.client.get("/api/market-prices/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), MarketPrice.objects.count())
        self.assertTrue(all(r["source"] == "Sample data" for r in res.data))
        county = self.client.get("/api/market-prices/?county=kisii&commodity=maize")
        self.assertEqual(len(county.data), 2)
        # A stale/invalid token must not break the public endpoint.
        self.client.credentials(HTTP_AUTHORIZATION="Token invalid")
        self.assertEqual(self.client.get("/api/market-prices/").status_code, 200)


# Transporter role, route postings and matching
class TransporterMatchingTests(APITestCase):
    """Transporter role, route-availability postings and personalised matching."""

    def signup(self, role, email):
        res = self.client.post("/api/auth/signup/", signup_payload(role, email), format="json")
        self.assertEqual(res.status_code, 201, res.data)
        return res.data["token"]

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def transport_payload(self, **extra):
        from datetime import date, timedelta
        return {
            "origin_county": "kisii", "origin_location": "Kisii Town",
            "destination_county": "uasin_gishu", "destination_location": "Eldoret",
            "vehicle_type": "lorry_7t", "capacity_kg": "7000", "price_per_trip": "18000",
            "available_date": str(date.today() + timedelta(days=7)),
            "phone": "0722334455", **extra,
        }

    def test_transporter_signup_and_role_guard(self):
        token = self.signup("transporter", "t@example.com")
        self.auth(token)
        self.assertEqual(self.client.get("/api/auth/me/").data["role"], "transporter")
        self.auth(self.signup("farmer", "f@example.com"))
        res = self.client.post("/api/transports/", self.transport_payload(), format="json")
        self.assertEqual(res.status_code, 403)  # only transporters post availability

    def test_transporter_crud(self):
        token = self.signup("transporter", "t@example.com")
        self.auth(token)
        res = self.client.post("/api/transports/", self.transport_payload(), format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["transporter"]["name"], "Test Transporter")
        self.assertTrue(res.data["is_owner"])
        tid = res.data["id"]
        # County filter matches either end of the route
        self.assertEqual(len(self.client.get("/api/transports/?county=uasin_gishu").data), 1)
        # Owner marks the truck as booked; it leaves the public list but stays in "mine"
        self.assertEqual(self.client.patch(f"/api/transports/{tid}/", {"is_active": False}, format="json").status_code, 200)
        self.assertEqual(self.client.get("/api/transports/").data, [])
        self.assertEqual(len(self.client.get("/api/transports/?mine=1").data), 1)

    def test_personalised_matches(self):
        farmer = self.signup("farmer", "f@example.com")
        buyer = self.signup("buyer", "b@example.com")
        transporter = self.signup("transporter", "t@example.com")

        self.auth(farmer)
        self.client.post("/api/products/", {
            "name": "Maize", "category": "cereals", "price_per_kg": "60", "quantity_kg": "100",
            "phone": "0722000111", "county": "kisii", "location": "Nyamache",
        }, format="json")

        self.auth(buyer)
        self.client.post("/api/requests/", {
            "product_name": "Maize", "category": "cereals", "quantity_kg": "500",
            "max_price_per_kg": "70", "phone": "0733000222",
            "county": "uasin_gishu", "location": "Eldoret",
        }, format="json")

        self.auth(transporter)
        self.client.post("/api/transports/", self.transport_payload(), format="json")

        self.auth(farmer)
        kinds = {m["kind"] for m in self.client.get("/api/matches/").data["matches"]}
        self.assertIn("request", kinds)   # buyer in Eldoret wants maize
        self.assertIn("transport", kinds)  # truck leaving Kisii with enough capacity

        self.auth(buyer)
        kinds = {m["kind"] for m in self.client.get("/api/matches/").data["matches"]}
        self.assertIn("product", kinds)
        self.assertIn("transport", kinds)   # truck delivers to Eldoret

        self.auth(transporter)
        kinds = {m["kind"] for m in self.client.get("/api/matches/").data["matches"]}
        self.assertIn("product", kinds)   # cargo waiting at the Kisii origin
        self.assertIn("request", kinds)   # buyer waiting at the Eldoret destination

    def test_matches_require_authentication(self):
        self.assertEqual(self.client.get("/api/matches/").status_code, 401)

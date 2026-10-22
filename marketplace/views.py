import re

from django.db.models import Q
from django.utils import timezone
from rest_framework import parsers, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BuyerRequest, MarketPrice, Product, TransportListing
from .permissions import role_required
from .serializers import (
    BuyerRequestSerializer,
    MarketPriceSerializer,
    ProductSerializer,
    TransportListingSerializer,
)

IsFarmer = role_required("farmer")
IsBuyer = role_required("buyer")
IsTransporter = role_required("transporter")
WRITE_METHODS = ["get", "post", "patch", "delete", "head", "options"]


class _OwnedListingViewSet(viewsets.ModelViewSet):
    """Shared behaviour: list/filter, create as the right role, owner-only edits."""

    http_method_names = WRITE_METHODS
    owner_field = None       # "farmer", "buyer" or "transporter"
    active_field = None      # "is_available", "is_open" or "is_active"
    name_field = None        # field searched with ?search=
    creator_permission = None

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), self.creator_permission()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = self.queryset.select_related(f"{self.owner_field}__profile")
        user = self.request.user
        if self.action in ("partial_update", "destroy"):
            return qs.filter(**{self.owner_field: user})  # non-owners get a 404

        params = self.request.query_params
        if params.get("mine") == "1":
            qs = qs.filter(**{self.owner_field: user})
        else:
            qs = qs.filter(**{self.active_field: True})
        if county := params.get("county"):
            qs = qs.filter(county=county)
        if category := params.get("category"):
            qs = qs.filter(category=category)
        if search := params.get("search"):
            qs = qs.filter(**{f"{self.name_field}__icontains": search})
        return qs

    def perform_create(self, serializer):
        serializer.save(**{self.owner_field: self.request.user})


class ProductViewSet(_OwnedListingViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    owner_field = "farmer"
    active_field = "is_available"
    name_field = "name"
    creator_permission = IsFarmer
    # Accept photo uploads (multipart/form-data) in addition to JSON.
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]


class BuyerRequestViewSet(_OwnedListingViewSet):
    queryset = BuyerRequest.objects.all()
    serializer_class = BuyerRequestSerializer
    owner_field = "buyer"
    active_field = "is_open"
    name_field = "product_name"
    creator_permission = IsBuyer


class TransportListingViewSet(_OwnedListingViewSet):
    """Transporters advertise route availability and cargo space.
    The county filter matches either end of the route."""

    queryset = TransportListing.objects.all()
    serializer_class = TransportListingSerializer
    owner_field = "transporter"
    active_field = "is_active"
    name_field = "destination_location"
    creator_permission = IsTransporter

    def get_queryset(self):
        qs = TransportListing.objects.select_related("transporter__profile")
        user = self.request.user
        if self.action in ("partial_update", "destroy"):
            return qs.filter(transporter=user)  # non-owners get a 404

        params = self.request.query_params
        if params.get("mine") == "1":
            qs = qs.filter(transporter=user)
        else:
            qs = qs.filter(is_active=True)
        if county := params.get("county"):
            qs = qs.filter(Q(origin_county=county) | Q(destination_county=county))
        if vehicle := params.get("vehicle"):
            qs = qs.filter(vehicle_type=vehicle)
        if search := params.get("search"):
            qs = qs.filter(
                Q(origin_location__icontains=search)
                | Q(destination_location__icontains=search)
            )
        return qs


def _name_tokens(name):
    return {t for t in re.split(r"[^a-z]+", name.lower()) if len(t) >= 3}


def _names_match(a, b):
    a, b = a.lower(), b.lower()
    return a in b or b in a or bool(_name_tokens(a) & _name_tokens(b))


def _score_product_request(product, req):
    """Transparent, rule-based score for a produce <-> buyer-request pair."""
    score, reasons = 2, [f"“{req.product_name}” matches your {product.name}"]
    if product.county == req.county:
        score += 2
        reasons.append(f"Both parties are in {product.get_county_display()}")
    if req.max_price_per_kg is None:
        score += 1
        reasons.append("The buyer has left the price negotiable")
    elif product.price_per_kg <= req.max_price_per_kg:
        score += 2
        reasons.append(
            f"Your price of KSh {product.price_per_kg}/kg is within the buyer's "
            f"maximum of KSh {req.max_price_per_kg}/kg"
        )
    return score, reasons


class MatchesView(APIView):
    """Personalised matches for the signed-in user (business plan section 3.3:
    begin with transparent rule-based matching).

    - Farmers: matching buyer requests, plus trucks leaving their county with
      enough free capacity for their load.
    - Buyers: matching produce, plus trucks delivering to their county.
    - Transporters: produce waiting at the origin and buyers waiting at the
      destination of each advertised route.
    """

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        role = profile.role if profile else None
        today = timezone.now().date()
        matches = []

        def add(kind, score, reasons, against, listing):
            matches.append({
                "key": f"{kind}-{listing['id']}-vs-{against['kind']}-{against['id']}",
                "kind": kind,
                "score": score,
                "reasons": reasons,
                "against": against,
                "listing": listing,
            })

        if role == "farmer":
            for product in request.user.products.filter(is_available=True):
                against = {"kind": "product", "id": product.id,
                           "label": f"{product.name} ({product.quantity_kg} kg)"}
                reqs = BuyerRequest.objects.filter(is_open=True).select_related("buyer__profile")
                for req in reqs:
                    if not _names_match(product.name, req.product_name):
                        continue
                    score, reasons = _score_product_request(product, req)
                    if score >= 3:
                        add("request", score, reasons, against,
                            BuyerRequestSerializer(req, context={"request": request}).data)
                trucks = TransportListing.objects.filter(
                    is_active=True, origin_county=product.county,
                    available_date__gte=today, capacity_kg__gte=product.quantity_kg,
                ).exclude(transporter=request.user).select_related("transporter__profile")
                for t in trucks:
                    reasons = [
                        f"{t.get_vehicle_type_display()} leaves {t.origin_location} for "
                        f"{t.destination_location} on {t.available_date:%d %b %Y}",
                        f"Free capacity ({t.capacity_kg} kg) covers your {product.quantity_kg} kg load",
                    ]
                    add("transport", 3, reasons, against,
                        TransportListingSerializer(t, context={"request": request}).data)

        elif role == "buyer":
            for req in request.user.requests.filter(is_open=True):
                against = {"kind": "request", "id": req.id, "label": f"Wanted: {req.product_name}"}
                products = Product.objects.filter(is_available=True).select_related("farmer__profile")
                for product in products:
                    if not _names_match(product.name, req.product_name):
                        continue
                    score, reasons = _score_product_request(product, req)
                    if score >= 3:
                        add("product", score, reasons, against,
                            ProductSerializer(product, context={"request": request}).data)
                trucks = TransportListing.objects.filter(
                    is_active=True, destination_county=req.county,
                    available_date__gte=today, capacity_kg__gte=req.quantity_kg,
                ).exclude(transporter=request.user).select_related("transporter__profile")
                for t in trucks:
                    reasons = [
                        f"{t.get_vehicle_type_display()} delivers to {t.destination_location} on "
                        f"{t.available_date:%d %b %Y}",
                        f"Capacity ({t.capacity_kg} kg) covers the {req.quantity_kg} kg you need",
                    ]
                    add("transport", 3, reasons, against,
                        TransportListingSerializer(t, context={"request": request}).data)

        elif role == "transporter":
            for t in request.user.transports.filter(is_active=True):
                against = {"kind": "transport", "id": t.id,
                           "label": f"{t.origin_location} → {t.destination_location}"}
                cargo = Product.objects.filter(
                    is_available=True, county=t.origin_county, quantity_kg__lte=t.capacity_kg,
                ).exclude(farmer=request.user).select_related("farmer__profile")
                for product in cargo:
                    reasons = [
                        f"{product.name} ({product.quantity_kg} kg) is waiting in "
                        f"{product.location}, {product.get_county_display()}",
                        "The load fits your free capacity",
                    ]
                    add("product", 2, reasons, against,
                        ProductSerializer(product, context={"request": request}).data)
                demand = BuyerRequest.objects.filter(
                    is_open=True, county=t.destination_county,
                ).exclude(buyer=request.user).select_related("buyer__profile")
                for req in demand:
                    reasons = [
                        f"A buyer in {req.location}, {req.get_county_display()} wants "
                        f"{req.product_name} ({req.quantity_kg} kg)",
                        "The delivery point is at your route's destination",
                    ]
                    if req.quantity_kg <= t.capacity_kg:
                        reasons.append("The load fits your free capacity")
                    add("request", 2, reasons, against,
                        BuyerRequestSerializer(req, context={"request": request}).data)

        matches.sort(key=lambda m: -m["score"])
        return Response({"matches": matches})


class MarketPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only. Prices are maintained through the Django admin."""

    serializer_class = MarketPriceSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        qs = MarketPrice.objects.all()
        params = self.request.query_params
        if county := params.get("county"):
            qs = qs.filter(county=county)
        if commodity := params.get("commodity"):
            qs = qs.filter(commodity__iexact=commodity)
        return qs
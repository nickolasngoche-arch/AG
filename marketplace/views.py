from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import BuyerRequest, MarketPrice, Product
from .permissions import role_required
from .serializers import BuyerRequestSerializer, MarketPriceSerializer, ProductSerializer

IsFarmer = role_required("farmer")
IsBuyer = role_required("buyer")
WRITE_METHODS = ["get", "post", "patch", "delete", "head", "options"]


class _OwnedListingViewSet(viewsets.ModelViewSet):
    """Shared behaviour: list/filter, create as the right role, owner-only edits."""

    http_method_names = WRITE_METHODS
    owner_field = None       # "farmer" or "buyer"
    active_field = None      # "is_available" or "is_open"
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


class BuyerRequestViewSet(_OwnedListingViewSet):
    queryset = BuyerRequest.objects.all()
    serializer_class = BuyerRequestSerializer
    owner_field = "buyer"
    active_field = "is_open"
    name_field = "product_name"
    creator_permission = IsBuyer


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

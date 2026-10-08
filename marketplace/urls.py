from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("products", views.ProductViewSet, basename="product")
router.register("requests", views.BuyerRequestViewSet, basename="request")
router.register("market-prices", views.MarketPriceViewSet, basename="market-price")

urlpatterns = router.urls

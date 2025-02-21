from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    UserProfileViewSet,
    CategoryViewSet,
    ProductViewSet,
    FavoriteViewSet,
    ChatViewSet,
    MessageViewSet,
)


router = DefaultRouter()
router.register("profiles", UserProfileViewSet)
router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("favorites", FavoriteViewSet, basename="favorite")
router.register("chats", ChatViewSet, basename="chat")

# Вложенные маршруты для сообщений
chats_router = routers.NestedDefaultRouter(router, "chats", lookup="chat")
chats_router.register("messages", MessageViewSet, basename="chat-messages")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(chats_router.urls)),
]

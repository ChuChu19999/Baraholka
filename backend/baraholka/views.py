from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import UserProfile, Category, Product, Favorite, Chat, Message, ProductView
from .serializers import (
    UserProfileSerializer,
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    FavoriteSerializer,
    ChatSerializer,
    MessageSerializer,
)
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import F
from datetime import datetime, time
from django.db import IntegrityError


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=["get", "patch"])
    def my_profile(self, request):
        """Получение и обновление профиля текущего пользователя"""
        profile = get_object_or_404(UserProfile, user=request.user)

        if request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"
    pagination_class = None

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "subcategory", "condition", "status", "location"]
    search_fields = ["title", "description"]
    ordering_fields = ["price", "created_at", "views_count"]
    ordering = ["-created_at"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductCreateUpdateSerializer
        elif self.action == "list":
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        queryset = Product.objects.all()

        # Если это не детальный просмотр, применяем фильтры
        if self.action == "list":
            # Фильтрация по статусу
            status = self.request.query_params.get("status")
            if status:
                queryset = queryset.filter(status=status)
            else:
                # Если статус не указан, показываем только активные
                queryset = queryset.filter(status="active")

            # Фильтрация по цене
            min_price = self.request.query_params.get("minPrice")
            max_price = self.request.query_params.get("maxPrice")
            if min_price and min_price.isdigit():
                queryset = queryset.filter(price__gte=min_price)
            if max_price and max_price.isdigit():
                queryset = queryset.filter(price__lte=max_price)

            # Фильтрация по категориям
            category = self.request.query_params.get("category")
            if category:
                queryset = queryset.filter(
                    Q(category_id=category)  # Товары из основной категории
                    | Q(subcategory__parent_id=category)  # Товары из подкатегорий
                )

            # Фильтрация по подкатегории
            subcategory = self.request.query_params.get("subcategory")
            if subcategory:
                queryset = queryset.filter(subcategory_id=subcategory)

        return queryset.select_related("category", "subcategory", "seller")

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Проверяем права доступа
        if instance.status != "active" and request.user != instance.seller:
            return Response(
                {"detail": "У вас нет прав для просмотра этого товара"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Не считаем просмотры от владельца товара
        if request.user != instance.seller:
            # Получаем IP адрес
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                ip = x_forwarded_for.split(",")[0]
            else:
                ip = request.META.get("REMOTE_ADDR")

            # Создаем запись о просмотре
            view = ProductView(
                product=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip,
            )
            view.save()  # Сохранение с проверкой уникальности

            # Обновляем общее количество просмотров
            instance.views_count = ProductView.objects.filter(product=instance).count()
            instance.save(update_fields=["views_count"])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def toggle_favorite(self, request, slug=None):
        """Добавление/удаление товара из избранного"""
        product = self.get_object()
        favorite = Favorite.objects.filter(user=request.user, product=product)

        if favorite.exists():
            favorite.delete()
            return Response({"status": "removed from favorites"})

        # Проверяем статус товара перед добавлением в избранное
        if product.status != "active":
            return Response(
                {"error": "Нельзя добавить в избранное неактивное объявление"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Favorite.objects.create(user=request.user, product=product)
        return Response({"status": "added to favorites"})

    @action(detail=False)
    def my_products(self, request):
        """Получение списка товаров текущего пользователя"""
        queryset = self.get_queryset().filter(seller=request.user)
        # Для личных товаров игнорируем фильтр по статусу
        queryset = Product.objects.filter(seller=request.user).select_related(
            "category", "subcategory", "seller"
        )
        serializer = ProductListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user,
            product__status="active",  # Показываем только активные товары в избранном
        ).select_related("product", "product__category", "product__seller")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        if not product_id:
            return Response(
                {"error": "Необходимо указать товар"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(Product, id=product_id)

        # Проверяем, существует ли уже чат для этого товара между этими пользователями
        existing_chat = (
            Chat.objects.filter(product=product, participants=request.user)
            .filter(participants=product.seller)
            .first()
        )

        if existing_chat:
            serializer = self.get_serializer(existing_chat)
            return Response(serializer.data)

        chat = Chat.objects.create(product=product)
        chat.participants.add(request.user, product.seller)

        serializer = self.get_serializer(chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs.get("chat_pk")
        return Message.objects.filter(chat_id=chat_id)

    def perform_create(self, serializer):
        chat_id = self.kwargs.get("chat_pk")
        chat = get_object_or_404(Chat, id=chat_id)

        # Проверяем, является ли пользователь участником чата
        if self.request.user not in chat.participants.all():
            raise PermissionDenied("Вы не являетесь участником этого чата")

        serializer.save(sender=self.request.user, chat=chat)

    @action(detail=False, methods=["post"])
    def mark_as_read(self, request, chat_pk=None):
        chat = get_object_or_404(Chat, id=chat_pk)
        if request.user not in chat.participants.all():
            raise PermissionDenied("Вы не являетесь участником этого чата")

        Message.objects.filter(chat=chat, is_read=False).exclude(
            sender=request.user
        ).update(is_read=True)

        return Response({"status": "messages marked as read"})

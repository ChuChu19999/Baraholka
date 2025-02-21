from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile,
    Category,
    Product,
    ProductImage,
    Favorite,
    Message,
    Chat,
)


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="profile.phone_number", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone_number")
        read_only_fields = ("id",)
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    created_at = serializers.DateTimeField(format="%d.%m.%Y", read_only=True)

    class Meta:
        model = UserProfile
        fields = ("id", "user", "phone_number", "rating", "location", "created_at")
        read_only_fields = ("id", "rating", "created_at")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        # Проверяем, что username уникален
        if "username" in user_data:
            username = user_data["username"]
            if (
                User.objects.exclude(pk=instance.user.pk)
                .filter(username=username)
                .exists()
            ):
                raise serializers.ValidationError(
                    {
                        "user": {
                            "username": ["Пользователь с таким именем уже существует"]
                        }
                    }
                )

        # Проверяем, что email уникален
        if "email" in user_data:
            email = user_data["email"]
            if User.objects.exclude(pk=instance.user.pk).filter(email=email).exists():
                raise serializers.ValidationError(
                    {"user": {"email": ["Пользователь с таким email уже существует"]}}
                )

        # Обновляем данные пользователя
        user = instance.user
        for attr, value in user_data.items():
            if value:  # Обновляем только если значение не пустое
                setattr(user, attr, value)
        user.save()

        # Обновляем данные профиля
        for attr, value in validated_data.items():
            if value:  # Обновляем только если значение не пустое
                setattr(instance, attr, value)
        instance.save()

        return instance


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description", "parent", "slug", "icon")
        read_only_fields = ("id", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "order")
        read_only_fields = ("id",)


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "price",
            "category_name",
            "subcategory_name",
            "seller_name",
            "condition",
            "status",
            "location",
            "views_count",
            "created_at",
            "slug",
            "main_image",
        )
        read_only_fields = ("id", "views_count", "created_at", "slug")

    def get_main_image(self, obj):
        first_image = obj.images.first()
        if first_image:
            return self.context["request"].build_absolute_uri(first_image.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    subcategory = CategorySerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "description",
            "price",
            "category",
            "subcategory",
            "seller",
            "condition",
            "status",
            "location",
            "views_count",
            "created_at",
            "updated_at",
            "slug",
            "images",
            "is_favorite",
        )
        read_only_fields = ("id", "views_count", "created_at", "updated_at", "slug")

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "description",
            "price",
            "category",
            "subcategory",
            "condition",
            "status",
            "location",
            "images",
            "uploaded_images",
        )
        read_only_fields = ("id",)

    def validate(self, data):
        category = data.get("category")
        subcategory = data.get("subcategory")

        if subcategory and subcategory.parent != category:
            raise serializers.ValidationError(
                {
                    "subcategory": [
                        "Подкатегория должна принадлежать выбранной категории"
                    ]
                }
            )

        return data

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = Product.objects.create(**validated_data)

        for order, image in enumerate(uploaded_images):
            ProductImage.objects.create(product=product, image=image, order=order)

        return product

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if uploaded_images:
            instance.images.all().delete()
            for order, image in enumerate(uploaded_images):
                ProductImage.objects.create(product=instance, image=image, order=order)

        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "user", "product", "created_at")
        read_only_fields = ("id", "user", "created_at")


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    created_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "chat",
            "sender",
            "sender_username",
            "text",
            "created_at",
            "is_read",
        )
        read_only_fields = ("id", "chat", "sender", "created_at", "is_read")


class ChatSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = (
            "id",
            "participants",
            "product",
            "created_at",
            "last_message",
            "unread_count",
        )
        read_only_fields = ("id", "created_at")

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

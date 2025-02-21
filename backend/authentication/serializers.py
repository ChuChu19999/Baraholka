from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from baraholka.models import UserProfile
import re


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "password2",
            "email",
            "first_name",
            "last_name",
            "phone_number",
        )

    def validate_phone_number(self, value):
        # Очищаем номер телефона от всех символов кроме цифр
        phone = re.sub(r"\D", "", value)

        # Проверяем длину и первую цифру
        if len(phone) != 11:
            raise serializers.ValidationError("Номер телефона должен содержать 11 цифр")

        if not phone.startswith("7"):
            raise serializers.ValidationError("Номер телефона должен начинаться с +7")

        # Форматируем номер для хранения
        formatted_phone = (
            f"+{phone[0]} ({phone[1:4]}) {phone[4:7]}-{phone[7:9]}-{phone[9:11]}"
        )
        return formatted_phone

    def validate_username(self, value):
        # Проверяем, что имя пользователя содержит только буквы, цифры и подчеркивания
        if not re.match(r"^[a-zA-Z0-9_]+$", value):
            raise serializers.ValidationError(
                "Имя пользователя может содержать только буквы, цифры и знак подчеркивания"
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})

        # Проверка уникальности email
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "Пользователь с таким email уже существует"}
            )

        # Проверка уникальности username
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError(
                {"username": "Пользователь с таким именем уже существует"}
            )

        return attrs

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number")
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        UserProfile.objects.create(user=user, phone_number=phone_number)

        return user


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        source="profile.phone_number", read_only=False, required=False
    )
    rating = serializers.FloatField(source="profile.rating", read_only=True)
    location = serializers.CharField(
        source="profile.location", read_only=False, required=False
    )
    created_at = serializers.DateTimeField(
        source="profile.created_at", read_only=True, format="%d.%m.%Y"
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "rating",
            "location",
            "created_at",
        )
        read_only_fields = ("id", "rating", "created_at")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        # Обновляем основные поля пользователя
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Обновляем поля профиля
        profile = instance.profile
        if "phone_number" in profile_data:
            profile.phone_number = profile_data["phone_number"]
        if "location" in profile_data:
            profile.location = profile_data["location"]
        profile.save()

        return instance

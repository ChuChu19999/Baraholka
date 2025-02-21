from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Пользователь",
    )
    phone_number = models.CharField(
        max_length=20, verbose_name="Номер телефона", blank=True
    )
    rating = models.FloatField(
        default=0.0, validators=[MinValueValidator(0.0)], verbose_name="Рейтинг"
    )
    location = models.CharField(
        max_length=100, verbose_name="Местоположение", blank=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Дата регистрации"
    )

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"

    def __str__(self):
        return f"Профиль пользователя {self.user.username}"


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название категории")
    description = models.TextField(verbose_name="Описание", blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name="Родительская категория",
    )
    slug = models.SlugField(unique=True, verbose_name="URL-идентификатор")
    icon = models.ImageField(
        upload_to="category_icons/", verbose_name="Иконка категории", blank=True
    )

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    CONDITION_CHOICES = (
        ("new", "Новый"),
        ("used", "Б/У"),
    )
    STATUS_CHOICES = (
        ("active", "Активно"),
        ("sold", "Продано"),
        ("archived", "В архиве"),
    )

    title = models.CharField(max_length=200, verbose_name="Название товара")
    description = models.TextField(verbose_name="Описание товара")
    price = models.DecimalField(
        max_digits=30,
        decimal_places=2,
        validators=[MinValueValidator(0.0)],
        verbose_name="Цена",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="main_products",
        verbose_name="Основная категория",
        limit_choices_to={"parent": None},
    )
    subcategory = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="sub_products",
        verbose_name="Подкатегория",
        null=True,
        blank=True,
        limit_choices_to={"parent__isnull": False},
    )
    seller = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="products", verbose_name="Продавец"
    )
    condition = models.CharField(
        max_length=4,
        choices=CONDITION_CHOICES,
        default="new",
        verbose_name="Состояние товара",
    )
    status = models.CharField(
        max_length=8,
        choices=STATUS_CHOICES,
        default="active",
        verbose_name="Статус объявления",
    )
    location = models.CharField(max_length=100, verbose_name="Местоположение")
    views_count = models.PositiveIntegerField(
        default=0, verbose_name="Количество просмотров"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата публикации")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    slug = models.SlugField(unique=True, verbose_name="URL-идентификатор")

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images", verbose_name="Товар"
    )
    image = models.ImageField(upload_to="product_images/", verbose_name="Изображение")
    order = models.PositiveSmallIntegerField(
        default=0, verbose_name="Порядок отображения"
    )

    class Meta:
        verbose_name = "Изображение товара"
        verbose_name_plural = "Изображения товаров"
        ordering = ["order"]

    def __str__(self):
        return f"Изображение {self.order} товара {self.product.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="favorites",
        verbose_name="Пользователь",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="favorited_by",
        verbose_name="Товар",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    class Meta:
        verbose_name = "Избранное"
        verbose_name_plural = "Избранное"
        unique_together = ["user", "product"]

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"


class Chat(models.Model):
    participants = models.ManyToManyField(
        User, related_name="chats", verbose_name="Участники чата"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="chats", verbose_name="Товар"
    )

    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Чат {self.id} - {self.product.title}"


class Message(models.Model):
    chat = models.ForeignKey(
        Chat, on_delete=models.CASCADE, related_name="messages", verbose_name="Чат"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages",
        verbose_name="Отправитель",
    )
    text = models.TextField(verbose_name="Текст сообщения")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата отправки")
    is_read = models.BooleanField(default=False, verbose_name="Прочитано")

    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ["created_at"]

    def __str__(self):
        return f"Сообщение от {self.sender.username} в чате {self.chat.id}"


class ProductView(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="views", verbose_name="Товар"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="product_views",
        verbose_name="Пользователь",
    )
    ip_address = models.GenericIPAddressField(
        verbose_name="IP адрес", null=True, blank=True
    )
    viewed_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата просмотра")

    class Meta:
        verbose_name = "Просмотр товара"
        verbose_name_plural = "Просмотры товаров"
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["product", "user", "viewed_at"]),
            models.Index(fields=["product", "ip_address", "viewed_at"]),
        ]

    def __str__(self):
        return f"Просмотр {self.product.title} от {self.user.username if self.user else self.ip_address}"

    def save(self, *args, **kwargs):
        # Проверяем, был ли уже просмотр сегодня
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timezone.timedelta(days=1)

        if self.user:
            existing_view = ProductView.objects.filter(
                product=self.product,
                user=self.user,
                viewed_at__range=(today_start, today_end),
            ).exists()
        else:
            existing_view = ProductView.objects.filter(
                product=self.product,
                ip_address=self.ip_address,
                viewed_at__range=(today_start, today_end),
            ).exists()

        if not existing_view:
            super().save(*args, **kwargs)

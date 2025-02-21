from django.contrib import admin
from django.utils.html import format_html
from .models import UserProfile, Category, Product, ProductImage, Favorite


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone_number", "rating", "location", "created_at")
    list_filter = ("rating", "location", "created_at")
    search_fields = ("user__username", "phone_number", "location")
    readonly_fields = ("rating", "created_at")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "get_icon", "slug")
    list_filter = ("parent",)
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}

    def get_icon(self, obj):
        if obj.icon:
            return format_html('<img src="{}" width="50" height="50" />', obj.icon.url)
        return "Нет иконки"

    get_icon.short_description = "Иконка"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "price",
        "seller",
        "category",
        "condition",
        "status",
        "views_count",
        "created_at",
    )
    list_filter = ("category", "condition", "status", "created_at")
    search_fields = ("title", "description", "seller__username", "location")
    readonly_fields = ("views_count", "created_at", "updated_at")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProductImageInline]
    list_per_page = 20

    fieldsets = (
        (
            "Основная информация",
            {"fields": ("title", "description", "price", "category", "seller")},
        ),
        (
            "Дополнительная информация",
            {"fields": ("condition", "status", "location", "slug")},
        ),
        (
            "Статистика",
            {
                "fields": ("views_count", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "product__title")
    readonly_fields = ("created_at",)

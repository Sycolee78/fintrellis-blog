from rest_framework import serializers

from .constants import ALLOWED_THUMBNAIL_TYPES, MAX_THUMBNAIL_SIZE_MB, MIN_CONTENT_LENGTH
from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    """Minimal representation for list endpoints (excludes full content)."""

    thumbnail_url = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_email",
            "title",
            "slug",
            "excerpt",
            "category",
            "thumbnail_url",
            "image_url",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_author_email(self, obj):
        return obj.author.email if obj.author else None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class PostDetailSerializer(serializers.ModelSerializer):
    """Full representation for detail, create, and update endpoints."""

    thumbnail = serializers.ImageField(required=False, allow_null=True)
    thumbnail_url = serializers.SerializerMethodField(read_only=True)
    author_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_email",
            "title",
            "slug",
            "content",
            "excerpt",
            "category",
            "thumbnail",
            "thumbnail_url",
            "image_url",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "author", "author_email", "slug", "thumbnail_url",
            "published_at", "created_at", "updated_at",
        ]

    def get_author_email(self, obj):
        return obj.author.email if obj.author else None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None

    def validate_content(self, value):
        if len(value.strip()) < MIN_CONTENT_LENGTH:
            raise serializers.ValidationError(
                f"Content must be at least {MIN_CONTENT_LENGTH} characters."
            )
        return value

    def validate_title(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title cannot be blank.")
        return cleaned

    def validate_thumbnail(self, value):
        if value is None:
            return value
        if value.content_type not in ALLOWED_THUMBNAIL_TYPES:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed: JPEG, PNG, WebP."
            )
        max_bytes = MAX_THUMBNAIL_SIZE_MB * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError(
                f"File too large. Maximum size is {MAX_THUMBNAIL_SIZE_MB} MB."
            )
        return value

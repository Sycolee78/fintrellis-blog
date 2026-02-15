from django.db import models

from common.models import TimeStampedModel
from .managers import PostManager


def post_thumbnail_path(instance, filename):
    """Upload thumbnails to posts/thumbnails/<uuid>/<filename>."""
    return f"posts/thumbnails/{instance.id}/{filename}"


class Post(TimeStampedModel):
    """Blog post entity."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    content = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True)
    category = models.CharField(max_length=50, blank=True, db_index=True)
    thumbnail = models.ImageField(
        upload_to=post_thumbnail_path, blank=True, null=True
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = PostManager()

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        indexes = [
            models.Index(fields=["status", "-published_at"]),
        ]

    def __str__(self):
        return self.title

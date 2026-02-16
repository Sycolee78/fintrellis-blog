import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """Custom user with email as USERNAME_FIELD and a role field."""

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        AUTHOR = "author", "Author"
        READER = "reader", "Reader"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = None
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.READER,
        db_index=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

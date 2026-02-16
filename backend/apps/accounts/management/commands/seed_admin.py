import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create initial admin user if none exists."

    def handle(self, *args, **options):
        if User.objects.filter(role="admin").exists():
            self.stdout.write(self.style.WARNING("Admin user already exists. Skipping."))
            return

        email = os.environ.get("ADMIN_EMAIL", "admin@blog.local")
        password = os.environ.get("ADMIN_PASSWORD", "admin123!@#")

        User.objects.create_superuser(
            email=email,
            password=password,
            first_name="Admin",
            last_name="User",
        )
        self.stdout.write(self.style.SUCCESS(f"Admin user created: {email}"))

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.posts.models import Post
from apps.posts.services import PostService

User = get_user_model()

SAMPLE_POSTS = [
    {
        "title": "Getting Started with Docker Compose",
        "content": "Docker Compose makes it easy to run multi-container applications. Learn how to set up a dev environment with PostgreSQL, Django, and React.",
        "category": "DevOps",
        "status": "published",
    },
    {
        "title": "Building REST APIs with Django REST Framework",
        "content": "A comprehensive guide to building production-ready REST APIs using Django REST Framework. Covers serializers, views, permissions, and testing.",
        "category": "Backend",
        "status": "published",
    },
    {
        "title": "React Hooks Deep Dive",
        "content": "Understanding useEffect, useCallback, useMemo, and custom hooks. A comprehensive guide to modern React patterns and best practices.",
        "category": "Technology",
        "status": "published",
    },
    {
        "title": "PostgreSQL Performance Tuning",
        "content": "Practical tips for making your PostgreSQL queries faster. Covers indexing strategies, EXPLAIN analysis, and query optimization patterns.",
        "category": "Database",
        "status": "published",
    },
    {
        "title": "JWT Authentication Best Practices",
        "content": "Learn how to implement secure JWT authentication with refresh token rotation, HttpOnly cookies, and proper token lifecycle management.",
        "category": "Security",
        "status": "published",
    },
    {
        "title": "CSS Grid Layout Mastery",
        "content": "Master CSS Grid with practical examples. Build responsive card grids, dashboard layouts, and complex page structures without frameworks.",
        "category": "Design",
        "status": "published",
    },
    {
        "title": "Python Type Hints Guide",
        "content": "A practical guide to Python type hints and mypy for better code quality. Covers generics, protocols, and integration with Django.",
        "category": "Technology",
        "status": "draft",
    },
]


class Command(BaseCommand):
    help = "Create a sample author and posts for development."

    def handle(self, *args, **options):
        if Post.objects.exists():
            self.stdout.write(self.style.WARNING("Posts already exist. Skipping."))
            return

        # Create an author user
        author, created = User.objects.get_or_create(
            email="author@blog.local",
            defaults={
                "first_name": "Sample",
                "last_name": "Author",
                "role": "author",
            },
        )
        if created:
            author.set_password("author123!@#")
            author.save()
            self.stdout.write(self.style.SUCCESS(f"Author created: {author.email}"))

        for post_data in SAMPLE_POSTS:
            post = PostService.create_post(
                title=post_data["title"],
                content=post_data["content"],
                category=post_data["category"],
                status=post_data["status"],
                author=author,
            )
            self.stdout.write(f"  Created: {post.title}")

        self.stdout.write(self.style.SUCCESS(f"Created {len(SAMPLE_POSTS)} sample posts."))

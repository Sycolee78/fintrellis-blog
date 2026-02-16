"""
Business logic layer for blog posts.

All domain rules live here. Views delegate to these functions;
they should never contain ORM queries or business rules directly.
"""
import logging
import uuid

from django.utils import timezone
from django.utils.text import slugify

from .constants import AUTO_EXCERPT_LENGTH
from .models import Post

logger = logging.getLogger(__name__)


class PostService:
    """Stateless service encapsulating post business logic."""

    @staticmethod
    def list_posts(queryset=None):
        """Return the base queryset used by list views."""
        if queryset is None:
            queryset = Post.objects.all()
        return queryset

    @staticmethod
    def get_post(post_id):
        """Retrieve a single post by primary key. Raises Post.DoesNotExist."""
        return Post.objects.get(pk=post_id)

    @staticmethod
    def create_post(*, title, content, author, excerpt="", category="", status="draft", thumbnail=None):
        """Create a new post with auto-generated slug and excerpt."""
        slug = PostService._generate_unique_slug(title)
        if not excerpt:
            excerpt = content[:AUTO_EXCERPT_LENGTH].strip()

        published_at = None
        if status == Post.Status.PUBLISHED:
            published_at = timezone.now()

        post = Post(
            title=title,
            slug=slug,
            content=content,
            excerpt=excerpt,
            category=category,
            status=status,
            published_at=published_at,
            author=author,
        )
        # Assign thumbnail before first save so upload_to can use post.id
        if thumbnail:
            post.thumbnail = thumbnail
        post.save()

        logger.info("Post created: %s (id=%s)", post.title, post.id)
        return post

    @staticmethod
    def update_post(post, *, data):
        """Full or partial update of a post."""
        old_status = post.status

        for field, value in data.items():
            setattr(post, field, value)

        # Auto-set published_at on draft -> published transition
        if old_status == Post.Status.DRAFT and post.status == Post.Status.PUBLISHED:
            post.published_at = timezone.now()

        # Regenerate excerpt if content changed and excerpt wasn't explicitly set
        if "content" in data and "excerpt" not in data:
            post.excerpt = post.content[:AUTO_EXCERPT_LENGTH].strip()

        post.save()
        logger.info("Post updated: %s (id=%s)", post.title, post.id)
        return post

    @staticmethod
    def delete_post(post):
        """Permanently delete a post."""
        post_id = post.id
        post_title = post.title
        # Delete thumbnail file if it exists
        if post.thumbnail:
            post.thumbnail.delete(save=False)
        post.delete()
        logger.info("Post deleted: %s (id=%s)", post_title, post_id)

    @staticmethod
    def _generate_unique_slug(title):
        """Generate a URL-safe slug, appending a short UUID suffix on collision."""
        base_slug = slugify(title)
        if not base_slug:
            base_slug = "post"

        slug = base_slug
        if Post.objects.filter(slug=slug).exists():
            suffix = uuid.uuid4().hex[:8]
            slug = f"{base_slug}-{suffix}"
        return slug

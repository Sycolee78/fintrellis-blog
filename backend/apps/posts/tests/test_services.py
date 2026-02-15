import pytest

from apps.posts.models import Post
from apps.posts.services import PostService
from .factories import PostFactory


@pytest.mark.django_db
class TestPostServiceCreate:
    def test_create_post_generates_slug(self):
        post = PostService.create_post(
            title="Hello World",
            content="This is test content for the blog post.",
        )
        assert post.slug == "hello-world"

    def test_create_post_handles_duplicate_slug(self):
        PostFactory(slug="hello-world")
        post = PostService.create_post(
            title="Hello World",
            content="This is different content for testing.",
        )
        assert post.slug.startswith("hello-world-")
        assert post.slug != "hello-world"

    def test_create_post_auto_generates_excerpt(self):
        content = "A" * 300
        post = PostService.create_post(title="Test", content=content)
        assert len(post.excerpt) == 200

    def test_create_post_preserves_explicit_excerpt(self):
        post = PostService.create_post(
            title="Test",
            content="This is enough content for the blog post.",
            excerpt="My custom excerpt",
        )
        assert post.excerpt == "My custom excerpt"

    def test_create_published_post_sets_published_at(self):
        post = PostService.create_post(
            title="Published Post",
            content="This is enough content for the blog post.",
            status="published",
        )
        assert post.status == Post.Status.PUBLISHED
        assert post.published_at is not None

    def test_create_post_with_category(self):
        post = PostService.create_post(
            title="Categorized Post",
            content="This is enough content for the blog post.",
            category="Technology",
        )
        assert post.category == "Technology"

    def test_create_post_category_defaults_to_empty(self):
        post = PostService.create_post(
            title="No Category",
            content="This is enough content for the blog post.",
        )
        assert post.category == ""


@pytest.mark.django_db
class TestPostServiceUpdate:
    def test_update_post_changes_title(self):
        post = PostFactory(title="Old Title")
        updated = PostService.update_post(post, data={"title": "New Title"})
        assert updated.title == "New Title"

    def test_publish_sets_published_at(self):
        post = PostFactory(status="draft")
        updated = PostService.update_post(post, data={"status": "published"})
        assert updated.published_at is not None

    def test_update_category(self):
        post = PostFactory(category="Old")
        updated = PostService.update_post(post, data={"category": "New"})
        assert updated.category == "New"


@pytest.mark.django_db
class TestPostServiceDelete:
    def test_delete_post_removes_from_db(self):
        post = PostFactory()
        post_id = post.id
        PostService.delete_post(post)
        assert not Post.objects.filter(pk=post_id).exists()

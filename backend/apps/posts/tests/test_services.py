import pytest

from apps.accounts.tests.factories import UserFactory
from apps.posts.models import Post
from apps.posts.services import PostService

from .factories import PostFactory


@pytest.fixture
def author():
    return UserFactory(role="author")


@pytest.mark.django_db
class TestPostServiceCreate:
    def test_create_post_generates_slug(self, author):
        post = PostService.create_post(
            title="Hello World",
            content="This is test content for the blog post.",
            author=author,
        )
        assert post.slug == "hello-world"

    def test_create_post_handles_duplicate_slug(self, author):
        PostFactory(slug="hello-world")
        post = PostService.create_post(
            title="Hello World",
            content="This is different content for testing.",
            author=author,
        )
        assert post.slug.startswith("hello-world-")
        assert post.slug != "hello-world"

    def test_create_post_auto_generates_excerpt(self, author):
        content = "A" * 300
        post = PostService.create_post(title="Test", content=content, author=author)
        assert len(post.excerpt) == 200

    def test_create_post_preserves_explicit_excerpt(self, author):
        post = PostService.create_post(
            title="Test",
            content="This is enough content for the blog post.",
            excerpt="My custom excerpt",
            author=author,
        )
        assert post.excerpt == "My custom excerpt"

    def test_create_published_post_sets_published_at(self, author):
        post = PostService.create_post(
            title="Published Post",
            content="This is enough content for the blog post.",
            status="published",
            author=author,
        )
        assert post.status == Post.Status.PUBLISHED
        assert post.published_at is not None

    def test_create_post_with_category(self, author):
        post = PostService.create_post(
            title="Categorized Post",
            content="This is enough content for the blog post.",
            category="Technology",
            author=author,
        )
        assert post.category == "Technology"

    def test_create_post_category_defaults_to_empty(self, author):
        post = PostService.create_post(
            title="No Category",
            content="This is enough content for the blog post.",
            author=author,
        )
        assert post.category == ""

    def test_create_post_assigns_author(self, author):
        post = PostService.create_post(
            title="Authored Post",
            content="This is enough content for the blog post.",
            author=author,
        )
        assert post.author == author
        assert post.author_id == author.id


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

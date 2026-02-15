import pytest

from apps.posts.models import Post
from .factories import PostFactory


@pytest.mark.django_db
class TestPostModel:
    def test_str_returns_title(self):
        post = PostFactory(title="Hello World")
        assert str(post) == "Hello World"

    def test_default_status_is_draft(self):
        post = PostFactory()
        assert post.status == Post.Status.DRAFT

    def test_uuid_primary_key_is_assigned(self):
        post = PostFactory()
        assert post.id is not None
        assert len(str(post.id)) == 36

    def test_created_at_is_set_automatically(self):
        post = PostFactory()
        assert post.created_at is not None

    def test_updated_at_changes_on_save(self):
        post = PostFactory()
        original_updated = post.updated_at
        post.title = "Updated Title"
        post.save()
        post.refresh_from_db()
        assert post.updated_at > original_updated

    def test_category_defaults_to_empty(self):
        post = PostFactory(category="")
        assert post.category == ""

    def test_category_is_stored(self):
        post = PostFactory(category="Technology")
        assert post.category == "Technology"

    def test_thumbnail_defaults_to_none(self):
        post = PostFactory()
        assert not post.thumbnail


@pytest.mark.django_db
class TestPostManager:
    def test_published_returns_only_published(self):
        PostFactory(published=True)
        PostFactory()  # draft
        assert Post.objects.published().count() == 1

    def test_drafts_returns_only_drafts(self):
        PostFactory(published=True)
        PostFactory()  # draft
        assert Post.objects.drafts().count() == 1

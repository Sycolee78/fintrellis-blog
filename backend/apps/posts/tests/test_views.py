import uuid

import pytest
from django.urls import reverse
from rest_framework import status

from .factories import PostFactory


@pytest.mark.django_db
class TestPostListAPI:
    def test_list_posts_returns_200(self, api_client):
        PostFactory.create_batch(3)
        response = api_client.get(reverse("post-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 3

    def test_list_posts_paginates(self, api_client):
        PostFactory.create_batch(15)
        response = api_client.get(reverse("post-list"), {"page_size": 5})
        assert len(response.data["results"]) == 5
        assert response.data["next"] is not None

    def test_list_posts_filters_by_status(self, api_client):
        PostFactory(published=True)
        PostFactory()  # draft
        response = api_client.get(reverse("post-list"), {"status": "published"})
        assert response.data["count"] == 1

    def test_list_posts_filters_by_category(self, api_client):
        PostFactory(category="Tech")
        PostFactory(category="Design")
        response = api_client.get(reverse("post-list"), {"category": "Tech"})
        assert response.data["count"] == 1

    def test_list_posts_search_by_title(self, api_client):
        PostFactory(title="Django Tutorial")
        PostFactory(title="React Guide")
        response = api_client.get(reverse("post-list"), {"search": "Django"})
        assert response.data["count"] == 1

    def test_list_response_includes_thumbnail_url(self, api_client):
        PostFactory()
        response = api_client.get(reverse("post-list"))
        assert "thumbnail_url" in response.data["results"][0]

    def test_list_response_includes_category(self, api_client):
        PostFactory(category="Tech")
        response = api_client.get(reverse("post-list"))
        assert response.data["results"][0]["category"] == "Tech"

    def test_list_posts_empty_returns_200(self, api_client):
        response = api_client.get(reverse("post-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0


@pytest.mark.django_db
class TestPostCreateAPI:
    def test_create_post_with_valid_data(self, api_client):
        payload = {
            "title": "Test Post",
            "content": "This is enough content for the minimum validation.",
        }
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["slug"] == "test-post"
        assert response.data["status"] == "draft"

    def test_create_post_with_category(self, api_client):
        payload = {
            "title": "Test Post",
            "content": "This is enough content for the minimum validation.",
            "category": "Technology",
        }
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["category"] == "Technology"

    def test_create_post_without_title_returns_400(self, api_client):
        payload = {"content": "Missing title field but enough content."}
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_post_with_short_content_returns_400(self, api_client):
        payload = {"title": "Test", "content": "Short"}
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_published_post(self, api_client):
        payload = {
            "title": "Published Post",
            "content": "This is enough content for the minimum validation.",
            "status": "published",
        }
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["published_at"] is not None


@pytest.mark.django_db
class TestPostDetailAPI:
    def test_get_post_returns_200(self, api_client):
        post = PostFactory()
        response = api_client.get(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(post.id)
        assert "content" in response.data
        assert "thumbnail_url" in response.data
        assert "category" in response.data

    def test_get_nonexistent_post_returns_404(self, api_client):
        fake_id = uuid.uuid4()
        response = api_client.get(reverse("post-detail", args=[fake_id]))
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPostUpdateAPI:
    def test_put_updates_post(self, api_client):
        post = PostFactory()
        payload = {
            "title": "Updated Title",
            "content": "This is updated content that is long enough.",
        }
        response = api_client.put(
            reverse("post-detail", args=[post.id]), payload, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated Title"

    def test_patch_updates_category(self, api_client):
        post = PostFactory(category="Old")
        payload = {"category": "New"}
        response = api_client.patch(
            reverse("post-detail", args=[post.id]), payload, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["category"] == "New"

    def test_patch_partially_updates_post(self, api_client):
        post = PostFactory(title="Original")
        payload = {"title": "Patched"}
        response = api_client.patch(
            reverse("post-detail", args=[post.id]), payload, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Patched"

    def test_put_with_invalid_data_returns_400(self, api_client):
        post = PostFactory()
        payload = {"title": "", "content": "Short"}
        response = api_client.put(
            reverse("post-detail", args=[post.id]), payload, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPostDeleteAPI:
    def test_delete_post_returns_204(self, api_client):
        post = PostFactory()
        response = api_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_nonexistent_post_returns_404(self, api_client):
        fake_id = uuid.uuid4()
        response = api_client.delete(reverse("post-detail", args=[fake_id]))
        assert response.status_code == status.HTTP_404_NOT_FOUND

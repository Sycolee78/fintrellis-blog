import uuid

import pytest
from django.urls import reverse
from rest_framework import status

from apps.posts.tests.factories import PostFactory

from .factories import UserFactory


@pytest.mark.django_db
class TestUnauthenticatedAccess:
    """Unauthenticated requests should get 401 on all post endpoints."""

    def test_list_posts_401(self, api_client):
        response = api_client.get(reverse("post-list"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_post_401(self, api_client):
        response = api_client.post(
            reverse("post-list"),
            {"title": "Test", "content": "Content that is long enough."},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_detail_post_401(self, api_client, author_user):
        post = PostFactory(author=author_user)
        response = api_client.get(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_post_401(self, api_client, author_user):
        post = PostFactory(author=author_user)
        response = api_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestReaderPermissions:
    """Readers can list/detail but cannot create, update, or delete."""

    def test_reader_can_list(self, reader_client, author_user):
        PostFactory(author=author_user)
        response = reader_client.get(reverse("post-list"))
        assert response.status_code == status.HTTP_200_OK

    def test_reader_can_read_detail(self, reader_client, author_user):
        post = PostFactory(author=author_user)
        response = reader_client.get(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_200_OK

    def test_reader_cannot_create(self, reader_client):
        response = reader_client.post(
            reverse("post-list"),
            {"title": "Test", "content": "Content that is long enough."},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reader_cannot_update(self, reader_client, author_user):
        post = PostFactory(author=author_user)
        response = reader_client.patch(
            reverse("post-detail", args=[post.id]),
            {"title": "Hacked"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reader_cannot_delete(self, reader_client, author_user):
        post = PostFactory(author=author_user)
        response = reader_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAuthorPermissions:
    """Authors can create, and can edit/delete their own posts only."""

    def test_author_can_create(self, auth_client):
        response = auth_client.post(
            reverse("post-list"),
            {"title": "My Post", "content": "Content that is long enough here."},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_author_can_edit_own(self, auth_client, author_user):
        post = PostFactory(author=author_user)
        response = auth_client.patch(
            reverse("post-detail", args=[post.id]),
            {"title": "Updated"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_author_can_delete_own(self, auth_client, author_user):
        post = PostFactory(author=author_user)
        response = auth_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_author_cannot_edit_others(self, auth_client):
        other_author = UserFactory(author=True)
        post = PostFactory(author=other_author)
        response = auth_client.patch(
            reverse("post-detail", args=[post.id]),
            {"title": "Hacked"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_author_cannot_delete_others(self, auth_client):
        other_author = UserFactory(author=True)
        post = PostFactory(author=other_author)
        response = auth_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAdminPermissions:
    """Admins can create, edit any, and delete any post."""

    def test_admin_can_create(self, admin_client):
        response = admin_client.post(
            reverse("post-list"),
            {"title": "Admin Post", "content": "Content that is long enough here."},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_can_edit_any(self, admin_client):
        author = UserFactory(author=True)
        post = PostFactory(author=author)
        response = admin_client.patch(
            reverse("post-detail", args=[post.id]),
            {"title": "Admin Edit"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Admin Edit"

    def test_admin_can_delete_any(self, admin_client):
        author = UserFactory(author=True)
        post = PostFactory(author=author)
        response = admin_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT

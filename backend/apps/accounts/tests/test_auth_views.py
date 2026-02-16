import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

from .factories import UserFactory

User = get_user_model()


@pytest.mark.django_db
class TestRegisterView:
    url = reverse("auth-register")

    def test_register_valid(self, api_client):
        payload = {
            "email": "new@example.com",
            "password": "strongpass1234",
            "password_confirm": "strongpass1234",
            "first_name": "Jane",
            "last_name": "Doe",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["user"]["email"] == "new@example.com"
        assert response.data["user"]["role"] == "reader"
        assert "access" in response.data
        assert "refresh_token" in response.cookies

    def test_register_duplicate_email(self, api_client):
        UserFactory(email="taken@example.com")
        payload = {
            "email": "taken@example.com",
            "password": "strongpass1234",
            "password_confirm": "strongpass1234",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client):
        payload = {
            "email": "new@example.com",
            "password": "strongpass1234",
            "password_confirm": "differentpass",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client):
        payload = {
            "email": "new@example.com",
            "password": "123",
            "password_confirm": "123",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLoginView:
    url = reverse("auth-login")

    def test_login_valid(self, api_client):
        UserFactory(email="login@example.com", password="testpass1234")
        payload = {"email": "login@example.com", "password": "testpass1234"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["user"]["email"] == "login@example.com"
        assert "access" in response.data
        assert "refresh_token" in response.cookies

    def test_login_wrong_password(self, api_client):
        UserFactory(email="login@example.com", password="testpass1234")
        payload = {"email": "login@example.com", "password": "wrongpassword"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"]["code"] == "AUTHENTICATION_FAILED"

    def test_login_nonexistent_email(self, api_client):
        payload = {"email": "ghost@example.com", "password": "anything"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, api_client):
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestRefreshView:
    url = reverse("auth-refresh")

    def test_refresh_valid(self, api_client):
        UserFactory(email="refresh@example.com", password="testpass1234")
        login_resp = api_client.post(
            reverse("auth-login"),
            {"email": "refresh@example.com", "password": "testpass1234"},
            format="json",
        )
        refresh_cookie = login_resp.cookies.get("refresh_token")
        api_client.cookies["refresh_token"] = refresh_cookie.value
        response = api_client.post(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_refresh_no_cookie(self, api_client):
        response = api_client.post(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestLogoutView:
    url = reverse("auth-logout")

    def test_logout_authenticated(self, auth_client):
        response = auth_client.post(self.url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_logout_unauthenticated(self, api_client):
        response = api_client.post(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMeView:
    url = reverse("auth-me")

    def test_me_authenticated(self, auth_client, author_user):
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == author_user.email
        assert response.data["role"] == "author"

    def test_me_unauthenticated(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

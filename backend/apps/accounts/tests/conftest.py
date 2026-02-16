import pytest
from rest_framework.test import APIClient

from .factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def reader_user():
    return UserFactory(role="reader")


@pytest.fixture
def author_user():
    return UserFactory(role="author")


@pytest.fixture
def admin_user():
    return UserFactory(admin=True)


@pytest.fixture
def auth_client(author_user):
    """APIClient authenticated as an author."""
    client = APIClient()
    client.force_authenticate(user=author_user)
    return client


@pytest.fixture
def admin_client(admin_user):
    """APIClient authenticated as an admin."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def reader_client(reader_user):
    """APIClient authenticated as a reader."""
    client = APIClient()
    client.force_authenticate(user=reader_user)
    return client

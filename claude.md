# Full Stack Blog Post Manager — Project Execution Guide

> **Document Type:** Architecture Blueprint & Development Context
> **Version:** 1.0.0
> **Status:** Implementation-Ready
> **Audience:** Professional Development Team

---

## Table of Contents

1. [Project Purpose and Vision](#1-project-purpose-and-vision)
2. [System Architecture](#2-system-architecture)
3. [Backend Design (Django + DRF)](#3-backend-design-django--drf)
4. [Frontend Design (React)](#4-frontend-design-react)
5. [UI/UX Guidelines](#5-uiux-guidelines)
6. [Docker & Dev Environment](#6-docker--dev-environment)
7. [Development Workflow](#7-development-workflow)
8. [Deployment Considerations](#8-deployment-considerations)
9. [Bonus Feature Suggestions](#9-bonus-feature-suggestions)
10. [README Guidance](#10-readme-guidance)
11. [Coding Standards](#11-coding-standards)

---

## 1. Project Purpose and Vision

### 1.1 Goal

Build a **production-quality full-stack blog management system** that demonstrates clean architecture, separation of concerns, and engineering excellence. The system provides complete CRUD (Create, Read, Update, Delete) operations for blog posts through a decoupled REST API backend and a modern React single-page application frontend.

### 1.2 Target User Experience

- **Content Authors** can create, edit, and manage blog posts through an intuitive, responsive interface.
- **Readers** can browse and read published posts with fast page loads and clean typography.
- The interface must feel **snappy** — optimistic UI updates, loading skeletons, and clear error feedback.
- Zero-friction workflows: a user should go from "I have an idea" to "Post published" in under 60 seconds.

### 1.3 Engineering Quality Expectations

| Dimension | Standard |
|---|---|
| **Code Quality** | Lint-free, type-hinted (Python) / prop-typed or TypeScript-ready (React), consistent formatting |
| **Test Coverage** | Minimum 80% backend, meaningful integration tests for all API endpoints |
| **Documentation** | Every public function/component documented; API fully described via OpenAPI |
| **Security** | OWASP Top 10 mitigated; no secrets in source; parameterized queries only |
| **Performance** | API response times < 200ms p95 for list endpoints; frontend LCP < 2.5s |

### 1.4 Scalability and Maintainability Priorities

- **Horizontal scalability:** Stateless API behind a load balancer; database connection pooling.
- **Maintainability:** Layered architecture so any layer can be replaced without cascading changes. Business logic lives in service classes, never in views or serializers.
- **Extensibility:** Adding a new resource (e.g., Comments, Tags) should follow the same pattern and require no structural changes.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│                      │  HTTP   │                      │
│   React SPA          │◄───────►│   Django REST API    │
│   (Port 3000)        │  JSON   │   (Port 8000)        │
│                      │         │                      │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                                            │ SQL
                                            ▼
                                 ┌──────────────────────┐
                                 │                      │
                                 │   PostgreSQL         │
                                 │   (Port 5432)        │
                                 │                      │
                                 └──────────────────────┘
```

**Three isolated containers** communicate over a Docker bridge network:

1. **Frontend (React)** — Serves the SPA; proxies API calls to the backend during development.
2. **Backend (Django + DRF)** — Exposes a RESTful JSON API; handles business logic, validation, persistence.
3. **Database (PostgreSQL)** — Stores all relational data with ACID guarantees.

### 2.2 Communication Flow

```
User Action (Browser)
       │
       ▼
React Component (e.g., PostList)
       │
       ▼
API Service Layer (src/services/api.js)
       │  ── Axios HTTP request ──►
       ▼
Django URL Router (urls.py)
       │
       ▼
DRF ViewSet / APIView (views.py)
       │
       ▼
Service Layer (services.py)
       │
       ▼
Repository / ORM (models.py / managers.py)
       │
       ▼
PostgreSQL
       │
       ◄── JSON Response ──
       ▼
React State Update → Re-render
```

### 2.3 Layered Backend Architecture

| Layer | Responsibility | Files |
|---|---|---|
| **Views / Controllers** | HTTP request/response handling, status codes, authentication checks | `views.py` |
| **Serializers** | Input validation, data transformation, output formatting | `serializers.py` |
| **Services / Business Logic** | Domain rules, orchestration, side effects | `services.py` |
| **Repositories / Data Access** | Database queries, custom managers, query optimization | `models.py`, `managers.py` |
| **Models** | Schema definition, field-level constraints, DB migrations | `models.py` |

**Rationale:** This layered approach ensures that:
- Views remain thin (HTTP concerns only).
- Serializers handle marshalling, not logic.
- Business rules are testable without HTTP or database.
- Data access patterns can be optimized independently.

---

## 3. Backend Design (Django + DRF)

### 3.1 Project Structure

```
backend/
├── manage.py
├── requirements/
│   ├── base.txt              # Shared dependencies
│   ├── development.txt       # Dev-only (debug-toolbar, factory-boy)
│   └── production.txt        # Prod-only (gunicorn, sentry-sdk)
├── config/                   # Project configuration (renamed from default)
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py           # Shared settings
│   │   ├── development.py    # DEBUG=True, verbose logging
│   │   └── production.py     # Security hardening, HTTPS
│   ├── urls.py               # Root URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   └── posts/                # Blog posts application
│       ├── __init__.py
│       ├── admin.py          # Admin site registration
│       ├── apps.py           # App configuration
│       ├── models.py         # BlogPost model
│       ├── managers.py       # Custom QuerySet / Manager
│       ├── serializers.py    # DRF serializers
│       ├── services.py       # Business logic
│       ├── views.py          # API views
│       ├── urls.py           # App-level URL routing
│       ├── filters.py        # DRF filter backends
│       ├── pagination.py     # Custom pagination classes
│       ├── exceptions.py     # Custom exception classes
│       ├── constants.py      # App-level constants
│       ├── migrations/
│       │   └── __init__.py
│       └── tests/
│           ├── __init__.py
│           ├── conftest.py   # Shared fixtures
│           ├── factories.py  # Model factories (factory_boy)
│           ├── test_models.py
│           ├── test_serializers.py
│           ├── test_services.py
│           ├── test_views.py
│           └── test_filters.py
├── common/                   # Shared utilities across apps
│   ├── __init__.py
│   ├── models.py             # Abstract base models (TimeStampedModel)
│   ├── pagination.py         # Default pagination
│   ├── exceptions.py         # Global exception handler
│   └── middleware.py         # Request logging, etc.
├── Dockerfile
├── Dockerfile.dev
├── docker-entrypoint.sh      # Migrations + collectstatic + start
├── pytest.ini                # Pytest configuration
├── setup.cfg                 # Flake8, isort, mypy config
└── .env.example              # Template for environment variables
```

**Folder explanations:**

| Folder/File | Purpose |
|---|---|
| `config/` | Django project settings, URL root, WSGI/ASGI entry points. Named `config` instead of the project name for clarity. |
| `apps/posts/` | Self-contained Django app for blog post CRUD. Each concern (models, views, services) is a separate module. |
| `apps/posts/services.py` | Encapsulates business logic. Views delegate to services; services call the ORM. This keeps views thin and logic testable. |
| `apps/posts/managers.py` | Custom QuerySet methods (e.g., `published()`, `by_author()`) to keep query logic out of views and services. |
| `apps/posts/tests/` | Colocated tests organized by layer. `conftest.py` holds shared fixtures; `factories.py` uses `factory_boy` for test data. |
| `common/` | Shared code: abstract models, pagination defaults, global exception handling. Prevents duplication across apps. |
| `requirements/` | Split requirements for reproducible builds per environment. |

### 3.2 Database Schema

#### BlogPost Model

```python
# common/models.py
from django.db import models
import uuid


class TimeStampedModel(models.Model):
    """Abstract base model with UUID primary key and timestamps."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
```

```python
# apps/posts/models.py
from django.db import models
from common.models import TimeStampedModel
from .managers import PostManager


class Post(TimeStampedModel):
    """Blog post entity."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    content = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = PostManager()

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        indexes = [
            models.Index(fields=["status", "-published_at"]),
        ]

    def __str__(self):
        return self.title
```

#### Field Specifications

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK, auto-generated, not editable | Globally unique identifier; avoids sequential ID enumeration |
| `title` | CharField(255) | Required, max 255 chars | Post headline |
| `slug` | SlugField(255) | Required, unique, indexed | URL-friendly identifier for SEO |
| `content` | TextField | Required | Full post body |
| `excerpt` | CharField(500) | Optional, max 500 chars | Short summary for list views |
| `status` | CharField(10) | Choices: draft/published, default: draft | Publication state |
| `published_at` | DateTimeField | Nullable, indexed | When the post went live; set automatically on publish |
| `created_at` | DateTimeField | Auto, indexed | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last modification timestamp |

#### Validation Rules

1. `title` — Required, 1-255 characters, stripped of leading/trailing whitespace.
2. `slug` — Auto-generated from `title` if not provided; must be unique; lowercase alphanumeric + hyphens only.
3. `content` — Required, minimum 10 characters (prevents empty posts).
4. `excerpt` — If blank, auto-generated from first 200 characters of `content`.
5. `status` — Must be one of the defined choices.
6. `published_at` — Automatically set to `now()` when status transitions from `draft` to `published`.

### 3.3 API Design

**Base URL:** `/api/v1/`

#### Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/posts/` | List all posts (paginated) | No |
| `GET` | `/api/v1/posts/{id}/` | Retrieve a single post | No |
| `POST` | `/api/v1/posts/` | Create a new post | No* |
| `PUT` | `/api/v1/posts/{id}/` | Full update of a post | No* |
| `PATCH` | `/api/v1/posts/{id}/` | Partial update of a post | No* |
| `DELETE` | `/api/v1/posts/{id}/` | Delete a post | No* |

> \* Authentication not required for the base assignment. See [Bonus Features](#9-bonus-feature-suggestions) for auth implementation.

#### Request/Response Specifications

**GET /api/v1/posts/** — List Posts

```
Query Parameters:
  ?page=1          (default: 1)
  ?page_size=10    (default: 10, max: 100)
  ?status=published
  ?search=keyword
  ?ordering=-created_at
```

Response `200 OK`:
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/v1/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting Started with Django",
      "slug": "getting-started-with-django",
      "excerpt": "A beginner's guide to Django...",
      "status": "published",
      "published_at": "2026-02-10T14:30:00Z",
      "created_at": "2026-02-10T12:00:00Z",
      "updated_at": "2026-02-10T14:30:00Z"
    }
  ]
}
```

**GET /api/v1/posts/{id}/** — Retrieve Post

Response `200 OK`:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started with Django",
  "slug": "getting-started-with-django",
  "content": "Full markdown content here...",
  "excerpt": "A beginner's guide to Django...",
  "status": "published",
  "published_at": "2026-02-10T14:30:00Z",
  "created_at": "2026-02-10T12:00:00Z",
  "updated_at": "2026-02-10T14:30:00Z"
}
```

Response `404 Not Found`:
```json
{
  "detail": "Not found."
}
```

**POST /api/v1/posts/** — Create Post

Request Body:
```json
{
  "title": "My New Post",
  "content": "This is the full content of the blog post...",
  "excerpt": "Optional short summary",
  "status": "draft"
}
```

Response `201 Created`:
```json
{
  "id": "generated-uuid",
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "This is the full content of the blog post...",
  "excerpt": "Optional short summary",
  "status": "draft",
  "published_at": null,
  "created_at": "2026-02-13T10:00:00Z",
  "updated_at": "2026-02-13T10:00:00Z"
}
```

Response `400 Bad Request`:
```json
{
  "title": ["This field is required."],
  "content": ["Ensure this field has at least 10 characters."]
}
```

**PUT /api/v1/posts/{id}/** — Full Update

Request Body: Same as POST (all fields required).

Response `200 OK`: Full post object.

**PATCH /api/v1/posts/{id}/** — Partial Update

Request Body: Any subset of fields.

Response `200 OK`: Full post object.

**DELETE /api/v1/posts/{id}/**

Response `204 No Content`: Empty body.

Response `404 Not Found`: Standard error.

#### HTTP Status Code Strategy

| Code | Usage |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Validation errors |
| `404 Not Found` | Resource does not exist |
| `405 Method Not Allowed` | Unsupported HTTP method |
| `500 Internal Server Error` | Unhandled exception (never expose stack traces) |

#### Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields failed validation.",
    "details": {
      "title": ["This field is required."],
      "content": ["Ensure this field has at least 10 characters."]
    }
  }
}
```

Implement this via a custom DRF exception handler in `common/exceptions.py`:

```python
# common/exceptions.py
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "error": {
                "code": _get_error_code(exc),
                "message": _get_error_message(exc),
                "details": response.data if isinstance(response.data, dict) else {"detail": response.data},
            }
        }
        response.data = custom_data

    return response
```

### 3.4 Backend Best Practices

#### SOLID Principles Application

| Principle | Application |
|---|---|
| **S** — Single Responsibility | Views handle HTTP; Services handle logic; Models handle schema. |
| **O** — Open/Closed | New features (tags, comments) are new apps — existing code unchanged. |
| **L** — Liskov Substitution | All views conform to DRF's APIView contract. |
| **I** — Interface Segregation | Serializers: separate `ListSerializer` (minimal fields) vs `DetailSerializer` (all fields). |
| **D** — Dependency Inversion | Services depend on the ORM interface (QuerySet), not concrete models. |

#### Input Validation

- **Layer 1 (Serializer):** Type validation, required fields, max length, choices.
- **Layer 2 (Service):** Business rules (e.g., slug uniqueness, status transitions).
- **Layer 3 (Model):** Database constraints as the final safety net.

Never trust client input. Always validate at the serializer level before it reaches business logic.

#### Logging Strategy

```python
# config/settings/base.py
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "apps": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}
```

**Log levels:**
- `ERROR` — Unhandled exceptions, database failures.
- `WARNING` — Validation failures, deprecated usage.
- `INFO` — Post created/updated/deleted (audit trail).
- `DEBUG` — SQL queries, serializer data (development only).

#### Security Best Practices

1. **CORS:** Whitelist only the frontend origin. Never use `CORS_ALLOW_ALL_ORIGINS = True` in production.
2. **CSRF:** Disabled for API-only views (DRF's `SessionAuthentication` handles this when needed).
3. **SQL Injection:** Django ORM parameterizes all queries — never use raw SQL without `.raw()` with params.
4. **Mass Assignment:** Serializer `fields` explicitly list allowed fields. Never use `fields = "__all__"` in production.
5. **Rate Limiting:** Use DRF throttling classes (see bonus features).
6. **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` via Django's `SecurityMiddleware`.

#### Environment Variable Handling

```python
# config/settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() == "true"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "blogdb"),
        "USER": os.environ.get("DB_USER", "bloguser"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST", "db"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}
```

**Rules:**
- Never commit `.env` files. Only `.env.example` with placeholder values.
- All secrets come from environment variables.
- Provide sensible defaults only for non-sensitive values.

### 3.5 Testing Strategy

#### Test Pyramid

```
         ╱╲
        ╱  ╲      E2E Tests (manual/Cypress — optional)
       ╱────╲
      ╱      ╲    Integration Tests (API endpoint tests)
     ╱────────╲
    ╱          ╲   Unit Tests (services, models, serializers)
   ╱────────────╲
```

#### Unit Tests

Test services and models in isolation.

```python
# apps/posts/tests/test_services.py
import pytest
from apps.posts.services import PostService
from apps.posts.tests.factories import PostFactory


@pytest.mark.django_db
class TestPostService:
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

    def test_publish_post_sets_published_at(self):
        post = PostFactory(status="draft")
        published = PostService.publish_post(post.id)
        assert published.status == "published"
        assert published.published_at is not None
```

#### API Integration Tests

Test full request/response cycle.

```python
# apps/posts/tests/test_views.py
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.posts.tests.factories import PostFactory


@pytest.fixture
def api_client():
    return APIClient()


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

    def test_create_post_without_title_returns_400(self, api_client):
        payload = {"content": "Missing title field."}
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_post_with_short_content_returns_400(self, api_client):
        payload = {"title": "Test", "content": "Short"}
        response = api_client.post(reverse("post-list"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPostDeleteAPI:
    def test_delete_post_returns_204(self, api_client):
        post = PostFactory()
        response = api_client.delete(reverse("post-detail", args=[post.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_nonexistent_post_returns_404(self, api_client):
        import uuid
        fake_id = uuid.uuid4()
        response = api_client.delete(reverse("post-detail", args=[fake_id]))
        assert response.status_code == status.HTTP_404_NOT_FOUND
```

#### Test Configuration

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.development
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
```

---

## 4. Frontend Design (React)

### 4.1 Frontend Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── index.js                 # Entry point
│   ├── App.js                   # Root component + Router
│   ├── api/
│   │   ├── client.js            # Axios instance configuration
│   │   └── posts.js             # Post API service functions
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── TextArea.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   └── posts/
│   │       ├── PostCard.jsx     # Card for list view
│   │       ├── PostForm.jsx     # Shared create/edit form
│   │       └── PostStatusBadge.jsx
│   ├── pages/
│   │   ├── PostListPage.jsx     # GET /posts — browse all
│   │   ├── PostDetailPage.jsx   # GET /posts/:id — read one
│   │   ├── PostCreatePage.jsx   # POST /posts — create new
│   │   └── PostEditPage.jsx     # PUT /posts/:id — edit existing
│   ├── hooks/
│   │   ├── usePosts.js          # Fetch post list
│   │   ├── usePost.js           # Fetch single post
│   │   └── usePostMutation.js   # Create/update/delete
│   ├── utils/
│   │   ├── formatDate.js        # Date formatting helpers
│   │   ├── truncateText.js      # Text truncation
│   │   └── validation.js        # Form validation rules
│   └── styles/
│       ├── index.css            # Global styles / CSS reset
│       └── variables.css        # CSS custom properties
├── package.json
├── Dockerfile
├── Dockerfile.dev
├── .env.example
└── .env.development
```

### 4.2 Component Architecture

#### Page Components

**PostListPage** — Main landing page
- Fetches paginated list of posts via `usePosts` hook.
- Renders a grid/list of `PostCard` components.
- Includes search bar, status filter, and pagination controls.
- Shows `EmptyState` when no posts exist.
- Shows `LoadingSpinner` during fetch.

**PostDetailPage** — Single post view
- Fetches post by ID from URL params via `usePost` hook.
- Renders full content with title, date, status badge.
- Provides "Edit" and "Delete" action buttons.
- Delete shows `ConfirmDialog` before executing.

**PostCreatePage** — New post form
- Renders `PostForm` in create mode.
- On submit, calls `POST /api/v1/posts/`.
- On success, navigates to the new post's detail page.
- On error, displays validation messages inline.

**PostEditPage** — Edit existing post
- Fetches existing post data and pre-fills `PostForm`.
- On submit, calls `PUT /api/v1/posts/:id/`.
- On success, navigates to the updated post's detail page.

#### Reusable Components

| Component | Props | Purpose |
|---|---|---|
| `PostCard` | `post` | Displays title, excerpt, date, status in a card layout |
| `PostForm` | `initialData`, `onSubmit`, `isLoading` | Shared form for create and edit; handles validation |
| `PostStatusBadge` | `status` | Colored badge showing "Draft" or "Published" |
| `Button` | `variant`, `size`, `disabled`, `onClick` | Consistent button styling across the app |
| `Input` | `label`, `error`, `...inputProps` | Form input with label and error message |
| `TextArea` | `label`, `error`, `rows` | Multi-line text input |
| `Alert` | `type`, `message` | Success/error/warning notifications |
| `LoadingSpinner` | `size` | Centered spinner for loading states |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | Page navigation controls |
| `ConfirmDialog` | `isOpen`, `title`, `message`, `onConfirm`, `onCancel` | Confirmation modal for destructive actions |
| `EmptyState` | `message`, `actionLabel`, `onAction` | Friendly empty state with CTA |

### 4.3 State Management Approach

#### Principle: Keep It Simple

For a CRUD application of this scope, **local state + custom hooks** is the correct choice. No Redux, no Context API for data.

| State Type | Approach | Example |
|---|---|---|
| **Server state** | Custom hooks with `useEffect` + `useState` | `usePosts()`, `usePost(id)` |
| **Form state** | Component-local `useState` | Input values, validation errors |
| **UI state** | Component-local `useState` | Modal open/close, loading flags |
| **Navigation state** | React Router | Current page, URL params |

**Why not Redux / Context?**
- No shared state between unrelated components.
- Each page fetches its own data independently.
- Adding complexity without benefit violates YAGNI.

> **Upgrade path:** If the app grows to need shared state (e.g., user auth context), introduce React Context for auth only — not for post data.

#### API Communication Pattern

```javascript
// src/api/client.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || "An unexpected error occurred.";
    return Promise.reject({ message, details: error.response?.data?.error?.details });
  }
);

export default apiClient;
```

```javascript
// src/api/posts.js
import apiClient from "./client";

export const getPosts = (params) => apiClient.get("/posts/", { params });
export const getPost = (id) => apiClient.get(`/posts/${id}/`);
export const createPost = (data) => apiClient.post("/posts/", data);
export const updatePost = (id, data) => apiClient.put(`/posts/${id}/`, data);
export const deletePost = (id) => apiClient.delete(`/posts/${id}/`);
```

```javascript
// src/hooks/usePosts.js
import { useState, useEffect, useCallback } from "react";
import { getPosts } from "../api/posts";

export function usePosts(params = {}) {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosts(params);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { ...data, loading, error, refetch: fetchPosts };
}
```

### 4.4 Routing Strategy

```javascript
// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PostListPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

| Path | Page | Description |
|---|---|---|
| `/` | PostListPage | Home page with all posts |
| `/posts/new` | PostCreatePage | Create a new post |
| `/posts/:id` | PostDetailPage | View a single post |
| `/posts/:id/edit` | PostEditPage | Edit an existing post |

### 4.5 Form Validation Strategy

#### Validation Rules

| Field | Rules | Error Message |
|---|---|---|
| `title` | Required, 1-255 characters | "Title is required." / "Title must be under 255 characters." |
| `content` | Required, minimum 10 characters | "Content is required." / "Content must be at least 10 characters." |
| `excerpt` | Optional, max 500 characters | "Excerpt must be under 500 characters." |

#### Validation Implementation

```javascript
// src/utils/validation.js
export function validatePostForm(values) {
  const errors = {};

  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  } else if (values.title.length > 255) {
    errors.title = "Title must be under 255 characters.";
  }

  if (!values.content?.trim()) {
    errors.content = "Content is required.";
  } else if (values.content.trim().length < 10) {
    errors.content = "Content must be at least 10 characters.";
  }

  if (values.excerpt && values.excerpt.length > 500) {
    errors.excerpt = "Excerpt must be under 500 characters.";
  }

  return errors;
}
```

#### UX Error Display

- Validate **on blur** (when user leaves a field) for immediate feedback.
- Validate **on submit** for final check before API call.
- Show errors **inline below each field** in red text.
- Show **server-side errors** (from 400 responses) mapped to their respective fields.
- Show a **top-level alert** for non-field errors (e.g., network failure).

---

## 5. UI/UX Guidelines

### 5.1 Responsive Layout

- **Mobile-first** design approach.
- Breakpoints: `480px` (mobile), `768px` (tablet), `1024px` (desktop), `1280px` (wide).
- Post list: single column on mobile, 2 columns on tablet, 3 columns on desktop.
- Form pages: single column at all sizes, max-width `640px`, centered.
- Navigation: horizontal on desktop, hamburger menu on mobile.

### 5.2 Accessibility

- All form inputs have associated `<label>` elements.
- Error messages are linked to inputs via `aria-describedby`.
- Focus management: auto-focus first field on form pages; return focus after modal close.
- Color contrast ratio minimum 4.5:1 for all text.
- Interactive elements are keyboard-navigable (`Tab`, `Enter`, `Escape`).
- Status badges use both color and text (not color alone).

### 5.3 Loading and Error States

| State | Treatment |
|---|---|
| **Initial loading** | Full-page centered spinner with "Loading posts..." text |
| **Pagination loading** | Inline spinner replacing the post grid; keep pagination visible |
| **Form submitting** | Disable submit button; show spinner inside button; disable all form fields |
| **API error** | Red alert banner at top of content area with error message and retry button |
| **404 (post not found)** | Dedicated "Post not found" page with link back to list |
| **Empty list** | Friendly illustration/icon + "No posts yet. Create your first post!" with CTA button |
| **Delete confirmation** | Modal dialog with post title, "Are you sure?" message, Cancel and Delete buttons |

### 5.4 Layout Recommendations

- Use a clean, professional color palette (neutral backgrounds, accent color for CTAs).
- Consistent spacing using an 8px grid system.
- Typography: system font stack for performance; clear hierarchy with `h1` > `h2` > body.
- Cards with subtle shadows and rounded corners for post list items.
- Adequate whitespace — content should breathe.

---

## 6. Docker & Dev Environment

### 6.1 Multi-Container Architecture

```yaml
# docker-compose.yml (development)
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: blogdb
      POSTGRES_USER: bloguser
      POSTGRES_PASSWORD: blogpass
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bloguser -d blogdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.development
      - DJANGO_SECRET_KEY=dev-secret-key-change-in-production
      - DJANGO_DEBUG=true
      - DB_NAME=blogdb
      - DB_USER=bloguser
      - DB_PASSWORD=blogpass
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 6.2 Dockerfiles

**Backend Development:**

```dockerfile
# backend/Dockerfile.dev
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt requirements/development.txt ./requirements/
RUN pip install --no-cache-dir -r requirements/development.txt

COPY . .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

**Frontend Development:**

```dockerfile
# frontend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Production:**

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt requirements/production.txt ./requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### 6.3 Environment Configuration

| Variable | Development | Production |
|---|---|---|
| `DJANGO_DEBUG` | `true` | `false` |
| `DJANGO_SECRET_KEY` | Static dev key | Random 50+ char string |
| `DB_HOST` | `db` (Docker service name) | RDS/Cloud SQL endpoint |
| `REACT_APP_API_URL` | `http://localhost:8000/api/v1` | `/api/v1` (reverse proxy) |
| `ALLOWED_HOSTS` | `*` | `yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | `https://yourdomain.com` |

### 6.4 Development Workflow Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run backend tests
docker-compose exec backend pytest

# Run frontend tests
docker-compose exec frontend npm test

# Rebuild after dependency changes
docker-compose build --no-cache backend
docker-compose up -d backend

# Full reset
docker-compose down -v
docker-compose up -d --build
```

---

## 7. Development Workflow

### 7.1 Branch Strategy

```
main                    ← Production-ready code
  └── develop           ← Integration branch
       ├── feature/add-post-list
       ├── feature/create-post-form
       ├── fix/slug-generation-bug
       └── chore/docker-setup
```

| Branch Type | Pattern | Merges Into |
|---|---|---|
| `feature/*` | New functionality | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `chore/*` | Tooling, config, deps | `develop` |
| `docs/*` | Documentation only | `develop` |
| `develop` | Integration testing | `main` |
| `main` | Production releases | — |

### 7.2 Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`

**Scopes:** `backend`, `frontend`, `docker`, `ci`, `deps`

**Examples:**

```
feat(backend): add POST /api/v1/posts/ endpoint

- Implement PostCreateSerializer with title/content validation
- Add PostService.create_post() with slug generation
- Add unit tests for service and integration tests for endpoint

Tested: pytest passes (12 tests)
Docker: restart sufficient (no dep changes)
```

```
fix(frontend): prevent double submit on PostForm

- Disable submit button during API call
- Show loading spinner in button during submission

Tested: manual testing, no double posts created
```

### 7.3 Code Review Standards

Every PR must:

1. Have a clear description of what changed and why.
2. Include tests for new functionality.
3. Pass all existing tests.
4. Have no linting errors.
5. Follow the project's coding standards (Section 11).
6. Be reviewed by at least one other developer.

**Review checklist:**
- [ ] Does the code do what the PR description says?
- [ ] Are there tests?
- [ ] Are error cases handled?
- [ ] Is the code readable without excessive comments?
- [ ] Are there any security concerns?
- [ ] Does it follow the established patterns?

### 7.4 Development Milestones

| Milestone | Deliverables | Estimated Effort |
|---|---|---|
| **M1: Project Setup** | Docker Compose, Django project skeleton, React app scaffold, DB connection verified | Foundation |
| **M2: Backend CRUD** | Post model, migrations, all 5 REST endpoints, serializers, services, API tests | Core backend |
| **M3: Frontend Shell** | Layout, routing, API client, empty page components | Core frontend |
| **M4: Post List & Detail** | PostListPage with pagination, PostDetailPage, loading/error states | Read operations |
| **M5: Create & Edit** | PostForm component, create page, edit page, form validation | Write operations |
| **M6: Delete & Polish** | Delete with confirmation, error handling, responsive design, accessibility pass | Completion |
| **M7: Testing & Docs** | Full test coverage, README, final code cleanup | Quality assurance |

---

## 8. Deployment Considerations

### 8.1 Environment Configuration Strategy

Use a **12-factor app** approach:
- All configuration via environment variables.
- No environment-specific code paths — only environment-specific settings files.
- Use `.env.example` as documentation; never commit actual `.env` files.

### 8.2 Static & Media Handling

| Environment | Static Files | Strategy |
|---|---|---|
| Development | Django's `runserver` serves static | Auto via `django.contrib.staticfiles` |
| Production | Nginx or CDN serves static | `collectstatic` → volume mount → Nginx |

```nginx
# nginx.conf (production)
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location / {
        root /app/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
```

### 8.3 Security Recommendations

1. **HTTPS everywhere** — Use Let's Encrypt or a cloud-managed certificate.
2. **Django security settings** in production:
   ```python
   SECURE_SSL_REDIRECT = True
   SECURE_HSTS_SECONDS = 31536000
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   SECURE_BROWSER_XSS_FILTER = True
   ```
3. **Database:** Use strong passwords; restrict network access to the application only.
4. **Docker:** Run containers as non-root users; use multi-stage builds to minimize image size.
5. **Dependencies:** Run `pip-audit` and `npm audit` regularly; pin versions in requirements.

### 8.4 Production Readiness Checklist

- [ ] All tests pass
- [ ] `DEBUG = False`
- [ ] `SECRET_KEY` is a unique, randomly generated value
- [ ] `ALLOWED_HOSTS` is set to the production domain only
- [ ] `CORS_ALLOWED_ORIGINS` whitelist is minimal
- [ ] Database credentials are strong and not defaults
- [ ] Static files are collected and served via Nginx/CDN
- [ ] Logging is configured for production (no DEBUG-level output)
- [ ] Health check endpoint exists (`/api/v1/health/`)
- [ ] Error monitoring is configured (Sentry or equivalent)
- [ ] Database backups are scheduled
- [ ] Rate limiting is enabled

---

## 9. Bonus Feature Suggestions

### Tier 1: High-Impact, Moderate Effort

| Feature | Description | Backend | Frontend |
|---|---|---|---|
| **JWT Authentication** | Token-based auth with `djangorestframework-simplejwt` | Login/register endpoints, token refresh, protected views | Auth context, login/register pages, token storage, Axios interceptors |
| **Pagination** | Cursor or page-number pagination | DRF `PageNumberPagination` (already in base design) | Pagination component with page numbers |
| **Search & Filtering** | Full-text search on title/content | `django-filter` + `SearchFilter` | Search bar component, filter dropdowns |

### Tier 2: Medium-Impact, Low-to-Moderate Effort

| Feature | Description |
|---|---|
| **Rich Text Editor** | Integrate a Markdown editor (e.g., `react-markdown` + `react-mde`) for content editing |
| **Image Uploads** | Featured image per post using Django's `ImageField` + cloud storage (S3) |
| **Tags/Categories** | ManyToMany relationship with a `Tag` model; filterable in list view |
| **Soft Delete** | `is_deleted` flag instead of hard delete; admin can restore posts |

### Tier 3: Advanced

| Feature | Description |
|---|---|
| **Role-Based Permissions** | Author, Editor, Admin roles with different capabilities |
| **Caching** | Redis caching for list endpoints; cache invalidation on write |
| **Rate Limiting** | DRF throttling: `AnonRateThrottle` (100/hour), `UserRateThrottle` (1000/hour) |
| **Audit Log** | Track all changes with user, timestamp, and diff |
| **Versioning** | API versioning via URL prefix (`/api/v1/`, `/api/v2/`) |

---

## 10. README Guidance

The project README (`README.md`) should contain these sections:

### Required Sections

1. **Project Title and Description** — One paragraph explaining what the project is.

2. **Tech Stack** — Bullet list of all technologies used with versions.

3. **Prerequisites** — What needs to be installed (Docker, Docker Compose, Node.js version, Python version).

4. **Getting Started** — Step-by-step instructions to clone, configure, and run the project:
   ```
   1. Clone the repository
   2. Copy .env.example to .env
   3. Run docker-compose up -d --build
   4. Run migrations
   5. Open http://localhost:3000
   ```

5. **API Documentation** — Link to `/api/v1/docs/` (DRF Spectacular/Swagger) or a summary table of endpoints.

6. **Running Tests** — Commands for backend and frontend tests.

7. **Project Structure** — Tree diagram showing folder organization with brief explanations.

8. **Environment Variables** — Table of all environment variables with descriptions (not values).

9. **Architecture Decisions** — Brief explanation of key architectural choices and why.

10. **Screenshots** — 2-4 screenshots showing the running application (list, detail, create, edit pages).

---

## 11. Coding Standards

### 11.1 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Python modules | `snake_case` | `post_service.py` |
| Python classes | `PascalCase` | `PostSerializer` |
| Python functions/variables | `snake_case` | `get_published_posts()` |
| Python constants | `UPPER_SNAKE_CASE` | `MAX_TITLE_LENGTH = 255` |
| JavaScript files | `PascalCase` for components, `camelCase` for utilities | `PostCard.jsx`, `formatDate.js` |
| JavaScript components | `PascalCase` | `PostListPage` |
| JavaScript functions/variables | `camelCase` | `handleSubmit`, `isLoading` |
| CSS classes | `kebab-case` | `post-card`, `form-error` |
| URL paths | `kebab-case` | `/api/v1/posts/` |
| Database tables | `snake_case` (Django default) | `posts_post` |
| Environment variables | `UPPER_SNAKE_CASE` | `DJANGO_SECRET_KEY` |

### 11.2 File Organization Rules

1. **One component per file.** No multi-component files.
2. **Colocate tests.** Backend: `tests/` directory inside each app. Frontend: `__tests__/` next to source files, or a top-level `tests/` directory.
3. **Group by feature, not by type.** The `posts` app contains models, views, serializers, services, and tests together — not a global `models/` directory.
4. **Index files for barrels.** Use `index.js` exports sparingly and only for `components/common/`.
5. **Max file length:** 300 lines. If a file exceeds this, it likely needs to be split.

### 11.3 Reusability Guidelines

- **DRY but not prematurely.** Extract a utility/component only when the same pattern appears 3+ times.
- **Props over configuration.** React components should accept props for customization, not read from global config.
- **Composition over inheritance.** Use component composition (children, render props) instead of class inheritance.
- **Service layer pattern.** All business logic lives in `services.py`, making it reusable across views, management commands, and Celery tasks.

### 11.4 Documentation Expectations

| Item | Required Documentation |
|---|---|
| **API Endpoints** | DRF Spectacular auto-generates OpenAPI docs; add `@extend_schema` decorators for descriptions |
| **Service functions** | Docstring with purpose, parameters, return type, and raised exceptions |
| **Complex algorithms** | Inline comments explaining the "why", not the "what" |
| **React components** | PropTypes or TypeScript interfaces; JSDoc for non-obvious props |
| **Environment variables** | Listed in `.env.example` with comments |
| **Non-obvious decisions** | Comment explaining why a particular approach was chosen |

**Do not document:**
- Obvious code (`# increment counter` above `counter += 1`).
- Getters/setters with no logic.
- Code that is already clear from naming.

---

## Appendix: Key Dependencies

### Backend (`requirements/base.txt`)

```
Django>=5.0,<5.1
djangorestframework>=3.15,<3.16
django-cors-headers>=4.3,<4.4
django-filter>=24.0,<25.0
drf-spectacular>=0.27,<0.28
psycopg2-binary>=2.9,<2.10
python-decouple>=3.8,<3.9
gunicorn>=22.0,<23.0
```

### Backend (`requirements/development.txt`)

```
-r base.txt
pytest>=8.0,<9.0
pytest-django>=4.8,<4.9
pytest-cov>=5.0,<6.0
factory-boy>=3.3,<3.4
flake8>=7.0,<8.0
black>=24.0,<25.0
isort>=5.13,<5.14
```

### Frontend (`package.json` key dependencies)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0"
  }
}
```

---

> **This document is the single source of truth for the Blog Post Manager project.** All implementation decisions should align with the patterns, conventions, and architecture described here. When in doubt, refer to the relevant section. When something is not covered, extend this document before implementing.

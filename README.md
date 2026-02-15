# Blog Post Manager

A production-quality full-stack blog management system built with Django REST Framework and React, featuring a portfolio-style card grid with thumbnail uploads, category filtering, and toast notifications.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Django + Django REST Framework | 5.0 / 3.15 |
| Frontend | React + React Router | 18.2 / 6.21 |
| Database | PostgreSQL | 16 |
| HTTP Client | Axios | 1.6 |
| Image Processing | Pillow | 10.2 |
| API Docs | drf-spectacular (OpenAPI 3) | 0.27 |
| Containerization | Docker + Docker Compose | Latest |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- Git

## Getting Started

```bash
# 1. Clone the repository
git clone <repository-url>
cd Finstrellis

# 2. Start all services
docker-compose up -d --build

# 3. Run database migrations
docker-compose exec backend python manage.py migrate

# 4. (Optional) Create a superuser for the admin panel
docker-compose exec backend python manage.py createsuperuser

# 5. Open the application
#    Frontend:  http://localhost:3000
#    API:       http://localhost:8000/api/v1/posts/
#    API Docs:  http://localhost:8000/api/v1/docs/
#    Admin:     http://localhost:8000/admin/
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/posts/` | List all posts (paginated) |
| `GET` | `/api/v1/posts/{id}/` | Get a single post |
| `POST` | `/api/v1/posts/` | Create a new post |
| `PUT` | `/api/v1/posts/{id}/` | Full update a post |
| `PATCH` | `/api/v1/posts/{id}/` | Partial update a post |
| `DELETE` | `/api/v1/posts/{id}/` | Delete a post |

**Query parameters for list endpoint:**

- `?search=keyword` — Search by title
- `?status=published` — Filter by status (draft/published)
- `?category=Technology` — Filter by category (case-insensitive)
- `?ordering=-created_at` — Sort results
- `?page=1&page_size=10` — Pagination

**Response fields include:**

- `id`, `title`, `slug`, `content`, `excerpt`, `status`, `category`
- `thumbnail_url` — Absolute URL to the uploaded thumbnail image (or `null`)
- `created_at`, `updated_at`, `published_at`

Interactive API documentation is available at `/api/v1/docs/` (Swagger UI).

## Thumbnail Handling

Posts support optional thumbnail images that are displayed in the card grid and as hero banners on the detail page.

### Upload

Thumbnails are uploaded via `multipart/form-data` when creating or updating a post:

```bash
curl -X POST http://localhost:8000/api/v1/posts/ \
  -F "title=My Post" \
  -F "content=This is enough content for the minimum validation." \
  -F "category=Technology" \
  -F "thumbnail=@/path/to/image.jpg"
```

### Validation Rules

| Rule | Constraint |
|---|---|
| Allowed types | `image/jpeg`, `image/png`, `image/webp` |
| Max file size | 5 MB |
| Required | No (optional field) |

Files that fail validation return a `400` response with a descriptive error message.

### Storage

- Thumbnails are stored under `backend/media/posts/thumbnails/<post-uuid>/` on disk.
- The Docker volume `media_data` persists uploads across container restarts.
- In development, Django serves media files at `/media/` directly.
- The API returns an absolute `thumbnail_url` field (e.g. `http://localhost:8000/media/posts/thumbnails/abc.../photo.jpg`) or `null` if no thumbnail is set.
- When a post is deleted, its thumbnail file is automatically cleaned up from disk.

### Frontend Upload

The post form includes a file picker with:
- Live image preview before submission
- A "Remove" button to clear a selected thumbnail
- Client-side validation for file type and size before upload

## Running Tests

```bash
# Backend tests (pytest)
docker-compose exec backend pytest

# Backend tests with coverage
docker-compose exec backend pytest --cov=apps

# Frontend tests
docker-compose exec frontend npm test
```

## Project Structure

```
.
├── backend/
│   ├── apps/posts/           # Blog posts Django app
│   │   ├── models.py         # Post model (UUID PK, category, thumbnail)
│   │   ├── serializers.py    # List + Detail serializers (thumbnail_url)
│   │   ├── services.py       # Business logic (slugs, excerpts, file cleanup)
│   │   ├── views.py          # API views (multipart upload support)
│   │   ├── filters.py        # Query filters (status, category, search)
│   │   ├── constants.py      # Validation constants
│   │   └── tests/            # Unit + integration tests (51 tests)
│   ├── common/               # Shared utilities
│   │   ├── models.py         # TimeStampedModel base class
│   │   ├── pagination.py     # Standard pagination
│   │   └── exceptions.py     # Custom error envelope
│   ├── config/               # Django project settings
│   │   ├── settings/
│   │   │   ├── base.py       # MEDIA_URL, upload limits
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py           # Media file serving in debug
│   └── media/                # Uploaded files (Docker volume)
├── frontend/
│   └── src/
│       ├── api/              # Axios client (FormData/multipart)
│       ├── components/
│       │   ├── common/       # Button, EmptyState, Toast, CardSkeleton
│       │   ├── layout/       # Header, Hero, Layout
│       │   └── posts/        # PostCard (thumbnail grid), PostForm (upload)
│       ├── hooks/            # usePosts, useToast
│       ├── pages/            # PostList (grid), Detail (hero), Create, Edit
│       ├── utils/            # Validation (thumbnail, category)
│       └── styles/           # CSS variables (design system) + globals
├── docker-compose.yml        # Development setup
├── docker-compose.prod.yml   # Production setup
└── claude.md                 # Architecture & development guide
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | dev key (change in prod) |
| `DJANGO_DEBUG` | Enable debug mode | `true` |
| `DB_NAME` | PostgreSQL database name | `blogdb` |
| `DB_USER` | PostgreSQL user | `bloguser` |
| `DB_PASSWORD` | PostgreSQL password | `blogpass` |
| `DB_HOST` | Database host | `db` |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

See `backend/.env.example` and `frontend/.env.example` for full lists.

## Architecture Decisions

- **Layered backend** — Views handle HTTP, serializers handle validation, services contain business logic, models define schema. This keeps each layer testable and replaceable.
- **UUID primary keys** — Prevents sequential ID enumeration and is globally unique across systems.
- **Separate list/detail serializers** — List responses exclude full content for performance; detail responses include everything.
- **Service layer pattern** — Business rules (slug generation, status transitions, auto-excerpts, file cleanup) live in `services.py`, not in views or serializers.
- **Custom error envelope** — All API errors follow `{ error: { code, message, details } }` for consistent frontend error handling.
- **Local state + hooks** — React's built-in state with custom hooks for data; React Context for cross-cutting concerns like toast notifications.
- **Multipart file uploads** — Thumbnails are uploaded as `multipart/form-data` via Django's `MultiPartParser`. The API returns absolute URLs using DRF's request context.
- **Portfolio-style UI** — Responsive CSS Grid (`auto-fill, minmax`) card layout with hover animations, skeleton loading states, and toast feedback for async operations.

## Development Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services (code changes with hot-reload)
docker-compose restart backend

# Rebuild (after dependency changes)
docker-compose build --no-cache backend
docker-compose up -d backend

# Full reset (destroy volumes)
docker-compose down -v
docker-compose up -d --build
```

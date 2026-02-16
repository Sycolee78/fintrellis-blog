# Blog Post Manager

A production-quality full-stack blog management system built with **Django REST Framework** and **React**, featuring JWT authentication, role-based access control (RBAC), a portfolio-style card grid with thumbnail uploads, category filtering, and toast notifications.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Django + Django REST Framework | 5.0 / 3.15 |
| Frontend | React + React Router | 18.2 / 6.21 |
| Database | PostgreSQL | 16 |
| Authentication | djangorestframework-simplejwt | 5.3 |
| Password Hashing | argon2-cffi (Argon2id) | 23.1 |
| HTTP Client | Axios | 1.6 |
| Image Processing | Pillow | 10.2 |
| API Docs | drf-spectacular (OpenAPI 3) | 0.27 |
| Containerization | Docker + Docker Compose | v2+ |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- Git
- Bash shell (Linux, macOS, or WSL on Windows)

## Quick Start

A single script handles everything — building containers, generating migrations, running migrations, seeding data, and starting the app:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Finstrellis

# 2. Run the startup script
chmod +x start.sh
./start.sh
```

The script will:
1. Stop and remove any existing containers and volumes (clean slate)
2. Build all Docker images from scratch
3. Start all services (database, backend, frontend)
4. Run database migrations and seed an admin user + sample author with 7 posts
5. Run the full test suite (85 tests)
6. Print access URLs and seeded account credentials

Once complete, open:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/api/v1/posts/ |
| Swagger Docs | http://localhost:8000/api/v1/docs/ |
| Django Admin | http://localhost:8000/admin/ |

### Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@blog.local` | `admin123!@#` |
| Author | `author@blog.local` | `author123!@#` |

You can also register new accounts via the frontend at http://localhost:3000/register (new accounts get the **Reader** role).

## Authentication

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register/` | Public | Create account, returns access token + sets refresh cookie |
| `POST` | `/api/v1/auth/login/` | Public | Login, returns access token + sets refresh cookie |
| `POST` | `/api/v1/auth/refresh/` | Cookie | Rotate refresh token, return new access token |
| `POST` | `/api/v1/auth/logout/` | Bearer | Blacklist refresh token, clear cookie |
| `GET` | `/api/v1/auth/me/` | Bearer | Get current user profile |

### Token Flow

```
  Browser                         Backend
    │                                │
    │  POST /auth/login/             │
    │  { email, password }           │
    ├───────────────────────────────>│
    │                                │  Validate credentials
    │  { user, access }              │  Generate JWT pair
    │  Set-Cookie: refresh_token     │
    │<───────────────────────────────┤
    │                                │
    │  GET /api/v1/posts/            │
    │  Authorization: Bearer <access>│
    ├───────────────────────────────>│
    │                                │  Verify JWT
    │  200 { results: [...] }        │
    │<───────────────────────────────┤
    │                                │
    │  (access token expires)        │
    │  GET /api/v1/posts/ → 401      │
    │                                │
    │  POST /auth/refresh/           │
    │  Cookie: refresh_token         │
    ├───────────────────────────────>│
    │                                │  Blacklist old refresh
    │  { access }                    │  Issue new pair
    │  Set-Cookie: refresh_token     │
    │<───────────────────────────────┤
    │                                │
    │  Retry original request        │
    │  with new access token         │
    ├───────────────────────────────>│
```

1. **Login/Register** returns `{ user, access }` in the body and sets a `refresh_token` HttpOnly cookie
2. The React frontend stores the access token in memory only (not localStorage) for XSS protection
3. Axios request interceptor attaches `Authorization: Bearer <token>` to every API call
4. On 401, the response interceptor calls `/auth/refresh/` (cookie sent automatically), gets a new access token, and retries the original request. Concurrent failed requests are queued and retried together.
5. If refresh also fails, the user is logged out and redirected to `/login`

### Roles & Permissions (RBAC)

| Role | List/Detail | Create | Edit Own | Edit Others | Delete Own | Delete Others |
|---|---|---|---|---|---|---|
| **Reader** | Yes | No | No | No | No | No |
| **Author** | Yes | Yes | Yes | No | Yes | No |
| **Admin** | Yes | Yes | Yes | Yes | Yes | Yes |

- New accounts are assigned the **Reader** role by default
- Unauthenticated users receive `401 Unauthorized` on all endpoints
- Unauthorized role actions receive `403 Forbidden`

### Security Features

| Feature | Detail |
|---|---|
| Password hashing | Argon2id (OWASP recommended) |
| Access token | 15 min lifetime, stored in memory only |
| Refresh token | 7 day lifetime, HttpOnly cookie, rotated on every use |
| Token blacklisting | Old refresh tokens are blacklisted immediately on rotation |
| Rate limiting | 5 auth requests/min, 3 registrations/hour |
| CORS | Credentials allowed, trusted origins configured |
| CSRF | Trusted origins whitelist |
| Headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| Django password validators | MinLength, CommonPassword, NumericOnly, UserAttributeSimilarity |

## API Endpoints

### Posts

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/posts/` | Bearer (any role) | List all posts (paginated) |
| `GET` | `/api/v1/posts/{id}/` | Bearer (any role) | Get a single post |
| `POST` | `/api/v1/posts/` | Author or Admin | Create a new post |
| `PUT` | `/api/v1/posts/{id}/` | Owner or Admin | Full update a post |
| `PATCH` | `/api/v1/posts/{id}/` | Owner or Admin | Partial update a post |
| `DELETE` | `/api/v1/posts/{id}/` | Owner or Admin | Delete a post |

### Query Parameters

| Parameter | Example | Description |
|---|---|---|
| `search` | `?search=django` | Search by title |
| `status` | `?status=published` | Filter by status (`draft` or `published`) |
| `category` | `?category=Technology` | Filter by category (case-insensitive) |
| `ordering` | `?ordering=-created_at` | Sort results |
| `page` | `?page=2&page_size=10` | Pagination |

### Response Fields

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Post identifier |
| `title` | string | Post title |
| `slug` | string | URL-safe slug (auto-generated) |
| `content` | string | Full post content (detail only) |
| `excerpt` | string | Auto-generated or custom excerpt |
| `status` | string | `draft` or `published` |
| `category` | string | Post category |
| `author` | UUID | Author's user ID |
| `author_email` | string | Author's email address |
| `thumbnail_url` | string/null | Absolute URL to thumbnail image |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last modification timestamp |
| `published_at` | datetime/null | Publication timestamp |

Interactive API documentation is available at `/api/v1/docs/` (Swagger UI) with JWT Bearer auth support.

## Thumbnail Handling

Posts support optional thumbnail images displayed in the card grid and as hero banners on the detail page.

### Upload

Thumbnails are uploaded via `multipart/form-data` when creating or updating a post:

```bash
# Requires a valid Bearer token (author or admin role)
curl -X POST http://localhost:8000/api/v1/posts/ \
  -H "Authorization: Bearer <access_token>" \
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

### Storage

- Stored under `backend/media/posts/thumbnails/<post-uuid>/` on disk
- Django serves media files at `/media/` in development
- The API returns an absolute `thumbnail_url` or `null`
- Thumbnails are cleaned up from disk when a post is deleted

### Frontend Upload

The post form includes a file picker with:
- Live image preview before submission
- A "Remove" button to clear a selected thumbnail
- Client-side validation for file type and size before upload

## Running Tests

```bash
# Run all 85 backend tests
docker-compose exec backend pytest

# Run with verbose output
docker-compose exec backend pytest -v

# Run with coverage report
docker-compose exec backend pytest --cov=apps

# Run only auth tests
docker-compose exec backend pytest apps/accounts/ -v

# Run only post tests
docker-compose exec backend pytest apps/posts/ -v
```

### Test Breakdown

| Test Suite | Count | Description |
|---|---|---|
| Auth Views | 14 | Register, login, refresh, logout, me endpoints |
| RBAC Permissions | 18 | Unauthenticated, reader, author, admin access rules |
| Post Models | 11 | Model fields, defaults, managers |
| Post Services | 12 | Create (slug, excerpt, author), update, delete |
| Post Views | 21 | CRUD operations with auth, pagination, filters |
| Post Serializers | 9 | Validation rules, thumbnail handling |
| **Total** | **85** | |

## Project Structure

```
Finstrellis/
├── start.sh                     # One-command project setup script
├── docker-compose.yml           # Development setup
├── docker-compose.prod.yml      # Production setup
├── README.md
│
├── backend/
│   ├── Dockerfile.dev           # Development image
│   ├── docker-entrypoint.sh     # Migrate + seed on startup
│   ├── manage.py
│   ├── pytest.ini               # Test configuration
│   ├── requirements/
│   │   ├── base.txt             # Core dependencies
│   │   ├── development.txt      # Dev tools (pytest, factory-boy)
│   │   └── production.txt       # Production deps (gunicorn)
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py          # JWT, RBAC, Argon2, security headers
│   │   │   ├── development.py   # Debug, permissive CORS, relaxed throttles
│   │   │   └── production.py    # Secure cookies, strict CORS
│   │   └── urls.py              # API routing (auth + posts + docs)
│   ├── apps/
│   │   ├── accounts/            # Authentication & authorization
│   │   │   ├── models.py        # Custom User (email login, UUID PK, roles)
│   │   │   ├── managers.py      # UserManager (create_user, create_superuser)
│   │   │   ├── serializers.py   # Register, Login, User serializers
│   │   │   ├── services.py      # AuthService (register, login, tokens, blacklist)
│   │   │   ├── views.py         # 5 auth views (JWT + HttpOnly cookies)
│   │   │   ├── permissions.py   # IsAdmin, IsAuthorRole, IsOwnerOrAdmin
│   │   │   ├── throttles.py     # AuthRateThrottle, RegisterRateThrottle
│   │   │   ├── urls.py          # /api/v1/auth/* routes
│   │   │   ├── admin.py         # Email-based UserAdmin
│   │   │   ├── management/commands/
│   │   │   │   ├── seed_admin.py        # Create initial admin user
│   │   │   │   └── seed_sample_data.py  # Create sample author + posts
│   │   │   └── tests/
│   │   │       ├── factories.py         # UserFactory
│   │   │       ├── conftest.py          # Auth fixtures
│   │   │       ├── test_auth_views.py   # Auth endpoint tests
│   │   │       └── test_rbac.py         # Permission tests
│   │   └── posts/               # Blog post management
│   │       ├── models.py        # Post (UUID PK, author FK, thumbnail, category)
│   │       ├── serializers.py   # List + Detail serializers (author, thumbnail_url)
│   │       ├── services.py      # Business logic (slugs, excerpts, file cleanup)
│   │       ├── views.py         # RBAC-protected CRUD API views
│   │       ├── filters.py       # Status, category, search filters
│   │       ├── constants.py     # Validation constants
│   │       ├── urls.py          # /api/v1/posts/* routes
│   │       ├── admin.py         # PostAdmin
│   │       └── tests/
│   │           ├── factories.py         # PostFactory (with author)
│   │           ├── conftest.py          # Authenticated client fixtures
│   │           ├── test_models.py       # Model tests
│   │           ├── test_services.py     # Service layer tests
│   │           ├── test_views.py        # API endpoint tests
│   │           └── test_serializers.py  # Validation tests
│   └── common/                  # Shared utilities
│       ├── models.py            # TimeStampedModel base class
│       ├── pagination.py        # StandardPagination
│       └── exceptions.py        # Uniform error envelope handler
│
└── frontend/
    ├── Dockerfile.dev           # Development image (CRA dev server)
    ├── package.json
    └── src/
        ├── App.js               # Routes + AuthProvider + ToastProvider
        ├── api/
        │   ├── client.js        # Axios instance (auth interceptors, refresh queue)
        │   ├── posts.js         # Post CRUD API functions
        │   └── auth.js          # Auth API functions (register, login, refresh, logout, me)
        ├── contexts/
        │   └── AuthContext.jsx  # AuthProvider (token management, auto-refresh)
        ├── components/
        │   ├── auth/
        │   │   └── ProtectedRoute.jsx  # Role-based route guard
        │   ├── common/
        │   │   ├── Button.jsx          # Reusable button (variants)
        │   │   ├── Alert.jsx           # Error/success alerts
        │   │   ├── ConfirmDialog.jsx   # Confirmation modal
        │   │   ├── EmptyState.jsx      # Empty list placeholder
        │   │   ├── LoadingSpinner.jsx  # Spinner component
        │   │   └── CardSkeleton.jsx    # Loading skeleton
        │   ├── layout/
        │   │   ├── Header.jsx          # Auth-aware nav (user info, role badge)
        │   │   ├── Hero.jsx            # Landing hero section
        │   │   └── Layout.jsx          # Page wrapper
        │   └── posts/
        │       ├── PostCard.jsx        # Grid card (thumbnail, category, excerpt)
        │       ├── PostForm.jsx        # Create/edit form (thumbnail upload)
        │       └── PostStatusBadge.jsx # Draft/published badge
        ├── hooks/
        │   ├── usePost.js       # Single post fetching
        │   ├── usePosts.js      # Post list with filters
        │   ├── usePostMutation.js # Create/update/delete operations
        │   └── useToast.js      # Toast notification system
        ├── pages/
        │   ├── LoginPage.jsx    # Email + password login form
        │   ├── RegisterPage.jsx # Registration form (name, email, password)
        │   ├── PostListPage.jsx # Card grid with filters + search
        │   ├── PostDetailPage.jsx # Hero thumbnail + content + edit/delete
        │   ├── PostCreatePage.jsx # New post form
        │   └── PostEditPage.jsx   # Edit post form
        ├── utils/
        │   ├── formatDate.js    # Date formatting utilities
        │   └── validation.js    # Form validation helpers
        └── styles/
            └── globals.css      # CSS variables (design tokens) + base styles
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Django settings module | `config.settings.development` |
| `DJANGO_SECRET_KEY` | Django secret key | Dev key (change in prod!) |
| `DJANGO_DEBUG` | Enable debug mode | `true` |
| `DB_NAME` | PostgreSQL database name | `blogdb` |
| `DB_USER` | PostgreSQL user | `bloguser` |
| `DB_PASSWORD` | PostgreSQL password | `blogpass` |
| `DB_HOST` | Database host | `db` |
| `DB_PORT` | Database port | `5432` |
| `CORS_ALLOW_CREDENTIALS` | Allow cookies in CORS requests | `true` |
| `CSRF_TRUSTED_ORIGINS` | Trusted origins for CSRF protection | `http://localhost:3000` |
| `ADMIN_EMAIL` | Seeded admin account email | `admin@blog.local` |
| `ADMIN_PASSWORD` | Seeded admin account password | `admin123!@#` |
| `REACT_APP_API_URL` | Backend API base URL for frontend | `http://localhost:8000/api/v1` |

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Layered backend** | Views handle HTTP, serializers validate, services contain business logic, models define schema. Each layer is independently testable. |
| **UUID primary keys** | Prevents sequential ID enumeration; globally unique across systems. |
| **Custom User model** | Email as `USERNAME_FIELD` (no username field), UUID PK, role field. Must be set before first migration. |
| **JWT + HttpOnly cookies** | Access tokens in memory (XSS-safe); refresh tokens in HttpOnly cookies (not accessible to JS). Token blacklisting on every rotation prevents replay attacks. |
| **Explicit object permissions** | Views use `APIView` (not `GenericAPIView`), so `check_object_permissions()` is called explicitly for owner-or-admin checks. |
| **Service layer pattern** | Business rules (slug generation, status transitions, auto-excerpts, file cleanup) live in `services.py`, not in views or serializers. |
| **Separate list/detail serializers** | List responses exclude `content` for performance; detail responses include everything. |
| **Custom error envelope** | All errors follow `{ error: { code, message, details } }` for consistent frontend handling. |
| **Multipart file uploads** | Thumbnails uploaded as `multipart/form-data`. API returns absolute URLs. Files auto-cleaned on post deletion. |
| **Portfolio-style UI** | Responsive CSS Grid (`auto-fill, minmax`) with hover animations, skeleton loading, and toast feedback. |
| **React Context for auth** | `AuthProvider` wraps the app. Access token in `useRef` (not state) to avoid stale closures in Axios interceptors. |

## Development Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services (code changes — hot-reload is enabled)
docker-compose restart backend

# Rebuild a single service (after dependency changes)
docker-compose build --no-cache backend
docker-compose up -d backend

# Run Django management commands
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Full reset (destroy database + rebuild everything)
docker-compose down -v
./start.sh

# Stop all services
docker-compose down
```

## License

This project was designed and implemented for Fintrellis technical assignment. 
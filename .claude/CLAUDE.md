# Booker Driver Application - Production-Ready AI Agent Workflow

**System Name:** Booker Driver Application
**Organization:** ACRN Health / Booker Systems
**Environment:** Docker Containerized (Development & Production)
**Architecture:** Django REST API + Next.js Frontend + PostgreSQL + Redis + Celery

---

## 🎯 CRITICAL: Agent-Based Workflow for ALL Changes

**This project uses a multi-tier agent workflow for production-ready code changes.**

### Workflow Phases

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: PLANNING (Model: Opus/Sonnet - High Intelligence)    │
├─────────────────────────────────────────────────────────────────┤
│  Agent: architect-review OR Plan Agent                          │
│  Purpose: Impact analysis, architectural decisions, planning     │
│  Output: Step-by-step implementation plan                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: EXECUTION (Model: Haiku/Sonnet - Cost-Efficient)     │
├─────────────────────────────────────────────────────────────────┤
│  Agent: Specialized agents per task type (see Agent Map below)  │
│  Purpose: Implement changes following the plan                  │
│  Output: Code changes, configuration updates                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: DOCKER LIFECYCLE CHECK                                │
├─────────────────────────────────────────────────────────────────┤
│  Check: Did changes affect dependencies or Docker config?       │
│  If YES → Rebuild containers                                    │
│  If NO  → Restart containers or hot-reload sufficient           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: TESTING (Model: Haiku/Sonnet)                        │
├─────────────────────────────────────────────────────────────────┤
│  Agent: test-automator OR debugging-toolkit:debugger            │
│  Purpose: Validate changes, run tests, verify functionality     │
│  Output: Test results, pass/fail status                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: GIT WORKFLOW (Only after testing passes)             │
├─────────────────────────────────────────────────────────────────┤
│  1. Create meaningful commit message                            │
│  2. Commit changes                                              │
│  3. Create PR if needed (for feature branches)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Assignment Map

### Backend Work (Django/Python)

| Task Type | Primary Agent | Model | Plugin Source |
|-----------|---------------|-------|---------------|
| Django API development | `python-development:django-pro` | Haiku | python-development |
| Django ORM queries | `python-development:django-pro` | Haiku | python-development |
| Python code optimization | `python-development:python-pro` | Haiku | python-development |
| Async Python (Celery) | `python-development:async-python-patterns` | Haiku | python-development |
| Database migrations | `database-migrations:database-migration` | Haiku | database-migrations |
| Database schema design | `database-design:database-architect` | Sonnet | database-design |
| API endpoint design | `backend-development:backend-architect` | Sonnet | backend-development |
| Security audits | `security-scanning:security-auditor` | Sonnet | security-scanning |

### Frontend Work (Next.js/React/TypeScript)

| Task Type | Primary Agent | Model | Plugin Source |
|-----------|---------------|-------|---------------|
| React components | `frontend-mobile-development:frontend-developer` | Haiku | frontend-mobile-development |
| TypeScript types | `javascript-typescript:typescript-pro` | Haiku | javascript-typescript |
| Modern JavaScript | `javascript-typescript:javascript-pro` | Haiku | javascript-typescript |
| Next.js routing | `javascript-typescript:nextjs-app-router-patterns` | Haiku | javascript-typescript |
| State management | `javascript-typescript:react-state-management` | Haiku | javascript-typescript |
| UI/UX design | `frontend-mobile-development:ui-ux-designer` | Sonnet | frontend-mobile-development |

### Infrastructure & DevOps (Docker/CI-CD)

| Task Type | Primary Agent | Model | Plugin Source |
|-----------|---------------|-------|---------------|
| Docker configuration | `deployment-strategies:deployment-engineer` | Haiku | deployment-strategies |
| Kubernetes/orchestration | `kubernetes-operations:kubernetes-architect` | Sonnet | kubernetes-operations |
| CI/CD pipelines | `cicd-automation:gitlab-ci-patterns` OR `github-actions-templates` | Haiku | cicd-automation |
| Deployment strategies | `deployment-strategies:deployment-pipeline-design` | Sonnet | deployment-strategies |
| Performance monitoring | `observability-monitoring:performance-engineer` | Haiku | observability-monitoring |

### Testing & Quality Assurance

| Task Type | Primary Agent | Model | Plugin Source |
|-----------|---------------|-------|---------------|
| Test automation | `tdd-workflows:test-automator` | Haiku | tdd-workflows |
| TDD implementation | `tdd-workflows:tdd-orchestrator` | Sonnet | tdd-workflows |
| E2E testing | `api-testing-observability:e2e-testing-patterns` | Haiku | api-testing-observability |
| Debugging | `debugging-toolkit:debugger` | Haiku | debugging-toolkit |
| Error diagnostics | `error-diagnostics:error-detective` | Haiku | error-diagnostics |

### Code Review & Architecture

| Task Type | Primary Agent | Model | Plugin Source |
|-----------|---------------|-------|---------------|
| Code review | `code-review-ai:code-reviewer` | Sonnet | code-review-ai |
| Architecture review | `code-review-ai:architect-review` | Opus | code-review-ai |
| Performance review | `application-performance:performance-engineer` | Sonnet | application-performance |
| Security review | `security-scanning:security-auditor` | Opus | security-scanning |

---

## 🐳 Docker Lifecycle Management

### When to Rebuild vs Restart

#### ⚠️ MUST REBUILD CONTAINERS when:

1. **Dependencies Changed**
   - `package.json` modified (npm packages added/removed/updated)
   - `requirements.txt` modified (Python packages added/removed/updated)
   - `Dockerfile` or `Dockerfile.dev` modified
   - `.dockerignore` modified

2. **Docker Configuration Changed**
   - `docker-compose.yml` modified
   - `docker-compose.dev.yml` modified
   - Environment variable structure changed in compose files
   - New services added to compose files

3. **Build-time Assets Changed**
   - Static files requiring build process
   - CSS/SCSS requiring compilation
   - Any build configuration changes

#### ✅ RESTART SUFFICIENT when:

1. **Code Changes Only**
   - Python code (`.py` files) - hot reload via volume mount
   - React/Next.js code (`.tsx`, `.ts`, `.jsx`, `.js`) - hot reload via volume mount
   - Environment variable VALUES changed (not structure)

2. **Configuration Updates**
   - `.env` file values changed (not new variables)
   - Database migrations (run via exec, no rebuild needed)

### Docker Commands Reference

```bash
# Development Mode

# Full rebuild (when dependencies change)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build --no-cache frontend
docker-compose -f docker-compose.dev.yml up -d frontend

# Restart (code changes only)
docker-compose -f docker-compose.dev.yml restart

# View logs
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f web

# Execute commands in running containers
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
docker-compose -f docker-compose.dev.yml exec web python manage.py shell
docker-compose -f docker-compose.dev.yml exec frontend npm install <package>

# Production Mode (from /booker directory)
cd booker
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
```

---

## 📋 Standard Operating Procedure for Code Changes

### SOP Template: Modify Feature/Fix Bug

```markdown
## STEP 1: PLANNING PHASE (Use Plan Agent or architect-review)

**Objective:** Understand impact and create implementation plan

**Model:** Opus or Sonnet (higher intelligence)

**Questions to Answer:**
1. What components are affected?
2. What are the architectural implications?
3. What dependencies need to change?
4. What tests are needed?
5. Will Docker containers need rebuilding?

**Output:** Markdown plan with:
- Files to modify
- Dependencies to add/update
- Migration scripts needed
- Testing strategy
- Docker rebuild decision (YES/NO)

## STEP 2: EXECUTION PHASE (Use specialized agents)

**Model:** Haiku or Sonnet (cost-efficient)

**Agent Selection:**
- Backend changes → python-development:django-pro
- Frontend changes → frontend-mobile-development:frontend-developer
- Database schema → database-design:database-architect
- Infrastructure → deployment-strategies:deployment-engineer

**Actions:**
1. Implement code changes per plan
2. Update tests
3. Update documentation (if public API changed)

## STEP 3: DOCKER LIFECYCLE CHECK

**Decision Tree:**

Did you change?
- package.json → YES, rebuild frontend container
- requirements.txt → YES, rebuild web container
- Dockerfile* → YES, rebuild affected container
- docker-compose*.yml → YES, rebuild all containers
- Only .py or .tsx files → NO, restart sufficient

**Execute appropriate Docker commands** (see Docker Commands Reference)

## STEP 4: TESTING PHASE (Use test-automator or debugger)

**Model:** Haiku or Sonnet

**Agent:** tdd-workflows:test-automator OR debugging-toolkit:debugger

**Actions:**
1. Run unit tests
2. Run integration tests
3. Manual verification in running containers
4. Check logs for errors

**Pass Criteria:**
- All tests pass ✅
- No errors in logs ✅
- Feature works as expected ✅

## STEP 5: GIT WORKFLOW (Only if testing passed)

**Actions:**
1. Stage changes: `git add <files>`
2. Commit with meaningful message:
   ```
   <type>: <short description>

   - Detailed change 1
   - Detailed change 2

   Tested: <describe testing done>
   Docker: <rebuilt/restarted>
   ```
3. Push to branch
4. Create PR if on feature branch

**Commit Types:** feat, fix, refactor, test, docs, chore, perf
```

---

## 🏗️ Project Structure & Key Files

### Backend (Django)

```
booker/
├── apps/                    # Django apps
│   ├── authentication/      # Auth & Azure AD integration
│   ├── bookings/           # Trip management
│   ├── drivers/            # Driver management
│   ├── fuel/               # Fuel requests
│   ├── trackers/           # GPS device management
│   └── tracking/           # Real-time tracking (Django Channels)
├── booker/                 # Project settings
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── asgi.py            # WebSocket support
│   └── urls.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── Dockerfile             # Production build
├── Dockerfile.dev         # Development build
└── docker-compose.yml     # Production config
```

### Frontend (Next.js)

```
booker-app/
├── src/
│   ├── app/               # Next.js 14 App Router
│   │   ├── (auth)/       # Authentication pages
│   │   └── (dashboard)/  # Protected dashboard routes
│   ├── components/        # React components
│   │   ├── layout/
│   │   ├── shared/
│   │   └── tracking/     # Real-time GPS map
│   ├── lib/
│   │   ├── api/          # API clients
│   │   │   └── django/   # Django REST API client
│   │   ├── hooks/        # React hooks
│   │   ├── types/        # TypeScript types
│   │   └── websocket/    # WebSocket client
│   └── styles/
├── package.json
├── next.config.js
├── Dockerfile             # Production build
├── Dockerfile.dev         # Development build
└── .env.local            # Environment variables
```

### Docker Orchestration

```
/
├── docker-compose.dev.yml    # Development setup (hot reload)
└── booker/
    ├── docker-compose.yml    # Production setup (nginx, gunicorn)
    └── nginx/               # Nginx reverse proxy config
```

---

## 🔐 Environment Variables & Secrets

### Backend (.env.dev or .env)

```bash
# Database
DATABASE_URL=postgres://booker_dev:dev_password_123@db:5432/booker_dev

# Redis & Celery
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1

# Django
DJANGO_SETTINGS_MODULE=booker.settings.development
DEBUG=True
SECRET_KEY=your-secret-key-here

# Navixy API Integration
NAVIXY_API_BASE_URL=https://api.navixy.com/v2
NAVIXY_USERNAME=your-username
NAVIXY_PASSWORD=your-password

# Azure AD (Optional)
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
```

### Frontend (.env.local or .env.docker)

```bash
# API Configuration
NEXT_PUBLIC_API_MODE=django
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api  # Dev
# NEXT_PUBLIC_DJANGO_API_URL=/api                     # Production (via nginx)

NEXT_PUBLIC_NAVIXY_API_URL=https://api.navixy.com/v2

# Map Configuration
NEXT_PUBLIC_DEFAULT_LAT=-17.8292
NEXT_PUBLIC_DEFAULT_LNG=31.0522
NEXT_PUBLIC_DEFAULT_ZOOM=12

# Polling Intervals
NEXT_PUBLIC_TRACKING_POLL_INTERVAL=30000
NEXT_PUBLIC_TASK_POLL_INTERVAL=60000
```

---

## 🧪 Testing Requirements

### Backend Tests (pytest)

```bash
# Run all tests
docker-compose -f docker-compose.dev.yml exec web pytest

# Run specific test file
docker-compose -f docker-compose.dev.yml exec web pytest apps/bookings/tests/test_views.py

# Run with coverage
docker-compose -f docker-compose.dev.yml exec web pytest --cov=apps
```

**Agent for Testing:** `tdd-workflows:test-automator`

### Frontend Tests (Jest/React Testing Library)

```bash
# Run all tests
docker-compose -f docker-compose.dev.yml exec frontend npm test

# Run specific test
docker-compose -f docker-compose.dev.yml exec frontend npm test -- FleetMap.test.tsx

# Run with coverage
docker-compose -f docker-compose.dev.yml exec frontend npm test -- --coverage
```

**Agent for Testing:** `unit-testing:javascript-testing-patterns`

---

## 🚀 Deployment Checklist

### Before Deploying to Production

1. ✅ **All tests pass** (backend + frontend)
2. ✅ **Code review completed** (using `code-review-ai:code-reviewer`)
3. ✅ **Security audit passed** (using `security-scanning:security-auditor`)
4. ✅ **Performance review done** (using `application-performance:performance-engineer`)
5. ✅ **Database migrations tested** in staging
6. ✅ **Environment variables configured** for production
7. ✅ **Docker images built** and tested
8. ✅ **Rollback plan documented**
9. ✅ **Monitoring alerts configured**
10. ✅ **Team notified** of deployment

---

## 🎓 Agent Usage Examples

### Example 1: Add New API Endpoint

```bash
# Step 1: Planning
Use agent: code-review-ai:architect-review
Model: Opus
Prompt: "I need to add a new API endpoint GET /api/bookings/statistics
that returns booking counts by status. Analyze impact and create implementation plan."

# Step 2: Execution (Backend)
Use agent: python-development:django-pro
Model: Haiku
Prompt: "Implement the /api/bookings/statistics endpoint following the plan.
Use Django REST Framework ViewSet and DRF-spectacular for documentation."

# Step 3: Execution (Frontend)
Use agent: frontend-mobile-development:frontend-developer
Model: Haiku
Prompt: "Create a React component that fetches and displays booking statistics
from the new endpoint using React Query."

# Step 4: Docker Check
No dependency changes → Restart containers only
Command: docker-compose -f docker-compose.dev.yml restart

# Step 5: Testing
Use agent: tdd-workflows:test-automator
Model: Haiku
Prompt: "Create unit tests for the booking statistics endpoint and component."

# Step 6: Git
git add apps/bookings/views.py apps/bookings/tests/test_statistics.py
git add booker-app/src/components/BookingStatistics.tsx
git commit -m "feat: add booking statistics endpoint and dashboard widget

- Add GET /api/bookings/statistics endpoint
- Create BookingStatistics React component
- Add unit tests for endpoint and component

Tested: All tests pass, verified in dev environment
Docker: Restarted containers (no rebuild needed)"
```

### Example 2: Upgrade npm Package

```bash
# Step 1: Planning
Use agent: dependency-management:dependency-upgrade
Model: Sonnet
Prompt: "Analyze impact of upgrading react-leaflet from 4.2.1 to 5.0.0.
Check breaking changes and migration requirements."

# Step 2: Execution
Use agent: frontend-mobile-development:frontend-developer
Model: Haiku
Prompt: "Upgrade react-leaflet to 5.0.0 and fix any breaking changes in FleetMap component."

# Step 3: Docker Check
⚠️ package.json changed → MUST REBUILD
Commands:
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache frontend
docker-compose -f docker-compose.dev.yml up -d

# Step 4: Testing
Use agent: debugging-toolkit:debugger
Model: Haiku
Prompt: "Test the tracking page map functionality after react-leaflet upgrade.
Verify marker clustering and GPS updates work correctly."

# Step 5: Git
git add booker-app/package.json booker-app/package-lock.json
git add booker-app/src/components/tracking/FleetMap.tsx
git commit -m "chore: upgrade react-leaflet from 4.2.1 to 5.0.0

- Updated react-leaflet to v5.0.0
- Fixed breaking changes in FleetMap component
- Verified marker clustering still works

Tested: Manual testing of tracking page, all map features functional
Docker: Rebuilt frontend container"
```

### Example 3: Database Migration

```bash
# Step 1: Planning
Use agent: database-design:database-architect
Model: Sonnet
Prompt: "I need to add an 'estimated_cost' field to the bookings table.
Analyze impact on existing queries and plan migration strategy."

# Step 2: Execution
Use agent: database-migrations:database-migration
Model: Haiku
Prompt: "Create Django migration to add estimated_cost DecimalField to Booking model.
Include data migration to populate existing records."

# Step 3: Docker Check
No dependency changes → Run migration in container
Commands:
docker-compose -f docker-compose.dev.yml exec web python manage.py makemigrations
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate

# Step 4: Testing
Use agent: tdd-workflows:test-automator
Model: Haiku
Prompt: "Test the new estimated_cost field - verify it's saved correctly
and serialized in API responses."

# Step 5: Git
git add apps/bookings/models.py
git add apps/bookings/migrations/0024_booking_estimated_cost.py
git add apps/bookings/serializers.py
git commit -m "feat: add estimated cost field to bookings

- Add estimated_cost DecimalField to Booking model
- Update BookingSerializer to include estimated_cost
- Add tests for cost calculation

Tested: Migration runs successfully, API returns cost field
Docker: Ran migration in container (no rebuild needed)"
```

---

## 🔍 Debugging & Troubleshooting

### Common Issues

#### Issue: Frontend Not Updating After Code Changes

**Agent:** `debugging-toolkit:debugger`

**Diagnosis Steps:**
1. Check if hot reload is working: `docker logs booker_frontend_dev`
2. Verify volume mount: `docker inspect booker_frontend_dev`
3. Clear Next.js cache: `docker exec booker_frontend_dev rm -rf .next`

#### Issue: Database Connection Errors

**Agent:** `error-diagnostics:error-detective`

**Diagnosis Steps:**
1. Check PostgreSQL health: `docker-compose ps`
2. View database logs: `docker logs booker_db_dev`
3. Verify connection string in `.env.dev`
4. Test connection: `docker exec booker_web_dev python manage.py dbshell`

#### Issue: WebSocket Not Connecting

**Agent:** `distributed-debugging:devops-troubleshooter`

**Diagnosis Steps:**
1. Check Django Channels is running: `docker logs booker_web_dev | grep channels`
2. Verify Redis is healthy: `docker exec booker_redis_dev redis-cli ping`
3. Check ASGI configuration in `booker/asgi.py`
4. Test WebSocket endpoint: Browser DevTools → Network → WS

---

## 📊 Monitoring & Observability

**Agent for Setup:** `observability-monitoring:observability-engineer`

### Key Metrics to Monitor

1. **API Performance**
   - Response times (p50, p95, p99)
   - Error rates by endpoint
   - Request throughput

2. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Slow query log

3. **WebSocket Health**
   - Active connections
   - Message throughput
   - Reconnection rate

4. **Celery Workers**
   - Queue length
   - Task success/failure rate
   - Worker resource usage

---

## 🔒 Security Best Practices

**Agent for Security Audits:** `security-scanning:security-auditor`

### Before Each Release

1. ✅ Run SAST scan: `security-scanning:sast-configuration`
2. ✅ Check for dependency vulnerabilities: `npm audit` / `pip-audit`
3. ✅ Review authentication flows
4. ✅ Verify RBAC permissions
5. ✅ Test input validation
6. ✅ Check for SQL injection vectors
7. ✅ Verify HTTPS/TLS configuration
8. ✅ Review API rate limiting
9. ✅ Check CORS configuration
10. ✅ Audit logging enabled

---

## 📚 Additional Resources

- [Docker Setup Guide](../DOCKER_SETUP_GUIDE.md)
- [Django Channels Setup](../DJANGO_CHANNELS_SETUP.md)
- [WebSocket API Reference](../WEBSOCKET_API_REFERENCE.md)
- [Architecture Summary](../ARCHITECTURE_SUMMARY.txt)
- [Security Assessment](../SECURITY_ASSESSMENT_REALTIME_TRACKING.md)

---

## 💡 Pro Tips for Working with Agents

1. **Always start with planning** - Use architect-review or Plan agent before coding
2. **Use specific agents** - Don't use general-purpose when specialized agents exist
3. **Follow the Docker lifecycle** - Rebuild when needed, restart when sufficient
4. **Test before committing** - Use test-automator to validate changes
5. **Write meaningful commits** - Include what, why, testing status, and Docker impact
6. **Chain agents together** - Plan → Execute → Test → Review → Commit
7. **Use cost-efficient models for execution** - Save Opus for planning and reviews
8. **Monitor agent performance** - If Haiku struggles, escalate to Sonnet
9. **Leverage specialized skills** - Many plugins have skills for specific patterns
10. **Document as you go** - Update this file when workflows change

---

**Last Updated:** 2026-01-03
**Maintained By:** Development Team
**Review Frequency:** After major architectural changes

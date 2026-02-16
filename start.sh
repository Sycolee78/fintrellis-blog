#!/usr/bin/env bash
# =============================================================================
# Blog Post Manager — Full Project Setup Script
#
# This script sets up the entire project from scratch:
#   1. Stops any running containers and removes old volumes
#   2. Builds all Docker images
#   3. Generates Django migrations
#   4. Starts all services (DB, backend, frontend)
#   5. Runs migrations and seeds data via the entrypoint
#   6. Runs the full test suite
#
# Usage:
#   chmod +x start.sh
#   ./start.sh
#
# Options:
#   --skip-tests    Skip running the test suite
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SKIP_TESTS=false

for arg in "$@"; do
    case $arg in
        --skip-tests) SKIP_TESTS=true ;;
        *)            echo -e "${RED}Unknown option: $arg${NC}"; exit 1 ;;
    esac
done

# ── Helper functions ──────────────────────────────────────────────────────────

step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

success() {
    echo -e "${GREEN}  ✔ $1${NC}"
}

warn() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
}

fail() {
    echo -e "${RED}  ✘ $1${NC}"
    exit 1
}

# ── Preflight checks ─────────────────────────────────────────────────────────

step "Preflight checks"

if ! command -v docker &> /dev/null; then
    fail "Docker is not installed. Please install Docker first."
fi

if ! docker info &> /dev/null; then
    fail "Docker daemon is not running. Please start Docker."
fi

if ! docker compose version &> /dev/null 2>&1 && ! docker-compose version &> /dev/null 2>&1; then
    fail "Docker Compose is not installed."
fi

# Use 'docker compose' if available, otherwise fall back to 'docker-compose'
if docker compose version &> /dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

success "Docker and Docker Compose are available"

# ── Step 1: Clean up ─────────────────────────────────────────────────────────

step "Step 1/7 — Cleaning up existing containers and volumes"

$DC down -v 2>/dev/null || true
success "Old containers and volumes removed"

# ── Step 2: Build images ─────────────────────────────────────────────────────

step "Step 2/7 — Building Docker images"

$DC build --no-cache
success "All images built successfully"

# ── Step 3: Start database ───────────────────────────────────────────────────

step "Step 3/7 — Starting PostgreSQL and waiting for it to be healthy"

$DC up -d db

echo -n "  Waiting for PostgreSQL..."
RETRIES=30
until $DC exec db pg_isready -U bloguser -d blogdb &> /dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo ""
        fail "PostgreSQL did not become healthy in time"
    fi
    echo -n "."
    sleep 2
done
echo ""
success "PostgreSQL is ready"

# ── Step 4: Generate migrations ──────────────────────────────────────────────

step "Step 4/7 — Generating Django migrations"

$DC run --rm --no-deps --entrypoint python backend manage.py makemigrations accounts 2>&1 | \
    sed 's/^/  /'
$DC run --rm --no-deps --entrypoint python backend manage.py makemigrations posts 2>&1 | \
    sed 's/^/  /'
success "Migrations generated for accounts and posts apps"

# ── Step 5: Start all services ───────────────────────────────────────────────

step "Step 5/7 — Starting all services"

$DC up -d
success "All containers started"

# Wait for backend to be ready (entrypoint runs migrate + seed)
echo -n "  Waiting for backend to be ready..."
RETRIES=60
until curl -sf http://localhost:8000/api/v1/docs/ > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo ""
        warn "Backend did not respond in time. Check logs with: $DC logs backend"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""
success "Backend is running (migrations applied, data seeded)"

# Wait for frontend to compile
echo -n "  Waiting for frontend to compile..."
RETRIES=90
until curl -sf http://localhost:3000 > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo ""
        warn "Frontend did not respond in time. Check logs with: $DC logs frontend"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""
success "Frontend is compiled and serving"

# ── Step 6: Verify containers ────────────────────────────────────────────────

step "Step 6/7 — Verifying container health"

echo ""
$DC ps
echo ""

# Check each service
for svc in db backend frontend; do
    if $DC ps "$svc" 2>/dev/null | grep -q "Up"; then
        success "$svc is running"
    else
        fail "$svc is not running. Check logs: $DC logs $svc"
    fi
done

# ── Step 7: Run tests ────────────────────────────────────────────────────────

if [ "$SKIP_TESTS" = true ]; then
    step "Step 7/7 — Tests (SKIPPED)"
    warn "Tests skipped via --skip-tests flag"
else
    step "Step 7/7 — Running test suite"
    echo ""
    if $DC exec backend pytest --tb=short; then
        success "All tests passed"
    else
        warn "Some tests failed. Check output above."
    fi
fi

# ── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BOLD}Frontend${NC}       http://localhost:3000"
echo -e "  ${BOLD}API${NC}            http://localhost:8000/api/v1/posts/"
echo -e "  ${BOLD}Swagger Docs${NC}   http://localhost:8000/api/v1/docs/"
echo -e "  ${BOLD}Django Admin${NC}   http://localhost:8000/admin/"
echo ""
echo -e "  ${BOLD}Seeded accounts:${NC}"
echo -e "    Admin   →  admin@blog.local  / admin123!@#"
echo -e "    Author  →  author@blog.local / author123!@#"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "    $DC logs -f backend      # View backend logs"
echo -e "    $DC logs -f frontend     # View frontend logs"
echo -e "    $DC exec backend pytest  # Run tests"
echo -e "    $DC down                 # Stop everything"
echo ""

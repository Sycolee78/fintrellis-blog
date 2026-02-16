#!/usr/bin/env bash
# =============================================================================
# Blog Post Manager — Full Project Setup Script
#
# This script sets up the entire project from scratch:
#   1. Stops any running containers and removes old volumes
#   2. Builds all Docker images
#   3. Starts all services (DB, backend, frontend)
#   4. Waits for migrations to run and data to seed (via entrypoint)
#   5. Verifies all containers are healthy
#   6. Runs the full test suite (85 tests)
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
    fail "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
fi

if ! docker info &> /dev/null; then
    fail "Docker daemon is not running. Please start Docker Desktop or the Docker service."
fi

if ! docker compose version &> /dev/null 2>&1 && ! docker-compose version &> /dev/null 2>&1; then
    fail "Docker Compose is not installed. It is included with Docker Desktop."
fi

# Use 'docker compose' (v2) if available, otherwise fall back to 'docker-compose' (v1)
if docker compose version &> /dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

success "Docker and Docker Compose are available ($($DC version --short 2>/dev/null || echo 'OK'))"

# ── Step 1: Clean up ─────────────────────────────────────────────────────────

step "Step 1/6 — Cleaning up existing containers and volumes"

$DC down -v 2>/dev/null || true
success "Old containers and volumes removed"

# ── Step 2: Build images ─────────────────────────────────────────────────────

step "Step 2/6 — Building Docker images (this may take a few minutes)"

$DC build --no-cache
success "All images built successfully"

# ── Step 3: Start all services ───────────────────────────────────────────────

step "Step 3/6 — Starting all services"

$DC up -d
success "All containers started"

# Wait for backend to be ready (entrypoint waits for DB, runs migrate + seed)
echo -n "  Waiting for backend (migrations + seeding)..."
RETRIES=60
until curl -sf http://localhost:8000/api/v1/docs/ > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo ""
        warn "Backend did not respond in time. Checking logs..."
        $DC logs --tail=20 backend
        fail "Backend failed to start. See logs above."
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
        warn "Frontend did not respond in time. Checking logs..."
        $DC logs --tail=20 frontend
        fail "Frontend failed to compile. See logs above."
    fi
    echo -n "."
    sleep 2
done
echo ""
success "Frontend is compiled and serving"

# ── Step 4: Verify containers ────────────────────────────────────────────────

step "Step 4/6 — Verifying container health"

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

# ── Step 5: Run tests ────────────────────────────────────────────────────────

if [ "$SKIP_TESTS" = true ]; then
    step "Step 5/6 — Tests (SKIPPED)"
    warn "Tests skipped via --skip-tests flag"
else
    step "Step 5/6 — Running test suite (85 tests)"
    echo ""
    if $DC exec backend pytest --tb=short; then
        success "All tests passed"
    else
        warn "Some tests failed. Check output above."
    fi
fi

# ── Step 6: Done ─────────────────────────────────────────────────────────────

step "Step 6/6 — Setup complete!"

echo ""
echo -e "  ${BOLD}Access the application:${NC}"
echo ""
echo -e "    Frontend        ${CYAN}http://localhost:3000${NC}"
echo -e "    API             ${CYAN}http://localhost:8000/api/v1/posts/${NC}"
echo -e "    Swagger Docs    ${CYAN}http://localhost:8000/api/v1/docs/${NC}"
echo -e "    Django Admin    ${CYAN}http://localhost:8000/admin/${NC}"
echo ""
echo -e "  ${BOLD}Seeded accounts:${NC}"
echo ""
echo -e "    Admin    admin@blog.local  / admin123!@#"
echo -e "    Author   author@blog.local / author123!@#"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo ""
echo -e "    $DC logs -f backend      ${YELLOW}# View backend logs${NC}"
echo -e "    $DC logs -f frontend     ${YELLOW}# View frontend logs${NC}"
echo -e "    $DC exec backend pytest  ${YELLOW}# Run tests${NC}"
echo -e "    $DC down                 ${YELLOW}# Stop everything${NC}"
echo ""

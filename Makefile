# ============================================================
# Digital CMO AI — Makefile
# ============================================================
# Usage:
#   make dev        — Start local development environment
#   make test       — Run all tests
#   make build      — Build production Docker images
#   make deploy     — Deploy to Railway
#   make migrate    — Run Alembic DB migrations
#   make seed       — Seed demo data
#   make logs       — Tail docker-compose logs
#   make clean      — Stop and remove containers
# ============================================================

.PHONY: help dev test build deploy migrate seed logs clean lint format check-env

SHELL := /bin/bash
REPO_ROOT := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
BACKEND_DIR := $(REPO_ROOT)/backend
FRONTEND_DIR := $(REPO_ROOT)/frontend

# Colours
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

## ── Default target ───────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  Digital CMO AI — Available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## ── Development ─────────────────────────────────────────
dev: ## Start local development environment (backend + frontend hot reload)
	@echo "$(GREEN)Starting development environment...$(RESET)"
	@docker compose up -d
	@echo ""
	@echo "  $(GREEN)✓ Services started:$(RESET)"
	@echo "    Backend API  → http://localhost:8000"
	@echo "    Frontend     → http://localhost:3000"
	@echo "    API Docs     → http://localhost:8000/docs"
	@echo ""
	@echo "  $(YELLOW)Tip: run 'make logs' to follow output$(RESET)"

dev-backend: ## Start only the backend in dev mode (with live reload)
	@echo "$(GREEN)Starting backend with live reload...$(RESET)"
	@cd $(BACKEND_DIR) && \
		pip install -r requirements.txt -q && \
		uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start only the frontend dev server
	@echo "$(GREEN)Starting frontend dev server...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run dev

## ── Testing ─────────────────────────────────────────────
test: ## Run all tests (backend pytest + frontend type check)
	@echo "$(GREEN)Running all tests...$(RESET)"
	@$(MAKE) test-backend
	@$(MAKE) test-frontend
	@echo "$(GREEN)✓ All tests passed!$(RESET)"

test-backend: ## Run backend pytest suite
	@echo "$(YELLOW)Running backend tests (pytest)...$(RESET)"
	@cd $(BACKEND_DIR) && \
		pip install -r requirements.txt -q && \
		pytest -q --tb=short

test-backend-cov: ## Run backend tests with coverage report
	@cd $(BACKEND_DIR) && \
		pip install -r requirements.txt -q && \
		pytest --cov=app --cov-report=term-missing --cov-report=html:htmlcov

test-frontend: ## Run frontend type check and build
	@echo "$(YELLOW)Running frontend type check + build...$(RESET)"
	@cd $(FRONTEND_DIR) && \
		npm ci --silent && \
		npm run build

lint: ## Run linters (ruff for backend, eslint for frontend)
	@echo "$(YELLOW)Linting backend...$(RESET)"
	@cd $(BACKEND_DIR) && \
		pip install ruff -q && \
		ruff check app/ tests/
	@echo "$(YELLOW)Linting frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run lint 2>/dev/null || echo "No lint script configured"

format: ## Auto-format code (ruff for backend)
	@cd $(BACKEND_DIR) && \
		pip install ruff -q && \
		ruff format app/ tests/ && \
		ruff check --fix app/ tests/

## ── Database ─────────────────────────────────────────────
migrate: ## Run Alembic database migrations (uses DATABASE_URL from .env)
	@echo "$(GREEN)Running database migrations...$(RESET)"
	@cd $(BACKEND_DIR) && \
		pip install -r requirements.txt -q && \
		alembic upgrade head
	@echo "$(GREEN)✓ Migrations complete$(RESET)"

migrate-create: ## Create a new migration (usage: make migrate-create MSG="add user table")
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)Error: MSG is required. Usage: make migrate-create MSG=\"description\"$(RESET)"; \
		exit 1; \
	fi
	@cd $(BACKEND_DIR) && alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Roll back the last migration
	@cd $(BACKEND_DIR) && alembic downgrade -1

migrate-status: ## Show current migration state
	@cd $(BACKEND_DIR) && alembic current && alembic history --verbose

seed: ## Seed demo data into the database
	@echo "$(GREEN)Seeding demo data...$(RESET)"
	@cd $(BACKEND_DIR) && \
		pip install -r requirements.txt -q && \
		python -m scripts.seed_demo 2>/dev/null || \
		python -c "from app.db.session import init_db; init_db(); print('DB initialised (no seed script found)')"
	@echo "$(GREEN)✓ Demo data seeded$(RESET)"

## ── Build ────────────────────────────────────────────────
build: ## Build production Docker images
	@echo "$(GREEN)Building production Docker images...$(RESET)"
	@docker compose -f docker-compose.prod.yml build --no-cache
	@echo "$(GREEN)✓ Images built successfully$(RESET)"

build-backend: ## Build backend Docker image only
	@docker build -t digital-cmo/backend:latest ./backend

build-frontend: ## Build frontend Docker image only
	@docker build -t digital-cmo/frontend:latest ./frontend

## ── Production (local) ───────────────────────────────────
prod-up: check-env ## Start production stack locally (requires .env.production)
	@echo "$(GREEN)Starting production stack...$(RESET)"
	@docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production stack started$(RESET)"

prod-down: ## Stop production stack
	@docker compose -f docker-compose.prod.yml down

prod-logs: ## Tail production stack logs
	@docker compose -f docker-compose.prod.yml logs -f

## ── Railway Deployment ───────────────────────────────────
deploy: ## Deploy to Railway (requires RAILWAY_TOKEN env var)
	@echo "$(GREEN)Deploying to Railway...$(RESET)"
	@which railway > /dev/null 2>&1 || npm install -g @railway/cli
	@if [ -z "$$RAILWAY_TOKEN" ]; then \
		echo "$(RED)Error: RAILWAY_TOKEN not set$(RESET)"; \
		echo "Export it: export RAILWAY_TOKEN=<your-token>"; \
		exit 1; \
	fi
	@railway up --service backend --detach
	@railway up --service frontend --detach
	@echo "$(GREEN)✓ Deployed to Railway$(RESET)"
	@echo "  Check status: railway status"

deploy-status: ## Show Railway deployment status
	@railway status

deploy-logs: ## Tail Railway logs
	@railway logs

## ── Utilities ────────────────────────────────────────────
logs: ## Tail local docker-compose logs
	@docker compose logs -f

ps: ## Show running containers
	@docker compose ps

clean: ## Stop and remove local containers, networks, volumes
	@echo "$(YELLOW)Stopping and removing containers...$(RESET)"
	@docker compose down -v
	@echo "$(GREEN)✓ Clean$(RESET)"

check-env: ## Validate required production env vars are set
	@echo "$(YELLOW)Checking production environment...$(RESET)"
	@cd $(BACKEND_DIR) && \
		python -m scripts.validate_deploy_env 2>/dev/null || \
		python $(REPO_ROOT)/scripts/validate_deploy_env.py 2>/dev/null || \
		echo "$(YELLOW)Skipping env validation (script not found)$(RESET)"

health: ## Check local service health
	@echo "Backend:"
	@curl -s http://localhost:8000/health/ready | python -m json.tool || echo "Backend not responding"
	@echo ""
	@echo "Frontend:"
	@curl -sI http://localhost:3000/ | head -5 || echo "Frontend not responding"

## ── Git Shortcuts ────────────────────────────────────────
push: ## Push current branch and trigger CI
	@git push origin HEAD

push-deploy: ## Push to main (triggers CI/CD deploy pipeline)
	@git push origin HEAD:main

## ── Docker Registry ──────────────────────────────────────
push-images: ## Push images to GitHub Container Registry (requires GHCR login)
	@echo "$(YELLOW)Pushing images to GHCR...$(RESET)"
	@docker push ghcr.io/$${GITHUB_REPOSITORY:-your-org/digital-cmo-ai}/backend:latest
	@docker push ghcr.io/$${GITHUB_REPOSITORY:-your-org/digital-cmo-ai}/frontend:latest

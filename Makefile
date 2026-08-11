# ==============================================================================
# Matcha Monorepo Makefile
# ==============================================================================

# Derive a fixed, sanitized project name so Compose resources (and prune filters) stay consistent
PROJECT_NAME := $(shell basename $(CURDIR) | tr -d '\n' | tr 'A-Z' 'a-z' | tr -c 'a-z0-9_-' '-')

COMPOSE_DEV  := docker compose -p $(PROJECT_NAME) -f docker-compose.yml
COMPOSE_PROD := docker compose -p $(PROJECT_NAME)-prod -f docker-compose.prod.yml
COMPOSE      ?= $(COMPOSE_DEV)

GREEN    := \033[0;32m
RED      := \033[0;31m
NO_COLOR := \033[0m

RUN_PY   := set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; PYTHONPATH=apps/backend .venv/bin/python
VENV_PIP := .venv/bin/pip
VENV_RUFF := .venv/bin/ruff

# ==============================================================================
# Argument extraction for add-py and add-js
# Usage: make add-py <pkg1> [pkg2...]
#        make add-js <pkg1> [pkg2...]
# MUST remain at the top before target definitions to avoid recipe override warnings
# ==============================================================================
CMD_GOAL := $(firstword $(MAKECMDGOALS))
ifneq ($(filter $(CMD_GOAL),add-py add-js),)
  ARG_LIST := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(ARG_LIST):;@:)
  PKG := $(ARG_LIST)
endif

# ==============================================================================
# Default Target (Must remain the first target in the file)
# ==============================================================================
all: dev

help:
	@printf "$(GREEN)Workflows:$(NO_COLOR)\n"
	@printf "  dev            Start dev environment (types -> format -> lint -> up -> ping)\n"
	@printf "  prod           Start production environment\n"
	@printf "  down           Stop containers (preserves volumes)\n"
	@printf "  status / logs  Check container status or follow logs\n"
	@printf "  ping           Ping frontend and backend endpoints\n"
	@printf "\n"
	@printf "$(GREEN)Package Management:$(NO_COLOR)\n"
	@printf "  add-py <pkg>   Install python package(s) & update requirements.txt\n"
	@printf "  add-js <pkg>   Install frontend npm package(s)\n"
	@printf "\n"
	@printf "$(GREEN)Tooling:$(NO_COLOR)\n"
	@printf "  types          Generate TS types from FastAPI backend\n"
	@printf "  lint           Check frontend and backend code\n"
	@printf "  format         Auto-fix frontend and backend code\n"
	@printf "  build          Build backend compiled files & frontend bundle\n"
	@printf "  ci             Simulate full CI pipeline in Docker locally\n"
	@printf "\n"
	@printf "$(GREEN)Cleanup:$(NO_COLOR)\n"
	@printf "  clean          Remove build cache and temporary files\n"
	@printf "  fclean         Deep clean (volumes, node_modules, .venv, images)\n"
	@printf "  prune          fclean + Docker image prune for this project\n"

# ==============================================================================
# 1. Setup & Verification
# ==============================================================================

check-env:
	@test -f .env || ([ -f .env.example ] && (printf "$(GREEN)Initializing .env from .env.example...$(NO_COLOR)\n"; cp .env.example .env) || (printf "$(RED)Error: Neither .env nor .env.example exists.$(NO_COLOR)\n"; exit 1))

check-docker:
	@command -v docker > /dev/null 2>&1 || (printf "$(RED)Error: Docker CLI is not installed.$(NO_COLOR)\n"; exit 1)
	@docker info > /dev/null 2>&1 || (printf "$(RED)Error: Docker daemon is not running.$(NO_COLOR)\n"; exit 1)
	@docker compose version > /dev/null 2>&1 || (printf "$(RED)Error: Docker Compose (v2 plugin) is not available.$(NO_COLOR)\n"; exit 1)

check: check-env check-docker

apps/frontend/node_modules: apps/frontend/package.json $(wildcard apps/frontend/package-lock.json)
	@printf "$(GREEN)Installing frontend dependencies (npm ci)...$(NO_COLOR)\n"
	@npm --prefix apps/frontend ci --quiet --legacy-peer-deps
	@touch apps/frontend/node_modules

.venv: apps/backend/requirements.txt
	@printf "$(GREEN)Creating/Updating local Python virtual environment...$(NO_COLOR)\n"
	@python3 -m venv .venv || python -m venv .venv
	@$(VENV_PIP) install --quiet -r apps/backend/requirements.txt
	@touch .venv

install-local: check-env apps/frontend/node_modules .venv

# ==============================================================================
# 2. Package Management Workflow
# ==============================================================================

add-py: .venv
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-py <package1> [package2...]$(NO_COLOR)\n"; exit 1; fi
	@printf "$(GREEN)Installing $(PKG) into venv...$(NO_COLOR)\n"
	@$(VENV_PIP) install $(PKG)
	@$(VENV_PIP) freeze > apps/backend/requirements.txt
	@touch .venv
	@printf "$(GREEN)Done! Package(s) installed and updated requirements.txt$(NO_COLOR)\n"

add-js: apps/frontend/node_modules
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-js <package1> [package2...]$(NO_COLOR)\n"; exit 1; fi
	@printf "$(GREEN)Installing $(PKG) into frontend...$(NO_COLOR)\n"
	@npm --prefix apps/frontend install $(PKG)
	@printf "$(GREEN)Done! package.json updated.$(NO_COLOR)\n"

# ==============================================================================
# 3. Code Quality & Types
# ==============================================================================

types: install-local
	@printf "$(GREEN)Generating OpenAPI schema directly from local venv...$(NO_COLOR)\n"
	@mkdir -p apps/frontend/src/types
	@$(RUN_PY) -c "from app.main import app; import json; open('apps/frontend/openapi.json.tmp', 'w').write(json.dumps(app.openapi()))" && mv apps/frontend/openapi.json.tmp apps/frontend/openapi.json
	@printf "$(GREEN)Compiling TypeScript interfaces...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run build:types; EXIT_CODE=$$?; rm -f apps/frontend/openapi.json apps/frontend/openapi.json.tmp; exit $$EXIT_CODE
	@printf "$(GREEN)Shared types updated successfully!$(NO_COLOR)\n"

lint: lint-backend lint-frontend

lint-backend: install-local
	@printf "$(GREEN)Linting and checking format for backend...$(NO_COLOR)\n"
	@$(VENV_RUFF) check apps/backend
	@$(VENV_RUFF) format --check apps/backend

lint-frontend: install-local
	@printf "$(GREEN)Linting frontend...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run lint

format: format-backend format-frontend

format-backend: install-local
	@printf "$(GREEN)Formatting and auto-fixing backend code with Ruff...$(NO_COLOR)\n"
	@$(VENV_RUFF) check --fix apps/backend
	@$(VENV_RUFF) format apps/backend

format-frontend: install-local
	@printf "$(GREEN)Auto-fixing frontend code with ESLint...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run lint -- --fix

build: build-backend build-frontend

build-backend: install-local
	@printf "$(GREEN)Compiling backend Python code...$(NO_COLOR)\n"
	@$(RUN_PY) -m compileall apps/backend/app

build-frontend: install-local
	@printf "$(GREEN)Building frontend dist bundle...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run build

# ==============================================================================
# 4. Workflows & Execution (Docker)
# ==============================================================================

dev: COMPOSE := $(COMPOSE_DEV)
dev: types format lint up

prod: COMPOSE := $(COMPOSE_PROD)
prod: check up

up: check
	@printf "$(GREEN)Starting services using $(COMPOSE)...$(NO_COLOR)\n"
	@$(COMPOSE) up -d --remove-orphans --build --wait
	@set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; \
	F_PORT=$${FRONTEND_PORT:-5173}; \
	B_PORT=$${BACKEND_PORT:-8000}; \
	printf "$(GREEN)Services started successfully!$(NO_COLOR)\n"; \
	printf "$(GREEN)  Frontend: http://localhost:$$F_PORT$(NO_COLOR)\n"; \
	printf "$(GREEN)  Backend:  http://localhost:$$B_PORT (API Docs: http://localhost:$$B_PORT/docs)$(NO_COLOR)\n"
	@$(MAKE) ping

down:
	@printf "$(GREEN)Stopping all containers (preserving volumes)...$(NO_COLOR)\n"
	@$(COMPOSE_DEV) down --remove-orphans 2>/dev/null || true
	@$(COMPOSE_PROD) down --remove-orphans 2>/dev/null || true
	@printf "$(GREEN)Containers stopped successfully.$(NO_COLOR)\n"

status:
	@$(COMPOSE) ps

logs:
	@$(COMPOSE) logs -f

ping: check-env
	@set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; \
	F_PORT=$${FRONTEND_PORT:-5173}; \
	B_PORT=$${BACKEND_PORT:-8000}; \
	printf "$(GREEN)Pinging frontend (http://localhost:$$F_PORT)...$(NO_COLOR)\n"; \
	curl -sf "http://localhost:$$F_PORT" >/dev/null && printf "$(GREEN)Frontend is UP!$(NO_COLOR)\n" || (printf "$(RED)Frontend is DOWN!$(NO_COLOR)\n"; exit 1); \
	printf "$(GREEN)Pinging backend (http://localhost:$$B_PORT/)...$(NO_COLOR)\n"; \
	curl -sf "http://localhost:$$B_PORT/" >/dev/null && printf "$(GREEN)Backend is UP!$(NO_COLOR)\n" || (printf "$(RED)Backend is DOWN!$(NO_COLOR)\n"; exit 1)

dev-status: COMPOSE := $(COMPOSE_DEV)
dev-status: status

dev-logs: COMPOSE := $(COMPOSE_DEV)
dev-logs: logs

prod-status: COMPOSE := $(COMPOSE_PROD)
prod-status: status

prod-logs: COMPOSE := $(COMPOSE_PROD)
prod-logs: logs

ci: check
	@trap '$(COMPOSE_DEV) down -v >/dev/null 2>&1' EXIT; \
	printf "$(GREEN)Step 1: Starting services$(NO_COLOR)\n" && \
	$(COMPOSE_DEV) up -d --remove-orphans --build --wait && \
	printf "$(GREEN)Step 2: Pinging services$(NO_COLOR)\n" && \
	$(MAKE) ping && \
	printf "$(GREEN)Step 3: Generating types inside container$(NO_COLOR)\n" && \
	$(COMPOSE_DEV) exec -T backend python -c "from app.main import app; import json, sys; sys.stdout.write(json.dumps(app.openapi()))" > apps/frontend/openapi.json.tmp && \
	mv apps/frontend/openapi.json.tmp apps/frontend/openapi.json && \
	( $(COMPOSE_DEV) exec -T frontend npm run build:types; EXIT_CODE=$$?; rm -f apps/frontend/openapi.json apps/frontend/openapi.json.tmp; exit $$EXIT_CODE ) && \
	printf "$(GREEN)Step 4: Linting & formatting$(NO_COLOR)\n" && \
	$(COMPOSE_DEV) exec -T backend ruff check . && \
	$(COMPOSE_DEV) exec -T backend ruff format --check . && \
	$(COMPOSE_DEV) exec -T frontend npm run lint && \
	printf "$(GREEN)Step 5: Building$(NO_COLOR)\n" && \
	$(COMPOSE_DEV) exec -T backend python -m compileall app && \
	$(COMPOSE_DEV) exec -T frontend npm run build && \
	printf "$(GREEN)--- CI Simulation Passed ---$(NO_COLOR)\n"

# ==============================================================================
# 5. Cleanup
# ==============================================================================

clean:
	@printf "$(GREEN)Cleaning build artifacts...$(NO_COLOR)\n"
	@rm -rf apps/frontend/dist .ruff_cache apps/frontend/openapi.json apps/frontend/openapi.json.tmp
	@find apps/backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@find apps/backend -name "*.pyc" -delete 2>/dev/null || true
	@printf "$(GREEN)Cleanup complete.$(NO_COLOR)\n"

fclean: clean
	@printf "$(GREEN)Deep cleaning: removing node_modules, .venv, volumes, and built images...$(NO_COLOR)\n"
	@rm -rf apps/frontend/node_modules .venv
	@$(COMPOSE_DEV) down -v --rmi all --remove-orphans 2>/dev/null || true
	@$(COMPOSE_PROD) down -v --rmi all --remove-orphans 2>/dev/null || true
	@printf "$(GREEN)Deep clean complete.$(NO_COLOR)\n"

re: fclean dev

prune: fclean
	@printf "$(GREEN)Pruning dangling images for this project only...$(NO_COLOR)\n"
	@docker image prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)"
	@docker image prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)-prod"
	@printf "$(GREEN)Done.$(NO_COLOR)\n"

.PHONY: all help check check-env check-docker install-local add-py add-js types lint lint-backend lint-frontend format format-backend format-frontend build build-backend build-frontend dev prod up down status logs ping dev-status dev-logs prod-status prod-logs ci clean fclean re prune
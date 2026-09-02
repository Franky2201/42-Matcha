# ==============================================================================
# Matcha Monorepo Makefile
# ==============================================================================

# Derive a fixed, sanitized project name so Compose resources (and prune filters) stay consistent
PROJECT_NAME := $(shell basename $(CURDIR) | tr -d '\n' | tr 'A-Z' 'a-z' | tr -c 'a-z0-9_-' '-')

COMPOSE_DEV  := docker compose -p $(PROJECT_NAME) -f docker-compose.yml
COMPOSE_PROD := docker compose -p $(PROJECT_NAME)-prod -f docker-compose.prod.yml
COMPOSE      ?= $(COMPOSE_DEV)

GREEN      := \033[0;32m
RED        := \033[0;31m
NO_COLOR   := \033[0m

# Terminal hyperlink helpers (OSC 8 specification)
LINK_START := \033]8;;
LINK_MID   := \033\\
LINK_CLOSE := \033]8;;\033\\

RUN_PY    := set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; PYTHONPATH=apps/backend .venv/bin/python
VENV_PIP  := .venv/bin/pip
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
	@printf "  dev            Start dev environment (format -> lint -> up -> ping)\n"
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
	@printf "  types          Generate TS types from GraphQL backend schema\n"
	@printf "  lint           Check frontend and backend code\n"
	@printf "  format         Auto-fix frontend and backend code\n"
	@printf "  build          Build backend compiled files & frontend bundle\n"
	@printf "  ci             Simulate full CI pipeline in Docker locally\n"


	@printf "\n"
	@printf "$(GREEN)Cleanup:$(NO_COLOR)\n"
	@printf "  clean          Remove build cache and temporary files\n"
	@printf "  fclean         Deep clean (volumes, node_modules, .venv, images)\n"
	@printf "  prune          fclean + Docker image & volume prune for this project\n"

# ==============================================================================
# 1. Setup & Verification
# ==============================================================================

check-env:
	@test -f .env || ([ -f .env.example ] && cp .env.example .env || (printf "$(RED)Error: Neither .env nor .env.example exists.$(NO_COLOR)\n"; exit 1))

check-docker:
	@command -v docker > /dev/null 2>&1 || (printf "$(RED)Error: Docker CLI is not installed.$(NO_COLOR)\n"; exit 1)
	@docker info > /dev/null 2>&1 || (printf "$(RED)Error: Docker daemon is not running.$(NO_COLOR)\n"; exit 1)
	@docker compose version > /dev/null 2>&1 || (printf "$(RED)Error: Docker Compose (v2 plugin) is not available.$(NO_COLOR)\n"; exit 1)

check: check-env check-docker

apps/frontend/node_modules: apps/frontend/package.json $(wildcard apps/frontend/package-lock.json)
	@npm --prefix apps/frontend ci --quiet --legacy-peer-deps
	@touch apps/frontend/node_modules

.venv: apps/backend/requirements.txt
	@python3 -m venv .venv || python -m venv .venv
	@$(VENV_PIP) install --quiet -r apps/backend/requirements.txt
	@touch .venv

install-local: check-env apps/frontend/node_modules .venv

# ==============================================================================
# 2. Package Management Workflow
# ==============================================================================

add-py: .venv
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-py <package1> [package2...]$(NO_COLOR)\n"; exit 1; fi
	@$(VENV_PIP) install $(PKG)
	@$(VENV_PIP) freeze > apps/backend/requirements.txt
	@touch .venv

add-js: apps/frontend/node_modules
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-js <package1> [package2...]$(NO_COLOR)\n"; exit 1; fi
	@npm --prefix apps/frontend install $(PKG)

# ==============================================================================
# 3. Code Quality & Types
# ==============================================================================

types: install-local
	@mkdir -p apps/frontend/src/types
	@$(RUN_PY) -c "from app.main import schema; print(schema.as_str())" > apps/frontend/schema.graphql
	@npm --prefix apps/frontend run build:types; EXIT_CODE=$$?; rm -f apps/frontend/schema.graphql; exit $$EXIT_CODE

lint: lint-backend lint-frontend

lint-backend: install-local
	@$(VENV_RUFF) check apps/backend
	@$(VENV_RUFF) format --check apps/backend

lint-frontend: install-local
	@npm --prefix apps/frontend run lint

format: format-backend format-frontend

format-backend: install-local
	@$(VENV_RUFF) check --fix apps/backend
	@$(VENV_RUFF) format apps/backend

format-frontend: install-local
	@npm --prefix apps/frontend run lint -- --fix

build: build-backend build-frontend

build-backend: install-local
	@$(RUN_PY) -m compileall apps/backend/app

apps/frontend/dist: apps/frontend/node_modules apps/frontend/package.json
	@npm --prefix apps/frontend run build

build-frontend: apps/frontend/dist

# ==============================================================================
# 4. Workflows & Execution (Docker)
# ==============================================================================

dev: COMPOSE := $(COMPOSE_DEV)
dev: types format lint up

prod: COMPOSE := $(COMPOSE_PROD)
prod: check up

up: check
	@$(COMPOSE) up -d --remove-orphans --build --wait
	@set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; \
	F_PORT=$${FRONTEND_PORT:-5173}; \
	B_PORT=$${BACKEND_PORT:-8000}; \
	printf "$(GREEN)Services started successfully!$(NO_COLOR)\n"; \
	printf "$(GREEN)  Frontend: $(LINK_START)http://localhost:$$F_PORT$(LINK_MID)http://localhost:$$F_PORT$(LINK_CLOSE) $(NO_COLOR)\n"; \
	printf "$(GREEN)  Backend:  $(LINK_START)http://localhost:$$B_PORT$(LINK_MID)http://localhost:$$B_PORT$(LINK_CLOSE) (GraphQL IDE: $(LINK_START)http://localhost:$$B_PORT/graphql$(LINK_MID)http://localhost:$$B_PORT/graphql$(LINK_CLOSE) )$(NO_COLOR)\n"

	@$(MAKE) ping

down:
	@$(COMPOSE_DEV) down --remove-orphans 2>/dev/null || true
	@$(COMPOSE_PROD) down --remove-orphans 2>/dev/null || true

status:
	@$(COMPOSE) ps

logs:
	@$(COMPOSE) logs -f

ping: check-env
	@set -a; [ -f .env ] && . ./.env 2>/dev/null; set +a; \
	F_PORT=$${FRONTEND_PORT:-5173}; \
	B_PORT=$${BACKEND_PORT:-8000}; \
	MAX_RETRIES=10; \
	COUNT=1; \
	while ! curl -sf "http://localhost:$$F_PORT" >/dev/null 2>&1; do \
		if [ $$COUNT -ge $$MAX_RETRIES ]; then \
			printf "$(RED)Frontend is DOWN!$(NO_COLOR)\n"; \
			exit 1; \
		fi; \
		printf "Waiting for frontend... (%s/%s)\n" "$$COUNT" "$$MAX_RETRIES"; \
		sleep 1; \
		COUNT=$$((COUNT + 1)); \
	done; \
	printf "$(GREEN)Frontend is UP!$(NO_COLOR)\n"; \
	COUNT=1; \
	while ! curl -sf "http://localhost:$$B_PORT/" >/dev/null 2>&1; do \
		if [ $$COUNT -ge $$MAX_RETRIES ]; then \
			printf "$(RED)Backend is DOWN!$(NO_COLOR)\n"; \
			exit 1; \
		fi; \
		printf "Waiting for backend... (%s/%s)\n" "$$COUNT" "$$MAX_RETRIES"; \
		sleep 1; \
		COUNT=$$((COUNT + 1)); \
	done; \
	printf "$(GREEN)Backend is UP!$(NO_COLOR)\n"

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
	$(COMPOSE_DEV) exec -T backend python -c "from app.main import schema; print(schema.as_str())" > apps/frontend/schema.graphql && \
	( $(COMPOSE_DEV) exec -T frontend npm run build:types; EXIT_CODE=$$?; rm -f apps/frontend/schema.graphql; exit $$EXIT_CODE ) && \
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
	@rm -rf apps/frontend/dist .ruff_cache .build-backend .format-stamp .lint-stamp .up-stamp .dev-stamp apps/frontend/schema.graphql
	@find apps/backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@find apps/backend -name "*.pyc" -delete 2>/dev/null || true

fclean: clean
	@$(COMPOSE_DEV) down -v --rmi all --remove-orphans 2>/dev/null || true
	@$(COMPOSE_PROD) down -v --rmi all --remove-orphans 2>/dev/null || true
	@rm -rf apps/frontend/node_modules .venv

re: fclean dev

prune: fclean
	@docker image prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)" >/dev/null 2>&1 || true
	@docker image prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)-prod" >/dev/null 2>&1 || true
	@docker volume prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)" >/dev/null 2>&1 || true
	@docker volume prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)-prod" >/dev/null 2>&1 || true
	@printf "$(GREEN)Project scoped resources pruned$(NO_COLOR)\n"

.PHONY: all help check check-env check-docker install-local add-py add-js types lint lint-backend lint-frontend format format-backend format-frontend build build-backend build-frontend dev prod up down status logs ping dev-status dev-logs prod-status prod-logs ci clean fclean re prune



# Makefile for Matcha Monorepo

ENV_FILE         := .env
COMPOSE_DEV      := docker compose -f docker-compose.yml
COMPOSE_PROD     := docker compose -f docker-compose.prod.yml

# Default Compose Command
COMPOSE          := $(COMPOSE_DEV)

GREEN    := \033[0;32m
RED      := \033[0;31m
NO_COLOR := \033[0m

all: dev

help:
	@printf "$(GREEN)Available targets:$(NO_COLOR)\n"
	@printf "  dev            Start the project in development mode (checks -> install -> types -> lint -> up)\n"
	@printf "  prod           Start the project in production mode (checks -> types -> lint -> up)\n"
	@printf "  status         Check status of containers\n"
	@printf "  logs           Follow container logs\n"
	@printf "  down           Stop and remove containers (both dev and prod)\n"
	@printf "\n"
	@printf "  types          Generate TypeScript interfaces from FastAPI models\n"
	@printf "  lint           Lint frontend (ESLint) and backend (Ruff) projects (with Docker fallback)\n"
	@printf "  install-local  Setup host-side dev dependencies (node_modules, virtualenv)\n"
	@printf "\n"
	@printf "  ci             Simulate the CI pipeline inside Docker containers (build -> types -> lint -> test -> build)\n"
	@printf "  check          Run verification checks for environment & Docker daemon\n"
	@printf "  up             Start services (detached)\n"
	@printf "\n"
	@printf "  clean          Remove temporary build artifacts\n"
	@printf "  fclean         Deep clean removing node_modules, images, and volumes\n"
	@printf "  re             Full deep clean and restart dev environment\n"
	@printf "  sprune         Deep clean and docker system prune\n"
	@printf "  help           Display this help screen\n"

# 1. Setup & Verification
check:
	@printf "$(GREEN)Running system checks...$(NO_COLOR)\n"
	@command -v docker > /dev/null 2>&1 || (printf "$(RED)Error: Docker CLI is not installed.$(NO_COLOR)\n"; exit 1)
	@test -f $(ENV_FILE) || (printf "$(GREEN)Initializing .env from .env.example...$(NO_COLOR)\n"; cp .env.example $(ENV_FILE))
	@printf "$(GREEN)System checks passed successfully!$(NO_COLOR)\n"

apps/frontend/node_modules: apps/frontend/package.json apps/frontend/package-lock.json
	@printf "$(GREEN)Installing frontend dependencies strictly (npm ci)...$(NO_COLOR)\n"
	@npm --prefix apps/frontend ci --quiet --legacy-peer-deps
	@touch apps/frontend/node_modules

.venv: apps/backend/requirements.txt
	@printf "$(GREEN)Creating/Updating local Python virtual environment...$(NO_COLOR)\n"
	@python3 -m venv .venv || python -m venv .venv
	@.venv/bin/pip install --quiet -r apps/backend/requirements.txt
	@touch .venv

install-local: check apps/frontend/node_modules .venv
	@printf "$(GREEN)Local environment is up to date!$(NO_COLOR)\n"

# 2. Core Tasks
types: check install-local
	@printf "$(GREEN)Generating OpenAPI schema directly from local venv...$(NO_COLOR)\n"
	@mkdir -p apps/frontend/src/types
	@PYTHONPATH=apps/backend .venv/bin/python -c "from app.main import app; import json; print(json.dumps(app.openapi()))" > openapi.json
	@printf "$(GREEN)Compiling TypeScript interfaces...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run build:types
	@rm -f openapi.json
	@printf "$(GREEN)Shared types updated successfully!$(NO_COLOR)\n"

lint: lint-frontend lint-backend

lint-frontend: install-local
	@printf "$(GREEN)Linting frontend...$(NO_COLOR)\n"
	@npm --prefix apps/frontend run lint

lint-backend: install-local
	@printf "$(GREEN)Linting backend...$(NO_COLOR)\n"
	@.venv/bin/ruff check apps/backend

# 3. Main Workflows
dev: COMPOSE := $(COMPOSE_DEV)
dev: check install-local types lint up

prod: COMPOSE := $(COMPOSE_PROD)
prod: check types lint up

ci: COMPOSE := $(COMPOSE_DEV)
ci: check up types
	@trap '$(COMPOSE_DEV) down -v >/dev/null 2>&1' EXIT; \
	printf "$(GREEN)Step 3: Linting$(NO_COLOR)\n"; \
	$(COMPOSE_DEV) exec -T backend ruff check . || \
	  (printf "$(RED)Backend linting failed.$(NO_COLOR)\n"; exit 1); \
	$(COMPOSE_DEV) exec -T frontend npm run lint || \
	  (printf "$(RED)Frontend linting failed.$(NO_COLOR)\n"; exit 1); \
	printf "$(GREEN)Step 4: Testing$(NO_COLOR)\n"; \
	$(COMPOSE_DEV) exec -T backend python -m pytest . || [ $$? -eq 5 ] || \
	  (printf "$(RED)Backend tests failed.$(NO_COLOR)\n"; exit 1); \
	if $(COMPOSE_DEV) exec -T frontend npm run | grep -q "^  test$$"; then \
		$(COMPOSE_DEV) exec -T frontend npm run test || (printf "$(RED)Frontend tests failed.$(NO_COLOR)\n"; exit 1); \
	else \
		printf "No frontend test script found, skipping...\n"; \
	fi; \
	printf "$(GREEN)Step 5: Building$(NO_COLOR)\n"; \
	$(COMPOSE_DEV) exec -T backend python -m compileall app || \
	  (printf "$(RED)Backend build (compilation) failed.$(NO_COLOR)\n"; exit 1); \
	$(COMPOSE_DEV) exec -T frontend npm run build || \
	  (printf "$(RED)Frontend build failed.$(NO_COLOR)\n"; exit 1); \
	printf "$(GREEN)--- CI Simulation Passed ---$(NO_COLOR)\n"

up: check
	@printf "$(GREEN)Starting services using $(COMPOSE)...$(NO_COLOR)\n"
	@$(COMPOSE) up -d --remove-orphans --build --wait
	@printf "$(GREEN)Services started successfully. Use 'make logs' or 'make down' to manage.$(NO_COLOR)\n"

# 4. Monitoring & Management
status:
	@$(COMPOSE) ps

logs:
	@$(COMPOSE) logs -f

down:
	@printf "$(GREEN)Stopping all containers...$(NO_COLOR)\n"
	@$(COMPOSE_DEV) down --remove-orphans
	@$(COMPOSE_PROD) down --remove-orphans
	@printf "$(GREEN)Containers stopped successfully.$(NO_COLOR)\n"

# 5. Cleanup
clean: down
	@printf "$(GREEN)Cleaning build artifacts...$(NO_COLOR)\n"
	@rm -rf apps/frontend/dist
	@find apps/backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@rm -f openapi.json
	@printf "$(GREEN)Cleanup complete.$(NO_COLOR)\n"

fclean: clean
	@printf "$(GREEN)Deep cleaning: removing node_modules, .venv, volumes, and built images...$(NO_COLOR)\n"
	@rm -rf apps/frontend/node_modules
	@rm -rf .venv
	@$(COMPOSE_DEV) down -v --rmi all --remove-orphans
	@$(COMPOSE_PROD) down -v --rmi all --remove-orphans
	@printf "$(GREEN)Deep clean complete.$(NO_COLOR)\n"

re: fclean dev

sprune: fclean
	@printf "$(GREEN)Pruning in progress...$(NO_COLOR)\n"
	@docker system prune --volumes -f

.PHONY: all help check install-local types lint lint-frontend lint-backend dev prod ci up status logs down clean fclean re sprune
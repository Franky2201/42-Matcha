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
	@docker info > /dev/null 2>&1 || (printf "$(RED)Error: Docker daemon is not running. Please start Docker.$(NO_COLOR)\n"; exit 1)
	@docker compose version > /dev/null 2>&1 || (printf "$(RED)Error: docker compose command is not available. Please install Docker Compose V2.$(NO_COLOR)\n"; exit 1)
	@test -f $(ENV_FILE) || (printf "$(GREEN)Initializing .env from .env.example...$(NO_COLOR)\n"; cp .env.example $(ENV_FILE))
	@printf "$(GREEN)System checks passed successfully!$(NO_COLOR)\n"

install-local: check
	@printf "$(GREEN)Checking host-side build tools...$(NO_COLOR)\n"
	@command -v node > /dev/null 2>&1 || printf "$(RED)Warning: Node.js is not installed on host. Local tools might not function properly.$(NO_COLOR)\n"
	@command -v python3 > /dev/null 2>&1 || printf "$(RED)Warning: Python3 is not installed on host. Local virtualenv setup will fail.$(NO_COLOR)\n"
	@printf "$(GREEN)Installing frontend dependencies locally...$(NO_COLOR)\n"
	@cd apps/frontend && npm install --quiet --legacy-peer-deps
	@printf "$(GREEN)Creating local Python virtual environment (.venv)...$(NO_COLOR)\n"
	@python3 -m venv .venv || python -m venv .venv
	@.venv/bin/pip install --quiet -r apps/backend/requirements.txt
	@printf "$(GREEN)Local environment setup complete!$(NO_COLOR)\n"

# 2. Core Tasks
types: check
	@printf "$(GREEN)Generating OpenAPI schema from FastAPI backend...$(NO_COLOR)\n"
	@mkdir -p apps/frontend/src/types
	@# Spin up a temporary backend container to output the openapi schema to a JSON file
	@$(COMPOSE_DEV) run --rm -T backend python -c "from app.main import app; import json; print(json.dumps(app.openapi()))" > openapi.json
	@printf "$(GREEN)Compiling TypeScript interfaces at apps/frontend/src/types/api.ts...$(NO_COLOR)\n"
	@if command -v npx > /dev/null 2>&1; then \
		npx openapi-typescript openapi.json -o apps/frontend/src/types/api.ts; \
	else \
		printf "$(RED)npx not found on host. Falling back to Docker Node environment for compilation...$(NO_COLOR)\n"; \
		docker run --rm -v $$(pwd):/app -w /app node:20-alpine npx openapi-typescript openapi.json -o apps/frontend/src/types/api.ts; \
	fi
	@rm -f openapi.json
	@printf "$(GREEN)Shared types updated successfully!$(NO_COLOR)\n"

lint: lint-frontend lint-backend

lint-frontend:
	@printf "$(GREEN)Linting frontend...$(NO_COLOR)\n"
	@if [ -d "apps/frontend/node_modules" ]; then \
		cd apps/frontend && npm run lint; \
	else \
		printf "$(RED)node_modules not found locally. Running frontend lint inside Docker...$(NO_COLOR)\n"; \
		docker run --rm -v $$(pwd)/apps/frontend:/app -w /app node:20-alpine sh -c "npm ci --quiet --legacy-peer-deps && npm run lint"; \
	fi

lint-backend:
	@printf "$(GREEN)Linting backend...$(NO_COLOR)\n"
	@if [ -f ".venv/bin/ruff" ]; then \
		.venv/bin/ruff check apps/backend; \
	elif command -v ruff > /dev/null 2>&1; then \
		ruff check apps/backend; \
	else \
		printf "$(RED)ruff not found locally. Running backend lint inside Docker...$(NO_COLOR)\n"; \
		docker run --rm -v $$(pwd)/apps/backend:/app -w /app python:3.11-slim sh -c "pip install --quiet ruff && ruff check ."; \
	fi

# 3. Main Workflows
dev: COMPOSE := $(COMPOSE_DEV)
dev: check install-local types lint up

prod: COMPOSE := $(COMPOSE_PROD)
prod: check types lint up

ci: COMPOSE := $(COMPOSE_DEV)
ci: check up types
	@printf "$(GREEN)Step 3: Linting$(NO_COLOR)\n"
	@$(COMPOSE_DEV) exec -T backend ruff check . || \
	  (printf "$(RED)Backend linting failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1)
	@$(COMPOSE_DEV) exec -T frontend npm run lint || \
	  (printf "$(RED)Frontend linting failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1)
	@printf "$(GREEN)Step 4: Testing$(NO_COLOR)\n"
	@$(COMPOSE_DEV) exec -T backend python -m pytest . || [ $$? -eq 5 ] || \
	  (printf "$(RED)Backend tests failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1)
	@if $(COMPOSE_DEV) exec -T frontend npm run | grep -q "^  test$$"; then \
		$(COMPOSE_DEV) exec -T frontend npm run test || (printf "$(RED)Frontend tests failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1); \
	else \
		printf "No frontend test script found, skipping...\n"; \
	fi
	@printf "$(GREEN)Step 5: Building$(NO_COLOR)\n"
	@$(COMPOSE_DEV) exec -T backend python -m compileall app || \
	  (printf "$(RED)Backend build (compilation) failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1)
	@$(COMPOSE_DEV) exec -T frontend npm run build || \
	  (printf "$(RED)Frontend build failed.$(NO_COLOR)\n"; $(COMPOSE_DEV) down -v; exit 1)
	@$(COMPOSE_DEV) down -v > /dev/null 2>&1
	@printf "$(GREEN)--- CI Simulation Passed ---$(NO_COLOR)\n"

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
	@printf "$(GREEN)Deep cleaning: removing node_modules, volumes, and built images...$(NO_COLOR)\n"
	@rm -rf apps/frontend/node_modules
	@$(COMPOSE_DEV) down -v --rmi all --remove-orphans
	@$(COMPOSE_PROD) down -v --rmi all --remove-orphans
	@printf "$(GREEN)Deep clean complete.$(NO_COLOR)\n"

re: fclean dev

sprune: fclean
	@printf "$(GREEN)Pruning in progress...$(NO_COLOR)\n"
	@docker system prune --volumes -f

.PHONY: all help check install-local types lint lint-frontend lint-backend dev prod ci up status logs down clean fclean re sprune

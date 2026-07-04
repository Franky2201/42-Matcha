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
	@printf "  help           Display this help screen\n"
	@printf "  dev            Start the project in development mode (with hot-reload)\n"
	@printf "  prod           Start the project in production mode (using nginx)\n"
	@printf "  up             Start services (detached)\n"
	@printf "  down           Stop and remove containers (both dev and prod)\n"
	@printf "  status         Check status of containers\n"
	@printf "  logs           Follow container logs\n"
	@printf "  types          Generate TypeScript interfaces from FastAPI models\n"
	@printf "  clean          Remove temporary build artifacts\n"
	@printf "  fclean         Deep clean removing node_modules, images, and volumes\n"
	@printf "  re             Full deep clean and restart dev environment\n"

check:
	@command -v docker > /dev/null 2>&1 || (printf "$(RED)Docker is not installed.$(NO_COLOR)\n"; exit 1)
	@test -f $(ENV_FILE) || cp .env.example $(ENV_FILE)

# Development Mode
dev: COMPOSE := $(COMPOSE_DEV)
dev: install-local up

# Production Mode
prod: COMPOSE := $(COMPOSE_PROD)
prod: up

# Start services
up: check
	@printf "$(GREEN)Starting services using $(COMPOSE)...$(NO_COLOR)\n"
	@$(COMPOSE) up -d --remove-orphans --build
	@printf "$(GREEN)Services started successfully. Use 'make logs' or 'make down' to manage.$(NO_COLOR)\n"

# Stop services for both environments
down:
	@printf "$(GREEN)Stopping all containers...$(NO_COLOR)\n"
	@$(COMPOSE_DEV) down --remove-orphans
	@$(COMPOSE_PROD) down --remove-orphans
	@printf "$(GREEN)Containers stopped successfully.$(NO_COLOR)\n"

status:
	@$(COMPOSE) ps

logs:
	@$(COMPOSE) logs -f

# Generate TypeScript types from FastAPI Pydantic models
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

# Setup local host-side development dependencies for editor autocomplete
install-local: check
	@printf "$(GREEN)Installing frontend dependencies locally...$(NO_COLOR)\n"
	@cd apps/frontend && npm install --quiet
	@printf "$(GREEN)Creating local Python virtual environment (.venv)...$(NO_COLOR)\n"
	@python3 -m venv .venv || python -m venv .venv
	@.venv/bin/pip install --quiet -r apps/backend/requirements.txt
	@printf "$(GREEN)Local environment setup complete!$(NO_COLOR)\n"

# Deep clean and system prune
sprune: fclean
	@printf "$(GREEN)Pruning in progress...$(NO_COLOR)\n"
	@docker system prune --volumes -f

.PHONY: all help check dev prod up down status logs types clean fclean re install-local sprune

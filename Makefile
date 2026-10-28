PROJECT_NAME := matcha
COMPOSE := docker compose -p $(PROJECT_NAME) -f docker-compose.yml

GREEN := \033[0;32m
RED := \033[0;31m
NO_COLOR := \033[0m

VENV_PIP := backend/.venv/bin/pip
VENV_RUFF := backend/.venv/bin/ruff

CMD_GOAL := $(firstword $(MAKECMDGOALS))
ifneq ($(filter $(CMD_GOAL),add-py add-js),)
  ARG_LIST := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(ARG_LIST):;@:)
  PKG := $(ARG_LIST)
endif

all: up

help:
	@printf "$(GREEN)Commandes:$(NO_COLOR)\n"
	@printf "  up             Démarrer l'environnement complet\n"
	@printf "  down           Arrêter les conteneurs\n"
	@printf "  logs           Afficher les logs en temps réel\n"
	@printf "  add-py <pkg>   Installer un paquet Python et màj requirements.txt\n"
	@printf "  add-js <pkg>   Installer un paquet npm frontend\n"
	@printf "  clean          Nettoyer les fichiers temporaires\n"
	@printf "  fclean         Suppression totale (volumes, images, node_modules, .venv)\n"
	@printf "  re             fclean + up\n"

frontend/node_modules:
	@npm --prefix frontend install
	@touch frontend/node_modules

backend/.venv: backend/requirements.txt
	@python3 -m venv backend/.venv
	@$(VENV_PIP) install --quiet -r backend/requirements.txt
	@touch backend/.venv

add-py: backend/.venv
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-py <package>$(NO_COLOR)\n"; exit 1; fi
	@$(VENV_PIP) install $(PKG)
	@$(VENV_PIP) freeze > backend/requirements.txt
	@touch backend/.venv

add-js: frontend/node_modules
	@if [ -z "$(PKG)" ]; then printf "$(RED)Usage: make add-js <package>$(NO_COLOR)\n"; exit 1; fi
	@npm --prefix frontend install $(PKG)

up: frontend/node_modules backend/.venv
	@$(COMPOSE) up -d --build

down:
	@$(COMPOSE) down

logs:
	@$(COMPOSE) logs -f

clean:
	@rm -rf frontend/dist .ruff_cache
	@find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@find backend -name "*.pyc" -delete 2>/dev/null || true

fclean: clean
	@$(COMPOSE) down -v --rmi all --remove-orphans 2>/dev/null || true
	@rm -rf frontend/node_modules backend/.venv

re: fclean up

.PHONY: all help add-py add-js up down logs clean fclean re

# Matcha Monorepo

This repository contains the `matcha` application codebase, structured as a Docker-orchestrated monorepo containing a React (TypeScript + Vite) frontend and a FastAPI (Python) backend.

---

## 🛠️ Tech Stack
* **Frontend**: React 19, TypeScript, Vite
* **Backend**: FastAPI, Python 3.11, Pydantic v2
* **Reverse Proxy**: Nginx (configured with SSL/TLS in production)
* **Orchestration**: Docker Compose, Makefile

---

## 📂 Directory Structure
```
.
├── Makefile                 # Utility shortcuts for orchestration
├── docker-compose.yml       # Dev configuration (with live hot-reload)
├── docker-compose.prod.yml  # Prod configuration (Nginx SSL Reverse Proxy)
├── .env.example             # Environment variable template
└── apps/
    ├── frontend/            # React client-side application
    │   ├── Dockerfile
    │   └── nginx/           # SSL config and certificates exporter
    └── backend/             # FastAPI REST server
        ├── Dockerfile
        ├── requirements.txt
        └── app/             # Application logic (main.py, routers, models)
```

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
Ensure you have the following installed locally:
* [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (optional but highly recommended for host-side editor support/autocomplete)
* [Python 3.11](https://www.python.org/) (optional but recommended for backend autocomplete)

### 2. Initial Setup
Initialize the configuration files by running:
```bash
make check
```
This checks if Docker is present and automatically generates your local `.env` file from the `.env.example` template.

### 3. Run Development Servers
To build the Docker containers and start the development environment with hot-reloading:
```bash
make dev
```
Once started:
* **Frontend**: Access at [http://localhost:5173](http://localhost:5173) (changes on host auto-sync immediately)
* **Backend API**: Access at [http://localhost:8000](http://localhost:8000)
* **API Documentation**: Interactive Swagger docs are available at [http://localhost:8000/docs](http://localhost:8000/docs)

To view container logs:
```bash
make logs
```

To stop development servers:
```bash
make down
```

---

## 🔒 Production Setup (SSL/TLS & API Proxying)

To verify the production container build, compile static React assets, generate self-signed SSL/TLS certificates, and serve everything through Nginx:
```bash
make prod
```
Once up:
* Access the app securely over HTTPS at [https://localhost](https://localhost)
* Port `80` (HTTP) requests automatically redirect to `https://localhost` (HTTPS)
* All `/api/` requests are reverse-proxied internally to the FastAPI container

To stop the production stack:
```bash
make down
```

---

## 🔄 Shared TypeScript Types

Whenever you modify or add Pydantic schemas in the FastAPI backend (`apps/backend/app/models` or `main.py`), you can regenerate TypeScript types for the frontend with:
```bash
make types
```
This runs an offline compilation pipeline that exports the FastAPI OpenAPI schema and compiles it into:
* **[apps/frontend/src/types/api.ts](apps/frontend/src/types/api.ts)**

If you do not have Node/npx installed on your local host machine, the command automatically falls back to running the compiler inside a temporary Docker Node container, ensuring it works seamlessly for everyone.

---

## 🧹 Cleanup
To clean intermediate build caches, run:
```bash
make clean
```

For a full deep-clean (removes `node_modules`, Docker volumes, and compiled images), run:
```bash
make fclean
```

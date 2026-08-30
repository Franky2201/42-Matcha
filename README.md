# Matcha Monorepo

This repository contains the `matcha` application codebase, structured as a Docker-orchestrated monorepo containing a React (TypeScript + Vite) frontend and a Flask + Strawberry GraphQL (Python) backend.

---

## 🛠️ Tech Stack
* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Apollo Client
* **Backend**: Flask, Python 3.11, Strawberry GraphQL, asyncpg
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
    └── backend/             # Flask GraphQL server
        ├── Dockerfile
        ├── requirements.txt
        └── app/             # Application logic (main.py, features, core)
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
* **GraphQL & GraphiQL IDE**: Interactive GraphiQL explorer available at [http://localhost:8000/graphql](http://localhost:8000/graphql)

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
* All `/api/` and backend requests are reverse-proxied internally to the backend container

To stop the production stack:
```bash
make down
```

---

## 🔄 Shared TypeScript Types

Whenever you modify or add Strawberry schemas or resolvers in the backend (`apps/backend/app/features`), you can regenerate TypeScript types for the frontend with:
```bash
make types
```
This exports the backend GraphQL schema and compiles it with GraphQL Code Generator into:
* **[apps/frontend/src/types/graphql.ts](apps/frontend/src/types/graphql.ts)**

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


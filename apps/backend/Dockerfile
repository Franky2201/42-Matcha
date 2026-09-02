# Base image
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Development Stage ---
FROM base AS development
COPY . .
EXPOSE 8000
CMD ["flask", "--app", "app.main:app", "run", "--host", "0.0.0.0", "--port", "8000", "--debug"]

# --- Production Stage ---
FROM base AS production
COPY . .
EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app.main:app"]


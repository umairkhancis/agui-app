# Standalone backend: FastAPI + LangGraph agent served via AG-UI protocol.
# No Node.js, no Next.js — pure Python.
FROM python:3.12-slim

# Install uv (fast Python package manager) from the official image.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy agent source and dependency manifests.
# Each agent (demo, food_discovery) lives entirely under agent/src/<name>/;
# serve.py picks which one to expose via an import-swap at build time.
COPY agent/pyproject.toml agent/uv.lock ./
COPY agent/src/ ./src/
COPY agent/serve.py ./

# Install dependencies declared in pyproject.toml.
# UV_PROJECT_ENVIRONMENT points uv sync at the system Python (no venv needed in Docker).
ENV UV_PROJECT_ENVIRONMENT=/usr/local
RUN uv sync --no-dev

CMD ["uv", "run", "python", "serve.py"]

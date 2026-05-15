# Standalone backend: FastAPI + LangGraph agent served via AG-UI protocol.
# No Node.js, no Next.js — pure Python.
FROM python:3.12-slim

# Install uv (fast Python package manager) from the official image.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy agent source and dependency manifests.
COPY agent/pyproject.toml agent/uv.lock ./
COPY agent/src/ ./src/
COPY agent/main.py ./
COPY agent/serve.py ./

# Install dependencies declared in pyproject.toml.
# --no-dev skips dev-only deps; --system installs into the container Python.
RUN uv sync --no-dev --system

EXPOSE 8123

ENV AGENT_PORT=8123

CMD ["uv", "run", "python", "serve.py"]

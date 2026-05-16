# agui-app

A demo of an AI agent talking to a web UI over the [AG-UI](https://docs.copilotkit.ai) protocol.

- **Backend** — a Python LangGraph agent served by FastAPI.
- **Frontend** — a Next.js + React app using CopilotKit to render chat, agent-driven UI, and [A2UI](https://a2ui.org/specification/) surfaces.

The two halves run independently and talk over HTTP/SSE — there is no Node-side agent runtime.

## Layout

```
backend/                FastAPI + LangGraph agent (Python, uv)
  agent/
    main.py             Agent definition (tools, model, state)
    serve.py            FastAPI server exposing AG-UI endpoint on :8123
    src/                Tools: todos, query, a2ui_fixed_schema, a2ui_dynamic_schema
frontend/               Next.js 16 app (React 19, CopilotKit 1.56)
  src/app/              Pages, layout, CopilotKit API route
  src/components/       Canvas, layout, generative UI, A2UI renderers
docs/                   Design notes (Flutter client feasibility, AG-UI adoption)
docker-compose.yml      Runs both services together
```

## Run with Docker (easiest)

Requires Docker and an OpenAI API key.

```bash
echo "OPENAI_API_KEY=sk-..." > backend/.env
touch frontend/.env
docker compose up --build
```

Open http://localhost:3000.

## Run locally

**Backend** (Python 3.12+, [uv](https://docs.astral.sh/uv/)):

```bash
cd backend/agent
uv sync
OPENAI_API_KEY=sk-... uv run python serve.py
```

Serves the agent at http://localhost:8123.

**Frontend** (Node 18+):

```bash
cd frontend
npm install
npm run dev
```

Serves the UI at http://localhost:3000. Set `AGENT_URL=http://localhost:8123` if it differs from the default.

## What the demo shows

- **Todos canvas** — bidirectional state sync between agent and UI using CopilotKit's v2 agent-state pattern.
- **Generative UI** — agent-rendered charts via `query_data` + Recharts.
- **A2UI** — agent emits declarative UI ops (`search_flights` for a fixed flight-card schema, `generate_a2ui` for dynamic dashboards). See `frontend/README.md` for the catalog/surface model.

## Tests

```bash
cd frontend && npm run test:e2e        # Playwright
```

## Docs

- `docs/backend-agui-adoption.md` — why the backend speaks AG-UI directly.
- `docs/feasibility-flutter-agui-client.md` — assessment of building a Dart/Flutter AG-UI client.
- `frontend/README.md` — original CopilotKit starter README with full A2UI walkthrough.
- `frontend/CLAUDE.md` — agent-state pattern deep dive.

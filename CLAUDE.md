# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independently deployable packages plus shared docs. They are not linked by a workspace manifest — each has its own dependency manifest and Dockerfile.

```
backend/   FastAPI + LangGraph agent, served via AG-UI protocol (Python, uv)
frontend/  Next.js 16 app with CopilotKit v2 (TypeScript, npm)
docs/      Decision docs (AG-UI adoption rationale, Flutter client feasibility)
docker-compose.yml   Root compose that builds both and wires AGENT_URL
```

The packages were split in commit `39acfe1` ("feat/backend-separation"). The combined-dev `concurrently` setup and `scripts/setup-agent.sh` referenced in older docs no longer exist — each side is run on its own.

## How the two halves talk

The frontend never imports the agent. It talks to it over HTTP via the **AG-UI protocol**:

- Backend exposes the LangGraph graph on `POST /` via `add_langgraph_fastapi_endpoint` in `backend/agent/serve.py` (default port `8123`, `/health` for liveness).
- Frontend's Next.js API route `src/app/api/copilotkit/[[...slug]]/route.ts` wraps a `LangGraphHttpAgent(url=AGENT_URL)` in a `CopilotRuntime` (v2) and exposes it under `/api/copilotkit`.
- The browser hits `/api/copilotkit`; that route proxies to `AGENT_URL` (default `http://localhost:8123`, set to `http://backend:8123` in docker-compose).

Why this matters: changing the agent's tools or state schema does not require any frontend code change unless the frontend reads a new state key or renders a new A2UI component. The contract is the AG-UI event stream, not a typed RPC.

## Commands

### Backend (`backend/agent/`)

```bash
cd backend/agent
uv sync                       # install dependencies
uv run python serve.py        # serve on :8123 via AG-UI (FastAPI/uvicorn)
uv run langgraph dev          # LangGraph Studio dev server (uses langgraph.json)
```

`langgraph.json` registers `main.py:graph` as the `sample_agent` graph and points env at `../.env`. `serve.py` injects a `MemorySaver` checkpointer because `create_agent()` graphs don't ship with one outside the LangGraph Platform.

### Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev                   # Next.js dev (turbopack) on :3000
npm run build                 # production build (output: standalone)
npm run test:e2e              # Playwright against BASE_URL (default :3000)
npm run test:e2e -- tests/e2e/all-suggestions.spec.ts   # single spec
npx playwright test --grep "<name>"                      # single test by name
```

Playwright config: `fullyParallel: false`, `workers: 1`, 10-minute per-test timeout — these tests drive real LLM flows, so don't try to parallelize them.

`next.config.ts` sets `typescript.ignoreBuildErrors: true` because `docker-route-override.ts` swaps in an `HttpAgent` whose types don't line up with `CopilotRuntime` v2. Type errors in route handlers will not fail the build — run `tsc --noEmit` if you need a real type check.

### Docker

```bash
docker compose up --build     # root compose: backend then frontend with AGENT_URL wired
```

Both `.env` files (`backend/.env`, `frontend/.env`) are required for compose to start. See `*.env.example` for keys (`OPENAI_API_KEY` is required on the backend; `LITELLM_BASE_URL` is optional and routes OpenAI calls through a LiteLLM proxy).

## Architecture: state and UI generation

Two patterns drive every demo in this repo. Both flow through CopilotKit v2.

### 1. Shared agent state (`backend/agent/src/todos.py`)

The agent declares a `TypedDict` `AgentState` (e.g. `todos: list[Todo]`) as its `state_schema`. The frontend reads `agent.state.todos` via `useAgent()` and writes back via `agent.setState({ todos: ... })`. Tools like `manage_todos` return `Command(update={"todos": ...})` to mutate the same store. CopilotKit syncs both directions; no separate frontend store exists.

`StateStreamingMiddleware(StateItem(state_key="todos", tool="manage_todos", tool_argument="todos"))` in `main.py` streams partial tool arguments into state during generation, so the UI animates as the agent types.

### 2. A2UI declarative generative UI

The agent ships a JSON description of components rather than text; the frontend renders them from a registered catalog.

| Piece | Location |
| --- | --- |
| Component schemas (Zod) | `frontend/src/app/declarative-generative-ui/definitions.ts` |
| Component renderers (React) | `frontend/src/app/declarative-generative-ui/renderers.tsx` |
| Catalog registration | `frontend/src/app/layout.tsx` (`a2ui={{ catalog: demonstrationCatalog }}`) |
| Fixed-schema agent tool | `backend/agent/src/a2ui_fixed_schema.py` (loads `a2ui/schemas/*.json`) |
| Dynamic-schema agent tool | `backend/agent/src/a2ui_dynamic_schema.py` (secondary LLM picks the tree) |

Fixed = pre-baked component tree, data fills the slots. Dynamic = the LLM emits the component tree at runtime. Same renderer catalog backs both. Tools return `a2ui.render(operations=[...])` and `CopilotKitMiddleware` streams the ops.

The Next.js API route also sets `openGenerativeUI: true` and `a2ui.injectA2UITool: false` — the agent owns A2UI tool injection, not the runtime.

## Branding / multi-tenant demo

`frontend/src/lib/brand.ts` defines `talabat` and `copilot` brands. The default (used in the root layout `<head>`) is `talabat`. The `/demo` route in `frontend/src/app/demo/` overrides the brand at the `ExampleLayout` boundary — when adding pages that should look like CopilotKit instead of Talabat, follow that pattern rather than mutating the global `brand` export.

## Memory-related etiquette

The user has a memory rule forbidding chained Bash commands (`&&`, `;`, `||`) so that per-command "don't ask again" permissions stick. Run single commands instead of joining them.

# Backend — LangGraph agent served over AG-UI

FastAPI process that wraps a LangGraph `create_agent()` graph and exposes it on `:8123` for the Next.js frontend (and any other AG-UI client). Cross-package context (how the frontend talks to this, docker compose, repo layout) lives in the root `CLAUDE.md`.

## Source layout

```
backend/
├── Dockerfile                            # python:3.12-slim + uv sync --no-dev
├── docker-compose.yml                    # standalone agent on ${AGENT_PORT:-8123}
├── docker-compose.test.yml               # aimock + agent + app + Playwright smoke tests
├── fixtures/default.json                 # aimock responses keyed by userMessage/toolCallId
└── agent/
    ├── pyproject.toml, uv.lock           # uv-managed dependencies
    ├── langgraph.json                    # registers main.py:graph as "sample_agent"
    ├── main.py                           # Builds the graph (model + tools + middleware + state)
    ├── serve.py                          # FastAPI entry that exposes the graph via AG-UI
    └── src/
        ├── todos.py                      # AgentState schema + todo tools
        ├── query.py                      # query_data tool (reads db.csv at import time)
        ├── db.csv                        # demo dataset
        ├── a2ui_fixed_schema.py          # search_flights: load JSON schema, render with data
        ├── a2ui_dynamic_schema.py        # generate_a2ui: secondary LLM emits the schema
        └── a2ui/schemas/flight_schema.json
```

## The graph

`agent/main.py` is the single source of truth. It builds one `create_agent(...)` with:

- **Model** — `ChatOpenAI(model="gpt-5.4-mini", parallel_tool_calls=False)`. If `LITELLM_BASE_URL` is set, calls route through a LiteLLM proxy; otherwise straight to OpenAI. Tool calls are deliberately serialized (`parallel_tool_calls=False`) because A2UI streaming assumes one tool at a time.
- **Tools** — `query_data`, `manage_todos`, `get_todos`, `generate_a2ui`, `search_flights`.
- **State schema** — `AgentState` in `src/todos.py` extends `langchain.agents.AgentState` and adds `todos: list[Todo]`. Add new shared-state fields here; the frontend reads them via `agent.state.<field>`.
- **Middleware** — `CopilotKitMiddleware()` plus `StateStreamingMiddleware(StateItem(state_key="todos", tool="manage_todos", tool_argument="todos"))`. The streamer pipes partial tool arguments into `state.todos` *during* generation so the UI animates as the agent types.

`langgraph.json` points at `./main.py:graph` and reads env from `../.env` (i.e. `backend/.env`, not `backend/agent/.env`).

## Two ways to serve the graph

| Entry | Purpose |
| --- | --- |
| `uv run python serve.py` | Production-style FastAPI on `:8123`. Wraps the graph in `LangGraphAGUIAgent`, mounts it at `POST /`, exposes `/health`, applies CORS from `CORS_ORIGINS`. This is what Docker runs. |
| `uv run langgraph dev` | LangGraph Studio dev server (uses `langgraph.json`). Use for visual graph debugging — the frontend cannot connect to this. |

`serve.py` patches in a `MemorySaver` checkpointer because `create_agent()` graphs ship without one outside LangGraph Platform. If you switch to a persistent checkpointer (Postgres/SQLite), do it there, not in `main.py` — `langgraph dev` provides its own.

## A2UI from the backend side

Two tools, same renderer catalog on the frontend (`frontend/src/app/declarative-generative-ui/`).

**Fixed schema (`a2ui_fixed_schema.py`)** — `search_flights` loads `a2ui/schemas/flight_schema.json` once at import time and reuses it. The tool docstring carries detailed prompt guidance for the agent (URLs for airline logos, status icon colors, etc.) — keep that prompt-shaped because the LLM reads it.

```python
return a2ui.render(operations=[
    a2ui.create_surface(SURFACE_ID, catalog_id=CATALOG_ID),
    a2ui.update_components(SURFACE_ID, FLIGHT_SCHEMA),
    a2ui.update_data_model(SURFACE_ID, {"flights": flights}),
])
```

**Dynamic schema (`a2ui_dynamic_schema.py`)** — `generate_a2ui` spins up a secondary `ChatOpenAI` with a structured `render_a2ui` tool. That LLM picks the component tree at runtime from the conversation context, and the primary agent returns its output as `a2ui_operations` which `CopilotKitMiddleware` detects and streams.

Catalog id is `copilotkit://app-dashboard-catalog` for both — the catalog itself lives on the frontend. To add a new component: register it in the frontend catalog, then either reference it from a new JSON schema (fixed) or it becomes available to the dynamic LLM automatically.

## Adding a tool

1. Define `@tool` in a new file under `agent/src/`. If it mutates shared state, return `Command(update={...})`; if it just produces a value, return it directly. Use `ToolRuntime` to access `runtime.state` and `runtime.tool_call_id`.
2. Import and add it to the `tools=[...]` list in `main.py`.
3. If it adds a new state key, add the field to `AgentState` in `todos.py` (or split into its own state module — the existing one is named for history, not scope).
4. Update the `system_prompt` in `main.py` with a one-line tool-usage hint. The current prompt is short and structured by tool category — match that shape.

## Environment

Set in `backend/.env` (see `.env.example`):

| Var | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | LLM access. Use any sentinel for aimock tests. |
| `LITELLM_BASE_URL` | No | Proxy OpenAI calls through LiteLLM. |
| `LANGSMITH_API_KEY` | No | Tracing. |
| `AGENT_PORT` | No | Defaults to `8123`. |
| `CORS_ORIGINS` | No | Comma-separated; defaults to `*`. Tighten in production. |

`query.py` reads `db.csv` at **import time**, not per-call — LangGraph Cloud sandboxes tool execution and file I/O at call time can fail. Keep that pattern for any tool that needs to load a fixture.

## Tests

`docker-compose.test.yml` brings up `aimock` (mock LLM) + the agent + the frontend + a Playwright container, all wired together. Fixtures in `backend/fixtures/default.json` map either `userMessage` or `toolCallId` to canned responses (content, tool calls, or both). The catch-all fixture is intentionally a help message — if you see it in a test, your match key didn't fire.

```bash
docker compose -f docker-compose.test.yml up --build
```

Note: this compose references a Dockerfile path (`../docker/Dockerfile.agent`) and a tests volume (`../../../showcase/tests`) that don't exist in this repo. The smoke-test stack is set up to run from a parent showcase repo, not standalone — useful as a reference, not as a one-command runnable here.

## Commands

```bash
cd backend/agent
uv sync                      # install dependencies (lockfile-driven)
uv sync --no-dev             # production install (matches Dockerfile)
uv run python serve.py       # serve on :8123 via AG-UI
uv run langgraph dev         # Studio dev server (graph debugging only)
uv lock --upgrade-package <name>   # bump a single dep
```

## Tech stack

Python 3.12 · uv · LangChain 1.2 · LangGraph 1.1 · `langchain-openai` · `langchain-anthropic` (available, not currently wired) · `copilotkit` 0.1.87 (`CopilotKitMiddleware`, `StateStreamingMiddleware`, `a2ui`, `LangGraphAGUIAgent`) · `ag-ui-langgraph` (`add_langgraph_fastapi_endpoint`) · FastAPI · uvicorn.

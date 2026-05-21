"""
FastAPI server that exposes ONE LangGraph agent via the AG-UI protocol.

Three agents are available in this repo:
  - src.demo.agent             → the CopilotKit /demo tools-showcase agent (default)
  - src.food_discovery.agent   → the Talabat food discovery agent
  - src.minimal.agent          → bare-bones single-tool agent for observing raw AG-UI events

Select which one is served by setting AGENT in your .env file:
  AGENT=demo            → src.demo.agent (default)
  AGENT=food_discovery  → src.food_discovery.agent
  AGENT=minimal         → src.minimal.agent

Run locally:   uv run python serve.py
Run in Docker: CMD ["uv", "run", "python", "serve.py"]
"""

import importlib
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver

from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint

# ─── Pick which agent to serve via AGENT env var ───────────────────────────

_AGENTS = {
    "demo": {
        "module": "src.demo.agent",
        "name": "demo_agent",
        "description": "CopilotKit tools-showcase agent (flights, todos, a2ui, charts).",
    },
    "food_discovery": {
        "module": "src.food_discovery.agent",
        "name": "food_discovery_agent",
        "description": "Talabat food discovery agent — drives the canvas via tools.",
    },
    "minimal": {
        "module": "src.minimal.agent",
        "name": "minimal_agent",
        "description": "Bare-bones agent with a single add_numbers tool — for observing raw AG-UI events.",
    },
}

_agent_key = os.getenv("AGENT", "demo")
if _agent_key not in _AGENTS:
    raise ValueError(
        f"Unknown AGENT={_agent_key!r}. Valid values: {', '.join(_AGENTS)}"
    )

_cfg = _AGENTS[_agent_key]
graph = importlib.import_module(_cfg["module"]).graph
AGENT_NAME = _cfg["name"]
AGENT_DESCRIPTION = _cfg["description"]

# ─── Server plumbing ───────────────────────────────────────────────────────

# LangGraph Platform normally injects a checkpointer. Add one for standalone serving.
if not hasattr(graph, "checkpointer") or graph.checkpointer is None:
    graph = graph.copy()
    graph.checkpointer = MemorySaver()

app = FastAPI(title="AG-UI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "agent": AGENT_NAME}


add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name=AGENT_NAME,
        description=AGENT_DESCRIPTION,
        graph=graph,
    ),
    path="/",
)

if __name__ == "__main__":
    port = int(os.getenv("AGENT_PORT", "8123"))
    uvicorn.run(app, host="0.0.0.0", port=port)

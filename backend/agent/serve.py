"""
FastAPI server that exposes ONE LangGraph agent via the AG-UI protocol.

Two agents are available in this repo:
  - src.food_discovery.agent   → the Talabat food discovery agent (default)
  - src.demo.agent             → the CopilotKit /demo tools-showcase agent

Swap which one is served by changing the import below at build/deploy time.
The two agents are fully isolated; they share no state schema and no tools.

Run locally:   uv run python serve.py
Run in Docker: CMD ["uv", "run", "python", "serve.py"]
"""

import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver

from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint

# ─── Pick which agent to serve ─────────────────────────────────────────────
# Comment one block, uncomment the other.

from src.food_discovery.agent import graph
AGENT_NAME = "food_discovery_agent"
AGENT_DESCRIPTION = "Talabat food discovery agent — drives the canvas via tools."

# from src.demo.agent import graph
# AGENT_NAME = "demo_agent"
# AGENT_DESCRIPTION = "CopilotKit tools-showcase agent (flights, todos, a2ui, charts)."

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

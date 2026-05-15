"""
FastAPI server that exposes the LangGraph agent via the AG-UI protocol.

Run locally:  uv run python serve.py
Run in Docker: CMD ["uv", "run", "python", "serve.py"]
"""

import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver

from main import graph

from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint

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
    return {"status": "ok"}


add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="sample_agent",
        description="LangGraph Python starter agent",
        graph=graph,
    ),
    path="/",
)

if __name__ == "__main__":
    port = int(os.getenv("AGENT_PORT", "8123"))
    uvicorn.run(app, host="0.0.0.0", port=port)

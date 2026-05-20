# Demo agent graph.
#
# Composes the demo agent's tools, state schema, middleware, and system
# prompt into a single LangGraph `create_agent()` graph. Exposed as `graph`
# so serve.py (or langgraph dev) can import it directly.
#
# Strict isolation rule: this module must NOT import from src.food_discovery.
# If you find yourself wanting cross-agent imports, the abstraction is wrong.

import os

from copilotkit import CopilotKitMiddleware, StateStreamingMiddleware, StateItem
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from src.demo.a2ui_dynamic_schema import generate_a2ui
from src.demo.a2ui_fixed_schema import search_flights
from src.demo.prompt import DEMO_SYSTEM_PROMPT
from src.demo.query import query_data
from src.demo.state import DemoAgentState
from src.demo.todos import todo_tools


LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL")

_model = ChatOpenAI(
    model="gpt-4.1",
    model_kwargs={"parallel_tool_calls": False},
    **({"base_url": LITELLM_BASE_URL} if LITELLM_BASE_URL else {}),
)

graph = create_agent(
    model=_model,
    tools=[query_data, *todo_tools, generate_a2ui, search_flights],
    middleware=[
        CopilotKitMiddleware(),
        StateStreamingMiddleware(
            StateItem(state_key="todos", tool="manage_todos", tool_argument="todos")
        ),
    ],
    state_schema=DemoAgentState,
    system_prompt=DEMO_SYSTEM_PROMPT,
)

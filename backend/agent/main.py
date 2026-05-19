"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import os

from copilotkit import CopilotKitMiddleware, StateStreamingMiddleware, StateItem
from langchain.agents import create_agent

# Data & state tools
from src.query import query_data
from src.todos import AgentState, todo_tools
from src.food_discovery import food_discovery_tools

# A2UI tools
from src.a2ui_dynamic_schema import generate_a2ui
from src.a2ui_fixed_schema import search_flights

from langchain_openai import ChatOpenAI

# model = ChatOpenAI(model="gpt-5.4-mini", model_kwargs={"parallel_tool_calls": False})

LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL")

model = ChatOpenAI(
    model="gpt-4.1",
    model_kwargs={"parallel_tool_calls": False},
    **({"base_url": LITELLM_BASE_URL} if LITELLM_BASE_URL else {}),
)

agent = create_agent(
    model=model,
    tools=[
        query_data,
        *todo_tools,
        *food_discovery_tools,
        generate_a2ui,
        search_flights,
    ],
    middleware=[
        CopilotKitMiddleware(),
        StateStreamingMiddleware(
            StateItem(state_key="todos", tool="manage_todos", tool_argument="todos")
        ),
    ],
    state_schema=AgentState,
    system_prompt="""
        You are a polished, professional demo assistant. Keep responses to 1-2 sentences.

        Tool guidance:
        - Flights: call search_flights to show flight cards with a pre-built schema.
        - Dashboards & rich UI: call generate_a2ui to create dashboard UIs with metrics,
          charts, tables, and cards. It handles rendering automatically.
        - Charts: call query_data first, then render with the chart component.
        - Todos: enable app mode first, then manage todos.
        - A2UI actions: when you see a log_a2ui_event result (e.g. "view_details"),
          respond with a brief confirmation. The UI already updated on the frontend.
        - Food discovery: when the user expresses a food mood, call start_food_discovery(intent)
          where intent is one of: healthy, comfort, light, unsure, quick, usual, explore.
          When the user picks a sub-option from the interpretation screen (e.g. "Post-workout",
          "Cheesy & indulgent"), call show_food_results(intent, sub_option) using the same
          intent. When the user wants to go back, restart, or pick a different mood, call
          reset_food_discovery. The UI updates automatically; reply with a brief confirmation.
    """,
)

graph = agent

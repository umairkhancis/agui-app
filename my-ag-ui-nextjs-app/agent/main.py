"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from copilotkit import CopilotKitMiddleware, StateStreamingMiddleware, StateItem
from langchain.agents import create_agent

# Data & state tools
from src.query import query_data
from src.todos import AgentState, todo_tools

# A2UI tools
from src.a2ui_dynamic_schema import generate_a2ui
from src.a2ui_fixed_schema import (
    discover_menu_items,
    discover_restaurants,
    search_flights,
)

from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-5.4-mini", model_kwargs={"parallel_tool_calls": False})

agent = create_agent(
    model=model,
    tools=[
        query_data,
        *todo_tools,
        generate_a2ui,
        search_flights,
        discover_restaurants,
        discover_menu_items,
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
        - Restaurants: call discover_restaurants to show a carousel of nearby
          restaurants (optionally filtered by cuisine). Then call
          discover_menu_items(restaurant_id) to show that restaurant's menu —
          use the restaurant_id from the most recent discover_restaurants result.
        - Dashboards & rich UI: call generate_a2ui to create dashboard UIs with metrics,
          charts, tables, and cards. It handles rendering automatically.
        - Charts: call query_data first, then render with the chart component.
        - Todos: enable app mode first, then manage todos.
        - A2UI actions: when you see a log_a2ui_event result (e.g. "view_details"
          or "addToCart"), respond with a brief confirmation. The UI already
          updated on the frontend.
    """,
)

graph = agent

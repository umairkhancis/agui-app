# Food discovery (Talabat) agent graph.
#
# Composes the food discovery tools, state schema, middleware, and system
# prompt into a single LangGraph `create_agent()` graph. Exposed as `graph`
# so serve.py (or langgraph dev) can import it directly.
#
# Strict isolation rule: this module must NOT import from src.demo. If you
# find yourself wanting cross-agent imports, the abstraction is wrong.

import os

from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from src.food_discovery.prompt import FOOD_DISCOVERY_SYSTEM_PROMPT
from src.food_discovery.state import FoodDiscoveryAgentState
from src.food_discovery.tools import food_discovery_tools


LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL")

_model = ChatOpenAI(
    model="gpt-4.1",
    model_kwargs={"parallel_tool_calls": False},
    **({"base_url": LITELLM_BASE_URL} if LITELLM_BASE_URL else {}),
)

graph = create_agent(
    model=_model,
    tools=food_discovery_tools,
    middleware=[CopilotKitMiddleware()],
    state_schema=FoodDiscoveryAgentState,
    system_prompt=FOOD_DISCOVERY_SYSTEM_PROMPT,
)

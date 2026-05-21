# Minimal agent graph.
#
# The simplest possible AG-UI-compatible agent: one tool, CopilotKitMiddleware,
# and a bare state schema. No A2UI, no state streaming, no todos.
# Purpose: observe raw AG-UI events without any demo machinery in the way.
#
# Strict isolation rule: this module must NOT import from src.demo or
# src.food_discovery. If you find yourself wanting cross-agent imports,
# the abstraction is wrong.

import os

from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

from src.minimal.prompt import MINIMAL_SYSTEM_PROMPT
from src.minimal.state import MinimalAgentState


LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL")

_model = ChatOpenAI(
    model="gpt-4.1",
    model_kwargs={"parallel_tool_calls": False},
    **({"base_url": LITELLM_BASE_URL} if LITELLM_BASE_URL else {}),
)


@tool
def add_numbers(a: float, b: float) -> float:
    """Add two numbers together and return the result."""
    return a + b


graph = create_agent(
    model=_model,
    tools=[add_numbers],
    middleware=[CopilotKitMiddleware()],
    state_schema=MinimalAgentState,
    system_prompt=MINIMAL_SYSTEM_PROMPT,
)

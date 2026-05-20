# Demo agent state schema.
#
# Lives alongside the demo agent's tools so the contract is one folder.
# This state is independent of any other agent's state — the food discovery
# agent has its own state schema in src/food_discovery/state.py.

from langchain.agents import AgentState as BaseAgentState

from src.demo.todos import Todo


class DemoAgentState(BaseAgentState):
    todos: list[Todo]

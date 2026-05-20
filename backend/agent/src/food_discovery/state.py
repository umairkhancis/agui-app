# Food discovery agent state schema.
#
# Lives alongside the food discovery tools so the contract is one folder.
# Independent of any other agent's state — the demo agent has its own state
# schema in src/demo/state.py.

from langchain.agents import AgentState as BaseAgentState

from src.food_discovery.types import FoodDiscoveryState


class FoodDiscoveryAgentState(BaseAgentState):
    foodDiscovery: FoodDiscoveryState | None

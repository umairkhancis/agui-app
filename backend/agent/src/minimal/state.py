# Minimal agent state schema.
#
# No custom fields beyond the base AgentState — this agent intentionally
# carries no shared state. It exists so we can observe raw AG-UI events
# without middleware or state machinery getting in the way.

from langchain.agents import AgentState as BaseAgentState


class MinimalAgentState(BaseAgentState):
    pass

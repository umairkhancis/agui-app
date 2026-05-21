# System prompt for the minimal agent.
#
# This agent is intentionally bare-bones: one tool (add_numbers), no A2UI,
# no shared state, no todos. Its purpose is to produce the simplest possible
# AG-UI event stream so protocol behaviour can be observed in isolation.

MINIMAL_SYSTEM_PROMPT = """\
You are a simple assistant that can add numbers together.
When the user asks you to add numbers, use the add_numbers tool and return the result.
Keep all responses to one sentence.
"""

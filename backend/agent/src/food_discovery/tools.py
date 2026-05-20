# Food discovery tools.
#
# Every tool returns Command(update={"foodDiscovery": ...}) so the FE
# re-renders automatically — see the v1 contract in this folder for the rule
# "tools return state updates, not raw data".

from typing import cast

from langchain.messages import ToolMessage
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command

from src.food_discovery.data import (
    INTENTS_DATA,
    IntentEntry,
    RESULTS_DATA,
    VALID_INTENTS,
)
from src.food_discovery.types import (
    ErrorScreenState,
    IntentKey,
    InterpretationData,
    InterpretationScreenState,
    ResultsScreenState,
)


def _interpretation_data(intent: IntentKey, entry: IntentEntry) -> InterpretationData:
    return InterpretationData(
        intent=intent,
        typingText=entry["typingText"],
        searchText=entry["searchText"],
        interpretation=entry["interpretation"],
        question=entry["question"],
        answers=entry["answers"],
        ctx=entry["ctx"],
    )


def _validate_intent(intent: str) -> IntentKey | None:
    if intent in INTENTS_DATA:
        return cast(IntentKey, intent)
    return None


def _error_state(message: str) -> ErrorScreenState:
    return {"screen": "error", "message": message}


@tool
def start_food_discovery(intent: str, runtime: ToolRuntime) -> Command:
    """
    Show the AI interpretation screen for a food mood. Call this when the user
    expresses a food mood (e.g. clicks 'Eating healthy', says 'I want comfort
    food', asks for something light).

    intent must be one of: healthy, comfort, light, unsure, quick, usual, explore.
    """
    valid = _validate_intent(intent)
    if valid is None:
        msg = f"Unknown intent '{intent}'. Valid intents: {', '.join(VALID_INTENTS)}."
        return Command(
            update={
                "foodDiscovery": _error_state(msg),
                "messages": [
                    ToolMessage(
                        content=msg,
                        tool_call_id=runtime.tool_call_id,
                    )
                ],
            }
        )

    entry = INTENTS_DATA[valid]
    new_state: InterpretationScreenState = {
        **_interpretation_data(valid, entry),
        "screen": "aiInterpretation",
    }

    return Command(
        update={
            "foodDiscovery": new_state,
            "messages": [
                ToolMessage(
                    content=f"Showing AI interpretation for '{valid}'. Waiting for the user to pick a sub-option.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


@tool
def show_food_results(intent: str, sub_option: str, runtime: ToolRuntime) -> Command:
    """
    Show the food results screen. Call this when the user picks a sub-option
    from the AI interpretation screen (e.g. 'Post-workout', 'Cheesy & indulgent').

    intent must be one of: healthy, comfort, light, unsure, quick, usual, explore.
    sub_option is the label of the chosen answer (e.g. 'Post-workout').
    """
    valid = _validate_intent(intent)
    if valid is None:
        msg = f"Unknown intent '{intent}'. Valid intents: {', '.join(VALID_INTENTS)}."
        return Command(
            update={
                "foodDiscovery": _error_state(msg),
                "messages": [
                    ToolMessage(
                        content=msg,
                        tool_call_id=runtime.tool_call_id,
                    )
                ],
            }
        )

    entry = INTENTS_DATA[valid]
    results = RESULTS_DATA.get(entry["resultsKey"], RESULTS_DATA["comfort"])

    new_state: ResultsScreenState = {
        **_interpretation_data(valid, entry),
        "screen": "results",
        "selectedAnswer": sub_option,
        "results": results,
    }

    return Command(
        update={
            "foodDiscovery": new_state,
            "messages": [
                ToolMessage(
                    content=f"Showing {len(results)} {valid} food cards for '{sub_option}'.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


@tool
def reset_food_discovery(runtime: ToolRuntime) -> Command:
    """
    Return to the food discovery home screen (the mood chips and explore cards).
    Call this when the user wants to go back, restart, or pick a different mood.
    """
    return Command(
        update={
            "foodDiscovery": None,
            "messages": [
                ToolMessage(
                    content="Returned to the food discovery home screen.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


@tool
def pop_food_discovery_screen(runtime: ToolRuntime) -> Command:
    """
    Pop one screen off the food-discovery stack. Call this when the user says
    'back', 'go back', 'previous', or 'take me back'.

    The tool inspects the current state and pops accordingly:
      - results          → aiInterpretation (same intent retained)
      - aiInterpretation → home (foodDiscovery = None)
      - error            → home (foodDiscovery = None)
      - None / no state  → no change

    This is the ONLY way the frontend signals back-navigation. Every food
    discovery state transition (forward AND back) goes through a tool so the
    agent's message history is a complete log of the journey.
    """
    current = runtime.state.get("foodDiscovery")
    if current is None:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content="Already at the food discovery home screen.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ]
            }
        )

    screen = current.get("screen")
    if screen == "results":
        # Downshift to the interpretation screen by keeping every
        # InterpretationData field and dropping selectedAnswer + results.
        downshifted: InterpretationScreenState = {
            "screen": "aiInterpretation",
            "intent": current["intent"],
            "typingText": current["typingText"],
            "searchText": current["searchText"],
            "interpretation": current["interpretation"],
            "question": current["question"],
            "answers": current["answers"],
            "ctx": current["ctx"],
        }
        return Command(
            update={
                "foodDiscovery": downshifted,
                "messages": [
                    ToolMessage(
                        content="Popped results → interpretation screen.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ],
            }
        )

    # aiInterpretation or error → go home.
    return Command(
        update={
            "foodDiscovery": None,
            "messages": [
                ToolMessage(
                    content=f"Popped {screen} → home screen.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


food_discovery_tools = [
    start_food_discovery,
    show_food_results,
    pop_food_discovery_screen,
    reset_food_discovery,
]

# Food discovery feature types.
#
# Mirrored on the frontend at:
#   frontend/src/components/food-discovery-canvas/types.ts
#
# Keep them in lock-step — both sides describe the same JSON shape served
# through the AG-UI protocol. Changing a field here without updating the
# mirror is a contract break.

from typing import Literal, TypedDict


IntentKey = Literal[
    "healthy", "comfort", "light", "unsure", "quick", "usual", "explore"
]


class Badge(TypedDict):
    text: str
    color: str
    bg: str


class Answer(TypedDict):
    emoji: str
    text: str
    sub: str


class IntentContext(TypedDict):
    icon: str
    title: str
    why: str


# ─── FoodCard: discriminated union by `type` ───────────────────────────────


class CardBase(TypedDict):
    emoji: str
    bg: str
    badge: Badge
    name: str
    restaurant: str
    rating: str
    time: str
    price: str


class HealthyFoodCard(CardBase):
    type: Literal["healthy"]
    calories: int
    protein: str
    carbs: str
    fat: str
    tags: list[str]


class ComfortFoodCard(CardBase):
    type: Literal["comfort"]
    descriptors: list[str]
    socialProof: str
    feel: str


class LightFoodCard(CardBase):
    type: Literal["light"]
    calories: int
    indicators: list[str]
    feel: str


class UnsureFoodCard(CardBase):
    type: Literal["unsure"]
    descriptors: list[str]
    why: str
    moodProof: str


FoodCard = HealthyFoodCard | ComfortFoodCard | LightFoodCard | UnsureFoodCard


# ─── FoodDiscoveryState: discriminated union by `screen` ───────────────────


class InterpretationData(TypedDict):
    """Fields shared by both the interpretation and results screens."""

    intent: IntentKey
    typingText: str
    searchText: str
    interpretation: str
    question: str
    answers: list[Answer]
    ctx: IntentContext


class InterpretationScreenState(InterpretationData):
    screen: Literal["aiInterpretation"]


class ResultsScreenState(InterpretationData):
    screen: Literal["results"]
    selectedAnswer: str
    results: list[FoodCard]


class ErrorScreenState(TypedDict):
    """Surfaced when a food-discovery tool can't fulfil the request (unknown
    intent, downstream lookup failure, etc.). It's a first-class state — the
    canvas renders a dedicated error view rather than silently freezing."""

    screen: Literal["error"]
    message: str


FoodDiscoveryState = (
    InterpretationScreenState | ResultsScreenState | ErrorScreenState
)

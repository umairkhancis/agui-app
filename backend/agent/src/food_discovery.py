from typing import TypedDict, Literal, NotRequired

from langchain.messages import ToolMessage
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command


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


class FoodCard(TypedDict):
    type: Literal["healthy", "comfort", "light", "unsure"]
    emoji: str
    bg: str
    badge: Badge
    name: str
    restaurant: str
    rating: str
    time: str
    price: str
    calories: NotRequired[int]
    protein: NotRequired[str]
    carbs: NotRequired[str]
    fat: NotRequired[str]
    tags: NotRequired[list[str]]
    descriptors: NotRequired[list[str]]
    socialProof: NotRequired[str]
    feel: NotRequired[str]
    indicators: NotRequired[list[str]]
    why: NotRequired[str]
    moodProof: NotRequired[str]


class FoodDiscoveryState(TypedDict, total=False):
    screen: Literal["aiInterpretation", "results"]
    intent: str
    typingText: str
    searchText: str
    interpretation: str
    question: str
    answers: list[Answer]
    selectedAnswer: str | None
    context: IntentContext | None
    results: list[FoodCard]


class IntentEntry(TypedDict):
    typingText: str
    searchText: str
    interpretation: str
    question: str
    answers: list[Answer]
    resultsKey: str
    ctx: IntentContext


INTENTS_DATA: dict[str, IntentEntry] = {
    "healthy": {
        "typingText": "Eating healthy today",
        "searchText": "Eating healthy",
        "interpretation": "I'm hearing <strong>nourishing and intentional</strong>. You want food that actually does something for you, not just fills you up.",
        "question": "What's driving the healthy today?",
        "answers": [
            {"emoji": "💪", "text": "Post-workout", "sub": "Protein & recovery"},
            {"emoji": "🎯", "text": "Hitting macros", "sub": "Tracking calories"},
            {"emoji": "🌿", "text": "Just eating clean", "sub": "No specific goal"},
            {"emoji": "🩺", "text": "Doctor's orders", "sub": "Specific restrictions"},
        ],
        "resultsKey": "healthy",
        "ctx": {
            "icon": "🥗",
            "title": "Healthy picks for you",
            "why": "Showing macros & health tags because you're eating with intent — calories, protein, carbs, fat upfront.",
        },
    },
    "comfort": {
        "typingText": "Comfort food, something warm",
        "searchText": "Comfort food",
        "interpretation": "Sounds like you need <strong>something that feels like a hug</strong>. Food that hits different when you need it most.",
        "question": "What kind of comfort are we talking?",
        "answers": [
            {"emoji": "🍜", "text": "Warm & heavy", "sub": "Soups, stews, rice"},
            {"emoji": "🧀", "text": "Cheesy & indulgent", "sub": "Pizza, pasta, melts"},
            {"emoji": "🍟", "text": "The classics", "sub": "Burgers, fries"},
            {"emoji": "🎲", "text": "Surprise me", "sub": "You pick"},
        ],
        "resultsKey": "comfort",
        "ctx": {
            "icon": "🧡",
            "title": "Comfort food that delivers",
            "why": "Showing mood ratings & social proof — because comfort food is emotional, not functional. These are dishes people reach for when it matters.",
        },
    },
    "light": {
        "typingText": "Something light, not too heavy",
        "searchText": "Light & fresh",
        "interpretation": "Got it — <strong>easy on the stomach</strong>. Something that won't slow you down. Calories are front and centre here.",
        "question": "Light in what way?",
        "answers": [
            {"emoji": "🥗", "text": "Fresh salads", "sub": "Crisp & crunchy"},
            {"emoji": "🍱", "text": "Small plates", "sub": "Tapas, bites, mezze"},
            {"emoji": "🍵", "text": "Soups & broths", "sub": "Warm but gentle"},
            {"emoji": "🥙", "text": "Wraps & bowls", "sub": "Balanced & portable"},
        ],
        "resultsKey": "light",
        "ctx": {
            "icon": "🌿",
            "title": "Light & easy",
            "why": "Calories shown big because that's what matters here — not macros, not reviews. Easy-to-digest signals front and centre.",
        },
    },
    "unsure": {
        "typingText": "Not really sure what I want…",
        "searchText": "Help me decide",
        "interpretation": "No problem — <strong>not knowing is actually useful</strong>. One question and I'll narrow it down.",
        "question": "What's your mood right now?",
        "answers": [
            {"emoji": "😴", "text": "Tired & hungry", "sub": "Need fuel, fast"},
            {"emoji": "🎉", "text": "Treating myself", "sub": "Something special"},
            {"emoji": "😌", "text": "Keeping it simple", "sub": "Easy and familiar"},
            {"emoji": "🌟", "text": "Feeling adventurous", "sub": "Try something new"},
        ],
        "resultsKey": "unsure",
        "ctx": {
            "icon": "✨",
            "title": "Picked for your mood",
            "why": "Mixed view — flexible, comfort, and nourishing options, because when you're unsure, one card type isn't enough.",
        },
    },
    "quick": {
        "typingText": "Fast, I need it now",
        "searchText": "Quick delivery",
        "interpretation": "<strong>Speed is the priority.</strong> Everything here arrives in under 25 minutes. Delivery time leads every card.",
        "question": "Quick — but any preference?",
        "answers": [
            {"emoji": "🍔", "text": "Fast food", "sub": "Always quick"},
            {"emoji": "🍕", "text": "Pizza", "sub": "Hot & fast"},
            {"emoji": "🥡", "text": "Asian", "sub": "Noodles, rice"},
            {"emoji": "🥗", "text": "Healthy", "sub": "Quick & clean"},
        ],
        "resultsKey": "healthy",
        "ctx": {
            "icon": "⚡",
            "title": "Fast & reliable",
            "why": "Sorted by delivery time. Delivery ETA is the most important attribute — everything else is secondary.",
        },
    },
    "usual": {
        "typingText": "The usual",
        "searchText": "My usual",
        "interpretation": "Going with <strong>what you know and love</strong>. Based on your history — here are your top picks.",
        "question": "Same as always, or mix it up?",
        "answers": [
            {"emoji": "🔁", "text": "Exactly the same", "sub": "Repeat last order"},
            {"emoji": "✨", "text": "Something similar", "sub": "Small variation"},
            {"emoji": "🆕", "text": "New but familiar", "sub": "Same cuisine, new dish"},
            {"emoji": "🎲", "text": "Surprise me", "sub": "Complete wildcard"},
        ],
        "resultsKey": "comfort",
        "ctx": {
            "icon": "🔁",
            "title": "Your go-tos",
            "why": "Based on your order history. Comfort attributes shown — you already know these dishes, so the question is feeling, not information.",
        },
    },
    "explore": {
        "typingText": "Exploring options…",
        "searchText": "Explore",
        "interpretation": "Let's find something <strong>worth being excited about</strong>. What direction should we go?",
        "question": "What sounds good right now?",
        "answers": [
            {"emoji": "🌍", "text": "World flavors", "sub": "Something international"},
            {"emoji": "💚", "text": "Healthy & good", "sub": "Nutritious options"},
            {"emoji": "🔥", "text": "Comfort & indulgent", "sub": "Treat yourself"},
            {"emoji": "⚡", "text": "Fast & reliable", "sub": "Quick delivery"},
        ],
        "resultsKey": "comfort",
        "ctx": {
            "icon": "🌍",
            "title": "Worth trying today",
            "why": "Curated by what's popular and highly rated right now.",
        },
    },
}


RESULTS_DATA: dict[str, list[FoodCard]] = {
    "healthy": [
        {
            "type": "healthy",
            "emoji": "🥗",
            "bg": "linear-gradient(135deg,#D1FAE5,#6EE7B7)",
            "badge": {"text": "Macro match", "color": "#16A34A", "bg": "#DCFCE7"},
            "name": "Grilled Chicken Power Bowl",
            "restaurant": "Clean Kitchen Co.",
            "rating": "4.8",
            "calories": 420,
            "protein": "38g",
            "carbs": "32g",
            "fat": "12g",
            "tags": ["High Protein", "Low Carb", "Gluten Free"],
            "time": "18 min",
            "price": "AED 52",
        },
        {
            "type": "healthy",
            "emoji": "🐟",
            "bg": "linear-gradient(135deg,#FEF3C7,#FDE68A)",
            "badge": {"text": "Top rated", "color": "#D97706", "bg": "#FEF9C3"},
            "name": "Salmon & Quinoa Bowl",
            "restaurant": "The Wellness Table",
            "rating": "4.9",
            "calories": 510,
            "protein": "42g",
            "carbs": "38g",
            "fat": "18g",
            "tags": ["Omega-3", "High Fiber", "Dairy Free"],
            "time": "22 min",
            "price": "AED 68",
        },
        {
            "type": "healthy",
            "emoji": "🥙",
            "bg": "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
            "badge": {"text": "Fastest", "color": "#2563EB", "bg": "#DBEAFE"},
            "name": "Mediterranean Wrap",
            "restaurant": "Fresh & Go",
            "rating": "4.6",
            "calories": 380,
            "protein": "28g",
            "carbs": "42g",
            "fat": "10g",
            "tags": ["Balanced", "Whole Grain", "Low Fat"],
            "time": "14 min",
            "price": "AED 38",
        },
    ],
    "comfort": [
        {
            "type": "comfort",
            "emoji": "🍛",
            "bg": "linear-gradient(135deg,#FEE2E2,#FECACA)",
            "badge": {"text": "❤️ Most loved", "color": "#DC2626", "bg": "#FEF2F2"},
            "name": "Creamy Butter Chicken",
            "restaurant": "Spice Garden",
            "rating": "4.9",
            "descriptors": ["Rich", "Creamy", "Warming"],
            "socialProof": '"Ordered this on my worst day and it helped." — 847 people agree',
            "feel": "🧡  9 out of 10 say this lifted their mood",
            "time": "25 min",
            "price": "AED 55",
        },
        {
            "type": "comfort",
            "emoji": "🍕",
            "bg": "linear-gradient(135deg,#FFF7ED,#FED7AA)",
            "badge": {"text": "📈 Trending", "color": "#EA580C", "bg": "#FFF7ED"},
            "name": "Four Cheese Pizza",
            "restaurant": "Mama Rosa's",
            "rating": "4.8",
            "descriptors": ["Cheesy", "Gooey", "Indulgent"],
            "socialProof": '"The cheese pull is unreal." — 1.2K orders this week',
            "feel": "🔥  Currently trending for a reason",
            "time": "30 min",
            "price": "AED 75",
        },
        {
            "type": "comfort",
            "emoji": "🍔",
            "bg": "linear-gradient(135deg,#F3F4F6,#E5E7EB)",
            "badge": {"text": "⚡ Quick comfort", "color": "#374151", "bg": "#F3F4F6"},
            "name": "Smash Burger & Fries",
            "restaurant": "Patty Lab",
            "rating": "4.7",
            "descriptors": ["Juicy", "Crispy", "Classic"],
            "socialProof": '"Exactly what comfort food should be." — 2.1K orders',
            "feel": "⚡  Ready in 20 min — comfort, fast",
            "time": "20 min",
            "price": "AED 62",
        },
    ],
    "light": [
        {
            "type": "light",
            "emoji": "🥗",
            "bg": "linear-gradient(135deg,#ECFDF5,#A7F3D0)",
            "badge": {"text": "310 kcal", "color": "#2563EB", "bg": "#DBEAFE"},
            "name": "Niçoise Salad",
            "restaurant": "Café Légère",
            "rating": "4.8",
            "calories": 310,
            "indicators": ["✓ Low calorie", "✓ High fiber", "✓ Fresh today"],
            "feel": "Light but satisfying",
            "time": "15 min",
            "price": "AED 42",
        },
        {
            "type": "light",
            "emoji": "🍵",
            "bg": "linear-gradient(135deg,#FEF9C3,#FEF08A)",
            "badge": {"text": "220 kcal", "color": "#2563EB", "bg": "#DBEAFE"},
            "name": "Miso Soup & Edamame Set",
            "restaurant": "Umami House",
            "rating": "4.7",
            "calories": 220,
            "indicators": ["✓ Very light", "✓ Probiotic", "✓ Plant-based"],
            "feel": "Gentle on the stomach",
            "time": "12 min",
            "price": "AED 35",
        },
        {
            "type": "light",
            "emoji": "🥑",
            "bg": "linear-gradient(135deg,#EFF6FF,#BFDBFE)",
            "badge": {"text": "380 kcal", "color": "#2563EB", "bg": "#DBEAFE"},
            "name": "Avocado Toast & Egg",
            "restaurant": "Morning Table",
            "rating": "4.9",
            "calories": 380,
            "indicators": ["✓ Whole grain", "✓ Good fats", "✓ No added sugar"],
            "feel": "Energizing, not heavy",
            "time": "18 min",
            "price": "AED 45",
        },
    ],
    "unsure": [
        {
            "type": "unsure",
            "emoji": "🍱",
            "bg": "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
            "badge": {"text": "✦ AI pick", "color": "#7C3AED", "bg": "#F5F3FF"},
            "name": "Build Your Own Bowl",
            "restaurant": "The Kitchen Lab",
            "rating": "4.8",
            "descriptors": ["Flexible", "Customizable", "Satisfying"],
            "why": "When you're not sure, customisable always wins — start anywhere and adjust.",
            "moodProof": "✨  94% of undecided users rated this 5 stars",
            "time": "20 min",
            "price": "AED 55",
        },
        {
            "type": "comfort",
            "emoji": "🍜",
            "bg": "linear-gradient(135deg,#FEE2E2,#FECACA)",
            "badge": {"text": "❤️ Most loved", "color": "#DC2626", "bg": "#FEF2F2"},
            "name": "Creamy Butter Chicken",
            "restaurant": "Spice Garden",
            "rating": "4.9",
            "descriptors": ["Rich", "Creamy", "Warming"],
            "socialProof": '"Ordered this on my worst day and it helped." — 847 people agree',
            "feel": "🧡  9 out of 10 say this lifted their mood",
            "time": "25 min",
            "price": "AED 55",
        },
        {
            "type": "healthy",
            "emoji": "🥗",
            "bg": "linear-gradient(135deg,#D1FAE5,#6EE7B7)",
            "badge": {"text": "Balanced", "color": "#16A34A", "bg": "#DCFCE7"},
            "name": "Grilled Chicken Power Bowl",
            "restaurant": "Clean Kitchen Co.",
            "rating": "4.8",
            "calories": 420,
            "protein": "38g",
            "carbs": "32g",
            "fat": "12g",
            "tags": ["High Protein", "Low Carb", "Gluten Free"],
            "time": "18 min",
            "price": "AED 52",
        },
    ],
}


VALID_INTENTS = list(INTENTS_DATA.keys())


@tool
def start_food_discovery(intent: str, runtime: ToolRuntime) -> Command:
    """
    Show the AI interpretation screen for a food mood. Call this when the user
    expresses a food mood (e.g. clicks 'Eating healthy', says 'I want comfort
    food', asks for something light).

    intent must be one of: healthy, comfort, light, unsure, quick, usual, explore.
    """
    entry = INTENTS_DATA.get(intent)
    if entry is None:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=f"Unknown intent '{intent}'. Valid intents: {', '.join(VALID_INTENTS)}.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ]
            }
        )

    new_state: FoodDiscoveryState = {
        "screen": "aiInterpretation",
        "intent": intent,
        "typingText": entry["typingText"],
        "searchText": entry["searchText"],
        "interpretation": entry["interpretation"],
        "question": entry["question"],
        "answers": entry["answers"],
        "selectedAnswer": None,
        "context": None,
        "results": [],
    }

    return Command(
        update={
            "foodDiscovery": new_state,
            "messages": [
                ToolMessage(
                    content=f"Showing AI interpretation for '{intent}'. Waiting for the user to pick a sub-option.",
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
    entry = INTENTS_DATA.get(intent)
    if entry is None:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=f"Unknown intent '{intent}'. Valid intents: {', '.join(VALID_INTENTS)}.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ]
            }
        )

    results = RESULTS_DATA.get(entry["resultsKey"], RESULTS_DATA["comfort"])

    new_state: FoodDiscoveryState = {
        "screen": "results",
        "intent": intent,
        "typingText": entry["typingText"],
        "searchText": entry["searchText"],
        "interpretation": entry["interpretation"],
        "question": entry["question"],
        "answers": entry["answers"],
        "selectedAnswer": sub_option,
        "context": entry["ctx"],
        "results": results,
    }

    return Command(
        update={
            "foodDiscovery": new_state,
            "messages": [
                ToolMessage(
                    content=f"Showing {len(results)} {intent} food cards for '{sub_option}'.",
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


food_discovery_tools = [
    start_food_discovery,
    show_food_results,
    reset_food_discovery,
]

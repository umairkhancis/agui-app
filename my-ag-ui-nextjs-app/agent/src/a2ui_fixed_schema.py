"""
Fixed-schema A2UI tools.

Each tool loads a pre-built component schema from JSON and supplies only the
data — the layout is fixed.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import TypedDict

from copilotkit import a2ui
from langchain.tools import tool

from food.catalog import list_menu_items, list_restaurants

CATALOG_ID = "copilotkit://app-dashboard-catalog"

_SCHEMAS_DIR = Path(__file__).parent / "a2ui" / "schemas"
_UI_SCHEMA_DIR = Path(__file__).resolve().parent.parent.parent / "ui-schema"

FLIGHT_SCHEMA = a2ui.load_schema(_SCHEMAS_DIR / "flight_schema.json")
RESTAURANTS_SCHEMA = a2ui.load_schema(_UI_SCHEMA_DIR / "restaurants_discovery.json")
MENU_ITEMS_SCHEMA = a2ui.load_schema(_UI_SCHEMA_DIR / "items_discovery.json")

FLIGHTS_SURFACE_ID = "flight-search-results"
RESTAURANTS_SURFACE_ID = "restaurants-discovery"
MENU_ITEMS_SURFACE_ID = "menu-items-discovery"


class Flight(TypedDict):
    id: str
    airline: str
    airlineLogo: str
    flightNumber: str
    origin: str
    destination: str
    date: str
    departureTime: str
    arrivalTime: str
    duration: str
    status: str
    statusIcon: str
    price: str


@tool
def search_flights(flights: list[Flight]) -> str:
    """Search for flights and display the results as rich cards. Return exactly 2 flights.

    Each flight must have: id, airline (e.g. "United Airlines"),
    airlineLogo (use Google favicon API: https://www.google.com/s2/favicons?domain={airline_domain}&sz=128
    e.g. "https://www.google.com/s2/favicons?domain=united.com&sz=128" for United,
    "https://www.google.com/s2/favicons?domain=delta.com&sz=128" for Delta,
    "https://www.google.com/s2/favicons?domain=aa.com&sz=128" for American,
    "https://www.google.com/s2/favicons?domain=alaskaair.com&sz=128" for Alaska),
    flightNumber, origin, destination,
    date (short readable format like "Tue, Mar 18" — use near-future dates),
    departureTime, arrivalTime,
    duration (e.g. "4h 25m"), status (e.g. "On Time" or "Delayed"),
    statusIcon (colored dot: use "https://placehold.co/12/22c55e/22c55e.png"
    for On Time, "https://placehold.co/12/eab308/eab308.png" for Delayed,
    "https://placehold.co/12/ef4444/ef4444.png" for Cancelled),
    and price (e.g. "$289").
    """
    return a2ui.render(
        operations=[
            a2ui.create_surface(FLIGHTS_SURFACE_ID, catalog_id=CATALOG_ID),
            a2ui.update_components(FLIGHTS_SURFACE_ID, FLIGHT_SCHEMA),
            a2ui.update_data_model(FLIGHTS_SURFACE_ID, {"flights": flights}),
        ],
    )


# ── Food delivery ────────────────────────────────────────────────────────

_PRICE_RE = re.compile(r"(\d+(?:\.\d+)?)")

# loremflickr returns a (Creative Commons) Flickr photo matching the tag(s).
# `/all` makes it require every tag; `?lock=N` makes the result deterministic
# per id so a restaurant/item always gets the same image.
_LOREMFLICKR = "https://loremflickr.com/640/360/{tags}/all?lock={lock}"

_CUISINE_TAGS: dict[str, str] = {
    "Lebanese": "shawarma,food",
    "Italian": "pasta,italian",
    "Burgers": "burger",
    "Indian": "curry,indian",
    "Chinese": "noodles,chinese",
    "Japanese": "sushi,japanese",
    "Mexican": "tacos,mexican",
    "Thai": "thai,food",
    "American Diner": "breakfast,diner",
    "Healthy": "salad,bowl",
}

# Ordered: most specific keyword first. First match wins.
_ITEM_TAG_RULES: list[tuple[str, str]] = [
    ("pizza", "pizza"),
    ("burger", "burger"),
    ("shawarma", "shawarma"),
    ("falafel", "falafel"),
    ("hummus", "hummus"),
    ("kebab", "kebab"),
    ("kafta", "kebab"),
    ("manakish", "flatbread"),
    ("naan", "naan"),
    ("roti", "naan"),
    ("biryani", "biryani"),
    ("curry", "curry"),
    ("tikka", "curry"),
    ("masala", "curry"),
    ("dal", "lentils"),
    ("samosa", "samosa"),
    ("pakora", "fritters"),
    ("bhaji", "fritters"),
    ("baklava", "baklava"),
    ("knafeh", "dessert"),
    ("ramen", "ramen"),
    ("sushi", "sushi"),
    ("sashimi", "sashimi"),
    ("nigiri", "sushi"),
    ("roll", "sushi"),
    ("tonkatsu", "tonkatsu"),
    ("katsu", "katsu"),
    ("teriyaki", "teriyaki"),
    ("tempura", "tempura"),
    ("gyoza", "dumplings"),
    ("dumpling", "dumplings"),
    ("noodle", "noodles"),
    ("lo mein", "noodles"),
    ("chow mein", "noodles"),
    ("pad thai", "padthai"),
    ("pad see", "noodles"),
    ("tom yum", "soup"),
    ("tom kha", "soup"),
    ("som tum", "salad"),
    ("larb", "salad"),
    ("spring roll", "springrolls"),
    ("satay", "satay"),
    ("dim sum", "dimsum"),
    ("char siu", "barbecue"),
    ("peking", "duck"),
    ("kung pao", "stirfry"),
    ("mongolian", "stirfry"),
    ("mapo", "tofu"),
    ("tofu", "tofu"),
    ("taco", "tacos"),
    ("burrito", "burrito"),
    ("quesadilla", "quesadilla"),
    ("enchilada", "enchiladas"),
    ("fajita", "fajitas"),
    ("nachos", "nachos"),
    ("guacamole", "guacamole"),
    ("churros", "churros"),
    ("tres leches", "cake"),
    ("flan", "flan"),
    ("horchata", "drink"),
    ("agua fresca", "drink"),
    ("pasta", "pasta"),
    ("spaghetti", "spaghetti"),
    ("ravioli", "ravioli"),
    ("risotto", "risotto"),
    ("lasagna", "lasagna"),
    ("gnocchi", "gnocchi"),
    ("fettuccine", "pasta"),
    ("tagliatelle", "pasta"),
    ("penne", "pasta"),
    ("carbonara", "pasta"),
    ("bolognese", "pasta"),
    ("tiramisu", "tiramisu"),
    ("panna cotta", "dessert"),
    ("cannoli", "cannoli"),
    ("affogato", "dessert"),
    ("bruschetta", "bruschetta"),
    ("caprese", "salad"),
    ("burrata", "cheese"),
    ("antipasto", "platter"),
    ("arancini", "fried"),
    ("salad", "salad"),
    ("soup", "soup"),
    ("wings", "wings"),
    ("wing", "wings"),
    ("fries", "fries"),
    ("onion ring", "onionrings"),
    ("milkshake", "milkshake"),
    ("shake", "milkshake"),
    ("sundae", "icecream"),
    ("brownie", "brownie"),
    ("cheesecake", "cheesecake"),
    ("apple pie", "applepie"),
    ("cobb", "salad"),
    ("caesar", "salad"),
    ("greek", "salad"),
    ("quinoa", "quinoa"),
    ("buddha", "bowl"),
    ("poke", "pokebowl"),
    ("acai", "acaibowl"),
    ("smoothie", "smoothie"),
    ("wrap", "wrap"),
    ("club sandwich", "sandwich"),
    ("reuben", "sandwich"),
    ("blt", "sandwich"),
    ("grilled cheese", "sandwich"),
    ("tuna melt", "sandwich"),
    ("patty melt", "sandwich"),
    ("sandwich", "sandwich"),
    ("avocado toast", "avocadotoast"),
    ("toast", "toast"),
    ("pancake", "pancakes"),
    ("waffle", "waffles"),
    ("french toast", "frenchtoast"),
    ("eggs benedict", "eggs"),
    ("omelette", "omelette"),
    ("breakfast burrito", "breakfast"),
    ("steak", "steak"),
    ("chicken", "chicken"),
    ("fish", "fish"),
    ("shrimp", "shrimp"),
    ("prawn", "prawns"),
    ("squid", "calamari"),
    ("duck", "duck"),
    ("lamb", "lamb"),
    ("beef", "beef"),
    ("pork", "pork"),
    ("rice", "rice"),
    ("mac & cheese", "macandcheese"),
    ("coleslaw", "coleslaw"),
    ("cauliflower", "cauliflower"),
    ("zucchini", "zucchini"),
    ("pumpkin", "pumpkin"),
    ("lentil", "lentils"),
    ("chia", "chia"),
    ("energy ball", "snack"),
    ("matcha", "matcha"),
    ("juice", "juice"),
    ("chai", "tea"),
    ("tea", "tea"),
    ("coffee", "coffee"),
    ("lassi", "drink"),
    ("lemonade", "lemonade"),
    ("coconut", "coconut"),
    ("mango", "mango"),
    ("strawberry", "strawberry"),
    ("vanilla", "icecream"),
    ("chocolate", "chocolate"),
    ("caramel", "caramel"),
    ("ramune", "soda"),
    ("bubble tea", "bubbletea"),
    ("kulfi", "icecream"),
    ("gulab jamun", "dessert"),
    ("kheer", "dessert"),
    ("mochi", "mochi"),
    ("ice cream", "icecream"),
]


def _stable_lock(value: str) -> int:
    """Deterministic positive int from a string (independent of Python hash seed)."""
    h = 0
    for ch in value:
        h = (h * 131 + ord(ch)) % 100000
    return h


def _restaurant_image(row: dict) -> str:
    tags = _CUISINE_TAGS.get(row["cuisine"], "restaurant,food")
    return _LOREMFLICKR.format(tags=tags, lock=_stable_lock(row["id"]))


_ITEM_TAG_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(rf"\b{re.escape(needle)}\b"), tag)
    for needle, tag in _ITEM_TAG_RULES
]


def _item_image(item: dict) -> str:
    name = item["name"].lower()
    tags = "food"
    for pattern, tag in _ITEM_TAG_PATTERNS:
        if pattern.search(name):
            tags = tag
            break
    return _LOREMFLICKR.format(tags=tags, lock=_stable_lock(item["id"]))


def _restaurant_card(row: dict) -> dict:
    rid = row["id"]
    rating = float(row["rating"])
    return {
        "id": rid,
        "name": row["name"],
        "cuisine": row["cuisine"],
        "imageUrl": _restaurant_image(row),
        "stars": f"{rating:.1f} ★",
        # Synthetic but plausible review count derived deterministically from id.
        "reviewCount": int(round(rating * 100 + (_stable_lock(rid) % 400))),
    }


def _menu_item_card(item: dict) -> dict:
    m = _PRICE_RE.search(item.get("price") or "")
    price = float(m.group(1)) if m else 0.0
    return {
        "id": item["id"],
        "name": item["name"],
        "description": item["description"],
        "price": price,
        "imageUrl": _item_image(item),
    }


@tool
def discover_restaurants(cuisine: str | None = None) -> str:
    """Show a horizontal carousel of nearby restaurants.

    Optional `cuisine` filters by cuisine name (e.g. "Lebanese", "Italian",
    "Burgers", "Indian", "Chinese", "Japanese", "Mexican", "Thai", "Healthy").
    Use this whenever the user wants to browse or find restaurants.
    """
    rows = list_restaurants(cuisine=cuisine, limit=8)
    restaurants = [_restaurant_card(r) for r in rows]
    return a2ui.render(
        operations=[
            a2ui.create_surface(RESTAURANTS_SURFACE_ID, catalog_id=CATALOG_ID),
            a2ui.update_components(RESTAURANTS_SURFACE_ID, RESTAURANTS_SCHEMA),
            a2ui.update_data_model(
                RESTAURANTS_SURFACE_ID, {"restaurants": restaurants}
            ),
        ],
    )


@tool
def discover_menu_items(restaurant_id: str) -> str:
    """Show a horizontal carousel of menu items for a single restaurant.

    `restaurant_id` is the id returned by `discover_restaurants` (e.g. "r-001").
    Call this after the user picks a restaurant or asks to see its menu.
    """
    rows = list_menu_items(restaurant_id, limit=10)
    items = [_menu_item_card(i) for i in rows]
    return a2ui.render(
        operations=[
            a2ui.create_surface(MENU_ITEMS_SURFACE_ID, catalog_id=CATALOG_ID),
            a2ui.update_components(MENU_ITEMS_SURFACE_ID, MENU_ITEMS_SCHEMA),
            a2ui.update_data_model(
                MENU_ITEMS_SURFACE_ID, {"menuItems": items}
            ),
        ],
    )

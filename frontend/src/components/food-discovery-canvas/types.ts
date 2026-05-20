// TypeScript mirror of backend/agent/src/food_discovery.py.
// Keep this file in lock-step with the Python TypedDicts — both sides describe
// the same JSON shape, served through the AG-UI protocol.

export type IntentKey =
  | "healthy"
  | "comfort"
  | "light"
  | "unsure"
  | "quick"
  | "usual"
  | "explore";

// ─── Primitives ────────────────────────────────────────────────────────────

export interface Badge {
  text: string;
  color: string;
  bg: string;
}

export interface Answer {
  emoji: string;
  text: string;
  sub: string;
}

export interface IntentContext {
  icon: string;
  title: string;
  why: string;
}

// ─── FoodCard: discriminated union by `type` ───────────────────────────────

interface CardBase {
  emoji: string;
  bg: string;
  badge: Badge;
  name: string;
  restaurant: string;
  rating: string;
  time: string;
  price: string;
}

export interface HealthyFoodCard extends CardBase {
  type: "healthy";
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  tags: string[];
}

export interface ComfortFoodCard extends CardBase {
  type: "comfort";
  descriptors: string[];
  socialProof: string;
  feel: string;
}

export interface LightFoodCard extends CardBase {
  type: "light";
  calories: number;
  indicators: string[];
  feel: string;
}

export interface UnsureFoodCard extends CardBase {
  type: "unsure";
  descriptors: string[];
  why: string;
  moodProof: string;
}

export type FoodCard =
  | HealthyFoodCard
  | ComfortFoodCard
  | LightFoodCard
  | UnsureFoodCard;

// ─── FoodDiscoveryState: discriminated union by `screen` ───────────────────

export interface InterpretationData {
  intent: IntentKey;
  typingText: string;
  searchText: string;
  interpretation: string;
  question: string;
  answers: Answer[];
  ctx: IntentContext;
}

export interface InterpretationScreenState extends InterpretationData {
  screen: "aiInterpretation";
}

export interface ResultsScreenState extends InterpretationData {
  screen: "results";
  selectedAnswer: string;
  results: FoodCard[];
}

// Surfaced when a food-discovery tool can't fulfil the request (unknown
// intent, downstream lookup failure). First-class state — the canvas
// renders a dedicated error view rather than silently freezing.
export interface ErrorScreenState {
  screen: "error";
  message: string;
}

export type FoodDiscoveryState =
  | InterpretationScreenState
  | ResultsScreenState
  | ErrorScreenState;

// ─── Agent state envelope (what the agent owns) ────────────────────────────

export interface AgentState {
  foodDiscovery: FoodDiscoveryState | null;
  // Other shared-state fields (todos, etc.) exist on the agent but are owned
  // by other demos — this canvas only cares about foodDiscovery.
}

// ─── Frontend-only types (presenter contract) ──────────────────────────────
//
// IMPORTANT: these types carry NO intent semantics (no typingText, no
// searchText, no interpretation text). Those fields live in INTENTS_DATA on
// the backend and arrive on `state.foodDiscovery` once the agent's tool
// resolves. The frontend is allowed to carry:
//   - the `intent` key (so the agent knows which mood the user picked)
//   - the user-facing `message` text (the actual user input — FE writes,
//     doesn't predict)
//   - purely visual fields (label, gradient, variant, emoji)
// Anything else creates a second source of truth that has to stay in sync.

export type PendingTransition =
  | {
      toScreen: "aiInterpretation";
      intent: IntentKey;
    }
  | {
      toScreen: "results";
      intent: IntentKey;
      selectedAnswer: string;
    };

export interface MoodPickPayload {
  intent: IntentKey;
  message: string;
}

export type ChipVariant =
  | "unsure"
  | "healthy"
  | "comfort"
  | "light"
  | "default";

export interface ChipItem {
  id: string;
  label: string;
  variant: ChipVariant;
  intent: IntentKey;
  message: string;
}

export interface CardItem {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  intent: IntentKey;
  message: string;
}

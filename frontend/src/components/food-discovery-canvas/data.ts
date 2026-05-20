// Static configuration data for the home screen. Lives outside the React
// component tree so it isn't recreated on every render.
//
// Each entry carries ONLY frontend concerns:
//   - id / label / variant / gradient / emoji  → purely visual
//   - intent                                    → the key the agent will use
//   - message                                   → the user text we'll send
//
// Intent semantics (typingText, searchText, interpretation, answers, ctx)
// live on the backend in INTENTS_DATA. The FE never predicts those — they
// arrive on `state.foodDiscovery` once the agent's tool resolves.

import type { CardItem, ChipItem, ChipVariant } from "./types";

export const chips: ChipItem[] = [
  {
    id: "unsure",
    label: "✦ Not sure",
    variant: "unsure",
    intent: "unsure",
    message: "I'm not sure what to eat today, help me decide!",
  },
  {
    id: "healthy",
    label: "🥗 Healthy",
    variant: "healthy",
    intent: "healthy",
    message: "I'm in the mood for something healthy today.",
  },
  {
    id: "comfort",
    label: "🍜 Comfort food",
    variant: "comfort",
    intent: "comfort",
    message: "I want comfort food today.",
  },
  {
    id: "light",
    label: "🌿 Light",
    variant: "light",
    intent: "light",
    message: "I'm looking for something light to eat.",
  },
  {
    id: "quick",
    label: "⚡ Quick",
    variant: "default",
    intent: "quick",
    message: "I need something quick to eat.",
  },
  {
    id: "usual",
    label: "🔁 My usual",
    variant: "default",
    intent: "usual",
    message: "Show me my usual food choices.",
  },
];

export const cards: CardItem[] = [
  {
    id: "eating-healthy",
    emoji: "🥗",
    label: "Eating healthy",
    gradient: "linear-gradient(135deg,#D1FAE5,#A7F3D0)",
    intent: "healthy",
    message: "Help me find healthy food options.",
  },
  {
    id: "comfort-food",
    emoji: "🍕",
    label: "Comfort food",
    gradient: "linear-gradient(135deg,#FEE2E2,#FECACA)",
    intent: "comfort",
    message: "I want comfort food today.",
  },
  {
    id: "light-fresh",
    emoji: "🥑",
    label: "Light & fresh",
    gradient: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    intent: "light",
    message: "I'm looking for something light and fresh.",
  },
  {
    id: "surprise",
    emoji: "✨",
    label: "Surprise me",
    gradient: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    intent: "explore",
    message: "Surprise me — explore some options for me.",
  },
];

export const chipStyles: Record<ChipVariant, React.CSSProperties> = {
  unsure: { borderColor: "#C4B5FD", color: "#7C3AED", background: "#F5F3FF" },
  healthy: { borderColor: "#86EFAC", color: "#16A34A", background: "white" },
  comfort: { borderColor: "#FCA5A5", color: "#DC2626", background: "white" },
  light: { borderColor: "#93C5FD", color: "#2563EB", background: "white" },
  default: { borderColor: "#E5E5E5", color: "#404040", background: "white" },
};

export const chipHoverBg: Record<ChipVariant, string> = {
  unsure: "#EDE9FE",
  healthy: "#F0FDF4",
  comfort: "#FFF5F5",
  light: "#EFF6FF",
  default: "#F4F4F4",
};

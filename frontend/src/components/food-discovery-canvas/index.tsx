"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { useCallback } from "react";

// ── Chip data ──────────────────────────────────────────────────────────────
type ChipVariant = "unsure" | "healthy" | "comfort" | "light" | "default";

interface ChipItem {
  id: string;
  label: string;
  variant: ChipVariant;
  message: string;
}

const chips: ChipItem[] = [
  {
    id: "unsure",
    label: "✦ Not sure",
    variant: "unsure",
    message: "I'm not sure what to eat today, help me decide!",
  },
  {
    id: "healthy",
    label: "🥗 Healthy",
    variant: "healthy",
    message: "I'm in the mood for something healthy today.",
  },
  {
    id: "comfort",
    label: "🍜 Comfort food",
    variant: "comfort",
    message: "I want comfort food today.",
  },
  {
    id: "light",
    label: "🌿 Light",
    variant: "light",
    message: "I'm looking for something light to eat.",
  },
  {
    id: "quick",
    label: "⚡ Quick",
    variant: "default",
    message: "I need something quick to eat.",
  },
  {
    id: "usual",
    label: "🔁 My usual",
    variant: "default",
    message: "Show me my usual food choices.",
  },
];

// ── Card data ──────────────────────────────────────────────────────────────
interface CardItem {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  message: string;
}

const cards: CardItem[] = [
  {
    id: "eating-healthy",
    emoji: "🥗",
    label: "Eating healthy",
    gradient: "linear-gradient(135deg,#D1FAE5,#A7F3D0)",
    message: "Help me find healthy food options.",
  },
  {
    id: "comfort-food",
    emoji: "🍕",
    label: "Comfort food",
    gradient: "linear-gradient(135deg,#FEE2E2,#FECACA)",
    message: "I want comfort food today.",
  },
  {
    id: "light-fresh",
    emoji: "🥑",
    label: "Light & fresh",
    gradient: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    message: "I'm looking for something light and fresh.",
  },
  {
    id: "surprise",
    emoji: "✨",
    label: "Surprise me",
    gradient: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    message: "Surprise me with a food recommendation!",
  },
];

// ── Chip variant styles ────────────────────────────────────────────────────
const chipStyles: Record<ChipVariant, React.CSSProperties> = {
  unsure: {
    borderColor: "#C4B5FD",
    color: "#7C3AED",
    background: "#F5F3FF",
  },
  healthy: {
    borderColor: "#86EFAC",
    color: "#16A34A",
    background: "white",
  },
  comfort: {
    borderColor: "#FCA5A5",
    color: "#DC2626",
    background: "white",
  },
  light: {
    borderColor: "#93C5FD",
    color: "#2563EB",
    background: "white",
  },
  default: {
    borderColor: "#E5E5E5",
    color: "#404040",
    background: "white",
  },
};

// ── Component ──────────────────────────────────────────────────────────────
export function FoodDiscoveryCanvas() {
  const { agent } = useAgent();

  const sendMessage = useCallback(
    (text: string) => {
      agent.addMessage({
        role: "user",
        id: crypto.randomUUID(),
        content: text,
      });
      agent.runAgent();
    },
    [agent],
  );

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        background: "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
        scrollbarWidth: "none",
      }}
    >
      {/* Greeting */}
      <div style={{ padding: "36px 24px 20px" }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#0A0A0A",
            lineHeight: 1.2,
          }}
        >
          What are you
          <br />
          eating today? 🤔
        </div>
      </div>

      {/* Mood section */}
      <div
        style={{
          padding: "0 24px 12px",
          fontSize: 11,
          fontWeight: 700,
          color: "#A3A3A3",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        What are you in the mood for?
      </div>

      {/* Chips row */}
      <div
        style={{
          padding: "0 24px 4px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => sendMessage(chip.message)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              padding: "10px 18px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              border: `1.5px solid ${chipStyles[chip.variant].borderColor}`,
              background: chipStyles[chip.variant].background,
              color: chipStyles[chip.variant].color,
              transition: "all 0.15s",
              outline: "none",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              const hoverBg: Record<ChipVariant, string> = {
                unsure: "#EDE9FE",
                healthy: "#F0FDF4",
                comfort: "#FFF5F5",
                light: "#EFF6FF",
                default: "#F4F4F4",
              };
              (e.currentTarget as HTMLButtonElement).style.background =
                hoverBg[chip.variant];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                chipStyles[chip.variant].background as string;
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.96)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ height: 28 }} />

      {/* Explore section label */}
      <div
        style={{
          padding: "0 24px 14px",
          fontSize: 11,
          fontWeight: 700,
          color: "#A3A3A3",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        Explore
      </div>

      {/* Featured cards row */}
      <div
        style={{
          padding: "0 24px",
          display: "flex",
          gap: 14,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => sendMessage(card.message)}
            style={{
              minWidth: 180,
              height: 140,
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              flexShrink: 0,
              transition: "transform 0.15s",
              border: "none",
              padding: 0,
              outline: "none",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.97)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            {/* Gradient background with emoji */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: card.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
              }}
            >
              {card.emoji}
            </div>

            {/* Label overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "10px 14px",
                background:
                  "linear-gradient(transparent, rgba(0,0,0,0.55))",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              {card.label}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 48 }} />
    </div>
  );
}

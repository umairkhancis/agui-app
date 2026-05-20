// Home screen: mood chips + featured cards. Purely presentational — emits a
// MoodPickPayload up the tree when the user picks a chip or card.

import { cards, chipHoverBg, chips, chipStyles } from "../data";
import { scrollPaneStyle, sectionLabelStyle } from "../styles";
import type { CardItem, ChipItem, MoodPickPayload } from "../types";

export interface HomeViewProps {
  onPickMood: (pick: MoodPickPayload) => void;
}

export function HomeView({ onPickMood }: HomeViewProps) {
  const pick = (item: ChipItem | CardItem) => {
    onPickMood({
      intent: item.intent,
      message: item.message,
    });
  };

  return (
    <div style={scrollPaneStyle}>
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

      <div style={sectionLabelStyle}>What are you in the mood for?</div>

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
            onClick={() => pick(chip)}
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
              e.currentTarget.style.background = chipHoverBg[chip.variant];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                chipStyles[chip.variant].background as string;
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div style={{ height: 28 }} />

      <div style={sectionLabelStyle}>Explore</div>

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
            onClick={() => pick(card)}
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
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
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
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "10px 14px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
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

      <div style={{ height: 48 }} />
    </div>
  );
}

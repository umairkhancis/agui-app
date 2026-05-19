"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { useCallback } from "react";

// ── Types (mirror backend TypedDicts in agent/src/food_discovery.py) ──────
interface Badge {
  text: string;
  color: string;
  bg: string;
}

interface Answer {
  emoji: string;
  text: string;
  sub: string;
}

interface IntentContext {
  icon: string;
  title: string;
  why: string;
}

interface FoodCard {
  type: "healthy" | "comfort" | "light" | "unsure";
  emoji: string;
  bg: string;
  badge: Badge;
  name: string;
  restaurant: string;
  rating: string;
  time: string;
  price: string;
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  tags?: string[];
  descriptors?: string[];
  socialProof?: string;
  feel?: string;
  indicators?: string[];
  why?: string;
  moodProof?: string;
}

interface FoodDiscoveryState {
  screen: "aiInterpretation" | "results";
  intent: string;
  typingText: string;
  searchText: string;
  interpretation: string;
  question: string;
  answers: Answer[];
  selectedAnswer: string | null;
  context: IntentContext | null;
  results: FoodCard[];
}

// ── Chip & card data ──────────────────────────────────────────────────────
type ChipVariant = "unsure" | "healthy" | "comfort" | "light" | "default";

interface ChipItem {
  id: string;
  label: string;
  variant: ChipVariant;
  intent: string;
  message: string;
}

const chips: ChipItem[] = [
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

interface CardItem {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  intent: string;
  message: string;
}

const cards: CardItem[] = [
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

const chipStyles: Record<ChipVariant, React.CSSProperties> = {
  unsure: { borderColor: "#C4B5FD", color: "#7C3AED", background: "#F5F3FF" },
  healthy: { borderColor: "#86EFAC", color: "#16A34A", background: "white" },
  comfort: { borderColor: "#FCA5A5", color: "#DC2626", background: "white" },
  light: { borderColor: "#93C5FD", color: "#2563EB", background: "white" },
  default: { borderColor: "#E5E5E5", color: "#404040", background: "white" },
};

// ── Top-level component ───────────────────────────────────────────────────
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

  const state = agent.state?.foodDiscovery as
    | FoodDiscoveryState
    | null
    | undefined;

  if (state?.screen === "results") {
    return <ResultsView state={state} sendMessage={sendMessage} />;
  }
  if (state?.screen === "aiInterpretation") {
    return <InterpretationView state={state} sendMessage={sendMessage} />;
  }
  return <HomeView sendMessage={sendMessage} />;
}

// ── Home view (original chips + cards UI) ─────────────────────────────────
function HomeView({ sendMessage }: { sendMessage: (text: string) => void }) {
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
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
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

// ── AI interpretation view (matches screenshot) ───────────────────────────
function InterpretationView({
  state,
  sendMessage,
}: {
  state: FoodDiscoveryState;
  sendMessage: (text: string) => void;
}) {
  return (
    <div style={scrollPaneStyle}>
      <BackHeader
        onBack={() =>
          sendMessage(
            "Take me back to the food discovery home screen.",
          )
        }
        aiSearchText={state.searchText}
      />

      <div style={{ padding: "20px 24px 8px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#A3A3A3",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          You're looking for
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#0A0A0A",
            lineHeight: 1.2,
          }}
        >
          {state.typingText}
        </div>
      </div>

      <div style={{ padding: "16px 24px 0" }}>
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 16,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#16A34A",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ✦
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#16A34A",
              }}
            >
              AI · Reading your intent
            </div>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#1F2937",
              lineHeight: 1.5,
              marginBottom: 14,
            }}
            dangerouslySetInnerHTML={{ __html: state.interpretation }}
          />
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1.3,
            }}
          >
            {state.question}
          </div>
        </div>
      </div>

      <div style={{ padding: "26px 24px 10px", ...sectionLabelInline }}>
        Pick what feels right
      </div>

      <div
        style={{
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {state.answers.map((answer) => (
          <button
            key={answer.text}
            onClick={() =>
              sendMessage(
                `I'll go with "${answer.text}" for the ${state.intent} mood.`,
              )
            }
            style={{
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              transition: "all 0.15s",
              outline: "none",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#86EFAC";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#E5E7EB";
              (e.currentTarget as HTMLButtonElement).style.background =
                "white";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.97)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{answer.emoji}</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0A0A0A",
                marginBottom: 2,
              }}
            >
              {answer.text}
            </div>
            <div style={{ fontSize: 12, color: "#737373" }}>{answer.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}

// ── Results view ──────────────────────────────────────────────────────────
function ResultsView({
  state,
  sendMessage,
}: {
  state: FoodDiscoveryState;
  sendMessage: (text: string) => void;
}) {
  const ctx = state.context;
  return (
    <div style={scrollPaneStyle}>
      <BackHeader
        onBack={() =>
          sendMessage(
            "Take me back to the food discovery home screen.",
          )
        }
        title={ctx?.title ?? "Results"}
      />

      {ctx && (
        <div style={{ padding: "16px 24px 0" }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              background: "#FAFAFA",
              border: "1px solid #EAEAEA",
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 22,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "white",
                border: "1px solid #EAEAEA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {ctx.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: 4,
                }}
              >
                {state.selectedAnswer
                  ? `${state.selectedAnswer} · ${state.searchText}`
                  : state.searchText}
              </div>
              <div style={{ fontSize: 12, color: "#525252", lineHeight: 1.4 }}>
                {ctx.why}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "18px 24px 0", display: "grid", gap: 16 }}>
        {state.results.map((card, i) => (
          <FoodResultCard key={`${card.name}-${i}`} card={card} />
        ))}
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────
function FoodResultCard({ card }: { card: FoodCard }) {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #EAEAEA",
        background: "white",
      }}
    >
      <div
        style={{
          height: 110,
          background: card.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          position: "relative",
        }}
      >
        {card.emoji}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "4px 10px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            color: card.badge.color,
            background: card.badge.bg,
          }}
        >
          {card.badge.text}
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A" }}>
            {card.name}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#404040",
              flexShrink: 0,
            }}
          >
            ⭐ {card.rating}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#737373", marginBottom: 12 }}>
          {card.restaurant}
        </div>

        <ResultCardBody card={card} />

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#404040", fontWeight: 600 }}>
              🕐 {card.time}
            </div>
            <div style={{ fontSize: 13, color: "#404040", fontWeight: 600 }}>
              {card.price}
            </div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#0A0A0A",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            +
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCardBody({ card }: { card: FoodCard }) {
  if (
    card.type === "healthy" &&
    card.calories !== undefined &&
    card.protein &&
    card.carbs &&
    card.fat &&
    card.tags
  ) {
    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: 10,
          }}
        >
          {[
            { value: card.calories, label: "kcal" },
            { value: card.protein, label: "protein" },
            { value: card.carbs, label: "carbs" },
            { value: card.fat, label: "fat" },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: "#F5F5F5",
                borderRadius: 10,
                padding: "8px 4px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A" }}>
                {m.value}
              </div>
              <div style={{ fontSize: 10, color: "#737373" }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {card.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#16A34A",
                background: "#DCFCE7",
                padding: "4px 10px",
                borderRadius: 100,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === "comfort" && card.descriptors && card.socialProof) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 10,
          }}
        >
          {card.descriptors.map((d) => (
            <span
              key={d}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#DC2626",
                background: "#FEE2E2",
                padding: "4px 10px",
                borderRadius: 100,
              }}
            >
              {d}
            </span>
          ))}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#525252",
            fontStyle: "italic",
            lineHeight: 1.45,
            marginBottom: 8,
          }}
        >
          {card.socialProof}
        </div>
        {card.feel && (
          <div style={{ fontSize: 12, color: "#737373" }}>{card.feel}</div>
        )}
      </div>
    );
  }

  if (
    card.type === "light" &&
    card.calories !== undefined &&
    card.indicators
  ) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#2563EB" }}>
            {card.calories}
          </span>
          <span style={{ fontSize: 14, color: "#737373", fontWeight: 600 }}>
            kcal
          </span>
          {card.feel && (
            <span style={{ fontSize: 12, color: "#737373" }}>· {card.feel}</span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {card.indicators.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#2563EB",
                background: "#DBEAFE",
                padding: "4px 10px",
                borderRadius: 100,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === "unsure" && card.descriptors) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 10,
          }}
        >
          {card.descriptors.map((d) => (
            <span
              key={d}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#7C3AED",
                background: "#F5F3FF",
                padding: "4px 10px",
                borderRadius: 100,
              }}
            >
              {d}
            </span>
          ))}
        </div>
        {card.why && (
          <div
            style={{
              fontSize: 12,
              color: "#525252",
              lineHeight: 1.45,
              marginBottom: 8,
            }}
          >
            {card.why}
          </div>
        )}
        {card.moodProof && (
          <div style={{ fontSize: 12, color: "#737373" }}>{card.moodProof}</div>
        )}
      </div>
    );
  }

  return null;
}

// ── Shared chrome ─────────────────────────────────────────────────────────
function BackHeader({
  onBack,
  aiSearchText,
  title,
}: {
  onBack: () => void;
  aiSearchText?: string;
  title?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 24px 0",
      }}
    >
      <button
        onClick={onBack}
        aria-label="Back"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid #EAEAEA",
          background: "white",
          color: "#0A0A0A",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          flexShrink: 0,
        }}
      >
        ←
      </button>
      {aiSearchText && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: "#F5F5F5",
            borderRadius: 100,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "white",
              background: "#16A34A",
              padding: "3px 8px",
              borderRadius: 100,
            }}
          >
            AI
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#404040",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {aiSearchText}
          </span>
        </div>
      )}
      {title && (
        <div
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: 700,
            color: "#0A0A0A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────
const scrollPaneStyle: React.CSSProperties = {
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  background: "white",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
  scrollbarWidth: "none",
};

const sectionLabelInline: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#A3A3A3",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
};

const sectionLabelStyle: React.CSSProperties = {
  padding: "0 24px 12px",
  ...sectionLabelInline,
};

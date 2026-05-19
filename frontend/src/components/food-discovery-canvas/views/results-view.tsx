// Results screen — list of food cards plus a context banner explaining why
// the agent chose this view. Pure presenter; receives the ResultsScreenState
// variant directly so TypeScript narrows fields like `selectedAnswer` and
// `results` to their non-optional types.

import { BackHeader } from "../components/back-header";
import { FoodResultCard } from "../components/food-result-card";
import { scrollPaneStyle } from "../styles";
import type { ResultsScreenState } from "../types";

export interface ResultsViewProps {
  state: ResultsScreenState;
  onBack: () => void;
}

export function ResultsView({ state, onBack }: ResultsViewProps) {
  const { ctx } = state;
  return (
    <div style={scrollPaneStyle}>
      <BackHeader onBack={onBack} title={ctx.title} />

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
              {state.selectedAnswer} · {state.searchText}
            </div>
            <div style={{ fontSize: 12, color: "#525252", lineHeight: 1.4 }}>
              {ctx.why}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 24px 0", display: "grid", gap: 16 }}>
        {state.results.map((card, i) => (
          <FoodResultCard key={`${card.name}-${i}`} card={card} />
        ))}
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}

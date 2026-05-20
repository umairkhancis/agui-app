// Loading skeleton for the AI interpretation screen. Mirrors the layout of
// InterpretationView so the slide-in animation lands on something familiar.
//
// Carries NO intent-specific text — those fields belong to the backend's
// INTENTS_DATA and arrive on `state.foodDiscovery` once the tool resolves.
// While loading, we show generic placeholder text + skeleton blocks.

import { BackHeader } from "../components/back-header";
import {
  AgentActivityFooter,
  AnswerSkeleton,
  LoadingDots,
  Skeleton,
} from "../components/loading-helpers";
import { scrollPaneStyle, sectionLabelInline } from "../styles";

export interface InterpretationLoadingViewProps {
  isRunning: boolean;
  onBack: () => void;
}

export function InterpretationLoadingView({
  isRunning,
  onBack,
}: InterpretationLoadingViewProps) {
  return (
    <div style={scrollPaneStyle}>
      <BackHeader onBack={onBack} aiSearchText="Understanding your request…" />

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
        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
          <Skeleton width="78%" height={26} />
          <Skeleton width="48%" height={26} />
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
              marginBottom: 14,
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
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              AI · Reading your intent
              <LoadingDots color="#16A34A" />
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <Skeleton width="92%" />
            <Skeleton width="80%" />
            <Skeleton width="55%" />
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
        {[0, 1, 2, 3].map((i) => (
          <AnswerSkeleton key={i} />
        ))}
      </div>

      <AgentActivityFooter
        isRunning={isRunning}
        label="Agent is reading your intent"
      />

      <div style={{ height: 48 }} />
    </div>
  );
}

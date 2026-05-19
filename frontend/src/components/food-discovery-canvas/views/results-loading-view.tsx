// Loading skeleton for the results screen. Renders while the agent is busy
// turning the user's sub-option pick into actual food cards.

import { BackHeader } from "../components/back-header";
import {
  AgentActivityFooter,
  FoodResultCardSkeleton,
  LoadingDots,
  Skeleton,
} from "../components/loading-helpers";
import { scrollPaneStyle } from "../styles";

export interface ResultsLoadingViewProps {
  selectedAnswer: string;
  isRunning: boolean;
  onBack: () => void;
}

export function ResultsLoadingView({
  selectedAnswer,
  isRunning,
  onBack,
}: ResultsLoadingViewProps) {
  return (
    <div style={scrollPaneStyle}>
      <BackHeader onBack={onBack} title={`Finding ${selectedAnswer} options…`} />

      <div style={{ padding: "16px 24px 0" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "#FAFAFA",
            border: "1px solid #EAEAEA",
            borderRadius: 14,
            padding: "12px 14px",
          }}
        >
          <Skeleton width={36} height={36} radius={10} />
          <div style={{ flex: 1, display: "grid", gap: 6 }}>
            <Skeleton width="60%" />
            <Skeleton width="85%" />
          </div>
          <LoadingDots color="#737373" />
        </div>
      </div>

      <div style={{ padding: "18px 24px 0", display: "grid", gap: 16 }}>
        {[0, 1, 2].map((i) => (
          <FoodResultCardSkeleton key={i} />
        ))}
      </div>

      <AgentActivityFooter
        isRunning={isRunning}
        label={`Agent is curating ${selectedAnswer} options`}
      />

      <div style={{ height: 48 }} />
    </div>
  );
}

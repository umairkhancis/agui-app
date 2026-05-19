// Small visual building blocks used by the loading skeleton views.

import { useEffect, useState } from "react";

// Pulsing grey placeholder, animated via React state to avoid global CSS.
export function Skeleton({
  width = "100%",
  height = 12,
  radius = 8,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
}) {
  const [bright, setBright] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setBright((b) => !b), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: bright ? "#F3F4F6" : "#E5E7EB",
        transition: "background 0.7s ease",
      }}
    />
  );
}

// Three cycling dots used in the green "AI · Reading your intent" card and
// the agent-activity footer.
export function LoadingDots({ color = "#737373" }: { color?: string }) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x % 3) + 1), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ color, fontWeight: 700, letterSpacing: 1 }}>
      {".".repeat(n)}
    </span>
  );
}

// Bottom-of-screen status pill that reflects agent.isRunning. Surfaces the
// AG-UI run state so the user can see something is happening while the agent
// processes their click.
export function AgentActivityFooter({
  isRunning,
  label,
}: {
  isRunning: boolean;
  label: string;
}) {
  return (
    <div style={{ padding: "22px 24px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 12,
          background: "#F5F5F5",
          border: "1px solid #EAEAEA",
          fontSize: 12,
          color: "#525252",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isRunning ? "#16A34A" : "#A3A3A3",
          }}
        />
        <span>
          {isRunning ? label : "Waiting for agent response…"}
          {isRunning && <LoadingDots color="#525252" />}
        </span>
      </div>
    </div>
  );
}

// Used inside InterpretationLoadingView to placeholder the 2x2 answer grid.
export function AnswerSkeleton() {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        background: "white",
        display: "grid",
        gap: 8,
      }}
    >
      <Skeleton width={24} height={24} radius={6} />
      <Skeleton width="60%" />
      <Skeleton width="80%" />
    </div>
  );
}

// Used inside ResultsLoadingView to placeholder a vertical food card.
export function FoodResultCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #EAEAEA",
        background: "white",
      }}
    >
      <Skeleton height={110} radius={0} />
      <div style={{ padding: "14px 16px 16px", display: "grid", gap: 8 }}>
        <Skeleton width="65%" />
        <Skeleton width="40%" />
        <div style={{ height: 6 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <Skeleton width={60} height={28} radius={10} />
          <Skeleton width={60} height={28} radius={10} />
          <Skeleton width={60} height={28} radius={10} />
          <Skeleton width={60} height={28} radius={10} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Skeleton width={70} height={20} radius={100} />
          <Skeleton width={70} height={20} radius={100} />
        </div>
      </div>
    </div>
  );
}

// Error screen — rendered when state.foodDiscovery.screen === "error".
// Pure presenter. Receives the ErrorScreenState directly and an onDismiss
// callback that the container wires to the reset flow.

import { BackHeader } from "../components/back-header";
import { scrollPaneStyle } from "../styles";
import type { ErrorScreenState } from "../types";

export interface ErrorViewProps {
  state: ErrorScreenState;
  onDismiss: () => void;
}

export function ErrorView({ state, onDismiss }: ErrorViewProps) {
  return (
    <div style={scrollPaneStyle}>
      <BackHeader onBack={onDismiss} title="Something went wrong" />

      <div style={{ padding: "32px 24px 0" }}>
        <div
          style={{
            background: "#FFF5F5",
            border: "1px solid #FECACA",
            borderRadius: 16,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#DC2626",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              !
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#DC2626",
              }}
            >
              The agent couldn't continue
            </div>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#1F2937",
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {state.message}
          </div>
          <button
            onClick={onDismiss}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #DC2626",
              background: "white",
              color: "#DC2626",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Start over
          </button>
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}

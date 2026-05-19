// AI interpretation screen. Pure presenter — gets its data via a typed
// InterpretationData prop, never reads agent state.

import { BackHeader } from "../components/back-header";
import { sectionLabelInline, scrollPaneStyle } from "../styles";
import type { Answer, InterpretationData } from "../types";

export interface InterpretationViewProps {
  state: InterpretationData;
  onBack: () => void;
  onPickAnswer: (answer: Answer) => void;
}

export function InterpretationView({
  state,
  onBack,
  onPickAnswer,
}: InterpretationViewProps) {
  return (
    <div style={scrollPaneStyle}>
      <BackHeader onBack={onBack} aiSearchText={state.searchText} />

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
            onClick={() => onPickAnswer(answer)}
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
              e.currentTarget.style.borderColor = "#86EFAC";
              e.currentTarget.style.background = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.background = "white";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
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

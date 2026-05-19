// Top chrome shared by every drilled-in screen. Either shows the AI search
// pill (used on the interpretation screen) or a plain title (used on results).

export interface BackHeaderProps {
  onBack: () => void;
  aiSearchText?: string;
  title?: string;
}

export function BackHeader({ onBack, aiSearchText, title }: BackHeaderProps) {
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
      {aiSearchText !== undefined && (
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
      {title !== undefined && (
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

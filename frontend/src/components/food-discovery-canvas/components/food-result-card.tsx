// Vertical food card used on the results screen. The discriminated `FoodCard`
// union lets the body renderer use a clean `switch (card.type)` with no
// undefined-guards — TypeScript narrows the variant correctly in each branch.

import type { FoodCard } from "../types";

export function FoodResultCard({ card }: { card: FoodCard }) {
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
  switch (card.type) {
    case "healthy":
      return <HealthyBody card={card} />;
    case "comfort":
      return <ComfortBody card={card} />;
    case "light":
      return <LightBody card={card} />;
    case "unsure":
      return <UnsureBody card={card} />;
  }
}

function HealthyBody({ card }: { card: Extract<FoodCard, { type: "healthy" }> }) {
  const macros = [
    { value: card.calories, label: "kcal" },
    { value: card.protein, label: "protein" },
    { value: card.carbs, label: "carbs" },
    { value: card.fat, label: "fat" },
  ];
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
        {macros.map((m) => (
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

function ComfortBody({ card }: { card: Extract<FoodCard, { type: "comfort" }> }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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
      <div style={{ fontSize: 12, color: "#737373" }}>{card.feel}</div>
    </div>
  );
}

function LightBody({ card }: { card: Extract<FoodCard, { type: "light" }> }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: "#2563EB" }}>
          {card.calories}
        </span>
        <span style={{ fontSize: 14, color: "#737373", fontWeight: 600 }}>
          kcal
        </span>
        <span style={{ fontSize: 12, color: "#737373" }}>· {card.feel}</span>
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

function UnsureBody({ card }: { card: Extract<FoodCard, { type: "unsure" }> }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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
      <div style={{ fontSize: 12, color: "#737373" }}>{card.moodProof}</div>
    </div>
  );
}

// Shared CSS-in-JS style fragments used across the food-discovery views.

import type { CSSProperties } from "react";

export const scrollPaneStyle: CSSProperties = {
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  background: "white",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
  scrollbarWidth: "none",
};

export const sectionLabelInline: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#A3A3A3",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
};

export const sectionLabelStyle: CSSProperties = {
  padding: "0 24px 12px",
  ...sectionLabelInline,
};

export const FRAME_TRANSITION_MS = 300;

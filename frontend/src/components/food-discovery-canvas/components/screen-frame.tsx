// A single layer in the navigation stack. Owns its own enter/exit transform
// state but is otherwise purely props-driven — the parent passes `exiting`
// and `depth`, the frame handles the CSS-transition lifecycle.

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { FRAME_TRANSITION_MS } from "../styles";

export interface ScreenFrameProps {
  animatesIn: boolean;
  exiting: boolean;
  depth: number;
  children: ReactNode;
  onExitComplete?: () => void;
}

export function ScreenFrame({
  animatesIn,
  exiting,
  depth,
  children,
  onExitComplete,
}: ScreenFrameProps) {
  // `entered` flips to true on the frame *after* mount so the CSS transition
  // animates from translateX(100%) to translateX(0). Frames that don't animate
  // in (e.g. home on first mount) start entered.
  const [entered, setEntered] = useState(!animatesIn);

  // Mirror the latest `exiting` value into a ref so the transitionend handler
  // sees the up-to-date value and doesn't fire onExitComplete for a redirected
  // slide-back-in transition.
  const exitingRef = useRef(exiting);
  exitingRef.current = exiting;

  useLayoutEffect(() => {
    if (animatesIn) {
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transform: string =
    exiting || !entered
      ? "translateX(100%)"
      : depth === 0
        ? "translateX(0)"
        : "translateX(-22%)";

  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    transform,
    transition: `transform ${FRAME_TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
    pointerEvents: depth === 0 && !exiting ? "auto" : "none",
    background: "white",
    zIndex: 10 - depth,
    boxShadow:
      depth === 0 && entered && !exiting
        ? "-8px 0 28px rgba(0,0,0,0.08)"
        : undefined,
    filter: depth > 0 && !exiting ? "brightness(0.96)" : undefined,
    willChange: "transform",
  };

  return (
    <div
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.propertyName !== "transform") return;
        if (exitingRef.current) onExitComplete?.();
      }}
      style={style}
    >
      {children}
    </div>
  );
}

// Pure presenter component. Never imports useAgent — the container hands it
// a typed FoodDiscoveryState (or null) plus the callbacks needed to drive
// forward / back navigation. All animation state (visibleStack, exiting) is
// local to this component because it's purely a rendering concern.

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ScreenFrame } from "./components/screen-frame";
import { ErrorView } from "./views/error-view";
import { HomeView } from "./views/home-view";
import { InterpretationLoadingView } from "./views/interpretation-loading-view";
import { InterpretationView } from "./views/interpretation-view";
import { ResultsLoadingView } from "./views/results-loading-view";
import { ResultsView } from "./views/results-view";
import type {
  Answer,
  FoodDiscoveryState,
  MoodPickPayload,
  PendingTransition,
} from "./types";

type ScreenLevel = "home" | "interpretation" | "results" | "error";

function deriveStack(
  state: FoodDiscoveryState | null,
  pending: PendingTransition | null,
): ScreenLevel[] {
  const stack: ScreenLevel[] = ["home"];
  // Error is a top-level branch: when present it replaces the normal stack
  // depth. Pending transitions don't apply — errors surface unexpectedly.
  if (state?.screen === "error") {
    stack.push("error");
    return stack;
  }
  const hasInterpretation =
    pending?.toScreen === "aiInterpretation" ||
    state?.screen === "aiInterpretation" ||
    pending?.toScreen === "results" ||
    state?.screen === "results";
  if (hasInterpretation) stack.push("interpretation");
  const hasResults =
    pending?.toScreen === "results" || state?.screen === "results";
  if (hasResults) stack.push("results");
  return stack;
}

export interface FoodDiscoveryCanvasViewProps {
  state: FoodDiscoveryState | null;
  pending: PendingTransition | null;
  isRunning: boolean;
  onPickMood: (pick: MoodPickPayload) => void;
  onPickAnswer: (answer: Answer) => void;
  onPopOne: () => void;
  onDismissError: () => void;
}

export function FoodDiscoveryCanvasView({
  state,
  pending,
  isRunning,
  onPickMood,
  onPickAnswer,
  onPopOne,
  onDismissError,
}: FoodDiscoveryCanvasViewProps) {
  const visibleStack = useMemo(
    () => deriveStack(state, pending),
    [state, pending],
  );

  // Reconcile the exit set during render (the documented React pattern for
  // storing previous-render info). This keeps the relevant ScreenFrame
  // continuously mounted across the visibleStack flip so its slide-out
  // animation can fire — see the bug-fix note in screen-frame.tsx.
  const [trackedStack, setTrackedStack] =
    useState<ScreenLevel[]>(visibleStack);
  const [exiting, setExiting] = useState<Set<ScreenLevel>>(() => new Set());

  if (visibleStack !== trackedStack) {
    setTrackedStack(visibleStack);
    const removed = trackedStack.filter((l) => !visibleStack.includes(l));
    setExiting((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const l of visibleStack) {
        if (next.delete(l)) changed = true;
      }
      for (const l of removed) {
        if (!next.has(l)) {
          next.add(l);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  const clearExit = useCallback((level: ScreenLevel) => {
    setExiting((prev) => {
      if (!prev.has(level)) return prev;
      const next = new Set(prev);
      next.delete(level);
      return next;
    });
  }, []);

  const depthOf = (level: ScreenLevel): number => {
    const idx = visibleStack.indexOf(level);
    if (idx === -1) return 0;
    return visibleStack.length - 1 - idx;
  };

  // Build live content for the interpretation + results frames. State is
  // narrowed via the discriminated union, so accessing `state.selectedAnswer`
  // etc. is type-safe (no optional chaining or undefined guards).
  const interpretationState =
    state?.screen === "aiInterpretation" || state?.screen === "results"
      ? state
      : null;
  const interpretationPending =
    pending?.toScreen === "aiInterpretation" ? pending : null;
  const resultsState = state?.screen === "results" ? state : null;
  const resultsPending = pending?.toScreen === "results" ? pending : null;

  // Cache the last rendered child so the frame keeps its content during the
  // slide-out animation, even after the agent state has cleared.
  const lastInterpretationChildRef = useRef<ReactNode>(null);
  const lastResultsChildRef = useRef<ReactNode>(null);
  const lastErrorChildRef = useRef<ReactNode>(null);

  const errorState = state?.screen === "error" ? state : null;
  let errorChild: ReactNode = null;
  if (errorState) {
    errorChild = <ErrorView state={errorState} onDismiss={onDismissError} />;
    lastErrorChildRef.current = errorChild;
  }
  const showsError = visibleStack.includes("error") || exiting.has("error");

  let interpretationChild: ReactNode = null;
  if (interpretationState) {
    interpretationChild = (
      <InterpretationView
        state={interpretationState}
        onBack={onPopOne}
        onPickAnswer={onPickAnswer}
      />
    );
  } else if (interpretationPending) {
    interpretationChild = (
      <InterpretationLoadingView
        isRunning={isRunning}
        onBack={onPopOne}
      />
    );
  }
  if (interpretationChild) {
    lastInterpretationChildRef.current = interpretationChild;
  }

  let resultsChild: ReactNode = null;
  if (resultsPending && !resultsState) {
    resultsChild = (
      <ResultsLoadingView
        selectedAnswer={resultsPending.selectedAnswer}
        isRunning={isRunning}
        onBack={onPopOne}
      />
    );
  } else if (resultsState) {
    resultsChild = <ResultsView state={resultsState} onBack={onPopOne} />;
  }
  if (resultsChild) {
    lastResultsChildRef.current = resultsChild;
  }

  const showsInterpretation =
    visibleStack.includes("interpretation") || exiting.has("interpretation");
  const showsResults =
    visibleStack.includes("results") || exiting.has("results");

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      <ScreenFrame animatesIn={false} exiting={false} depth={depthOf("home")}>
        <HomeView onPickMood={onPickMood} />
      </ScreenFrame>

      {showsInterpretation && (
        <ScreenFrame
          animatesIn
          exiting={exiting.has("interpretation")}
          depth={depthOf("interpretation")}
          onExitComplete={() => clearExit("interpretation")}
        >
          {interpretationChild ?? lastInterpretationChildRef.current}
        </ScreenFrame>
      )}

      {showsResults && (
        <ScreenFrame
          animatesIn
          exiting={exiting.has("results")}
          depth={depthOf("results")}
          onExitComplete={() => clearExit("results")}
        >
          {resultsChild ?? lastResultsChildRef.current}
        </ScreenFrame>
      )}

      {showsError && (
        <ScreenFrame
          animatesIn
          exiting={exiting.has("error")}
          depth={depthOf("error")}
          onExitComplete={() => clearExit("error")}
        >
          {errorChild ?? lastErrorChildRef.current}
        </ScreenFrame>
      )}
    </div>
  );
}

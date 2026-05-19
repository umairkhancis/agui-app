"use client";

// Container component. Owns the *agent* concerns (read shared state, send
// messages, push direct state updates for back-navigation) and the *transient
// UI* concern of the pending overlay. Everything else — including the screen
// stack and animation — lives in the pure presenter.

import { useCallback, useEffect, useState } from "react";

import { FoodDiscoveryCanvasView } from "./canvas";
import { useFoodDiscoveryAgent } from "./use-food-discovery-agent";
import type {
  Answer,
  FoodDiscoveryState,
  InterpretationScreenState,
  MoodPickPayload,
  PendingTransition,
} from "./types";

function stateMatchesPending(
  state: FoodDiscoveryState | null,
  pending: PendingTransition,
): boolean {
  if (state === null) return false;
  if (pending.toScreen === "aiInterpretation") {
    return (
      state.screen === "aiInterpretation" && state.intent === pending.intent
    );
  }
  return (
    state.screen === "results" &&
    state.intent === pending.intent &&
    state.selectedAnswer === pending.selectedAnswer
  );
}

export function FoodDiscoveryCanvas() {
  const { state, isRunning, setFoodDiscovery, sendMessage } =
    useFoodDiscoveryAgent();
  const [pending, setPending] = useState<PendingTransition | null>(null);

  // Clear the pending overlay once the agent's state catches up. If the run
  // ends without producing the expected state (LLM forgot to call the tool),
  // fall back after a short timeout.
  useEffect(() => {
    if (!pending) return;
    if (stateMatchesPending(state, pending)) {
      setPending(null);
      return;
    }
    if (!isRunning) {
      const t = setTimeout(() => setPending(null), 1500);
      return () => clearTimeout(t);
    }
  }, [state, isRunning, pending]);

  const onPickMood = useCallback(
    (pick: MoodPickPayload) => {
      setPending({
        toScreen: "aiInterpretation",
        intent: pick.intent,
        typingText: pick.typingText,
        searchText: pick.searchText,
      });
      sendMessage(pick.message);
    },
    [sendMessage],
  );

  const onPickAnswer = useCallback(
    (answer: Answer) => {
      // Only meaningful when we're on the interpretation screen — the canvas
      // never shows answer chips on the home or results screens.
      if (state?.screen !== "aiInterpretation") return;
      setPending({
        toScreen: "results",
        intent: state.intent,
        selectedAnswer: answer.text,
      });
      sendMessage(
        `I'll go with "${answer.text}" for the ${state.intent} mood.`,
      );
    },
    [state, sendMessage],
  );

  const onPopOne = useCallback(() => {
    // Cancel a pending loading overlay first (covers "user clicked back
    // while the agent was still thinking").
    if (pending) {
      setPending(null);
      return;
    }
    if (state?.screen === "results") {
      // Down-shift to interpretation by constructing the variant explicitly.
      // Spreading + overriding `screen` would also work but this is clearer.
      const next: InterpretationScreenState = {
        screen: "aiInterpretation",
        intent: state.intent,
        typingText: state.typingText,
        searchText: state.searchText,
        interpretation: state.interpretation,
        question: state.question,
        answers: state.answers,
        ctx: state.ctx,
      };
      setFoodDiscovery(next);
      return;
    }
    if (state?.screen === "aiInterpretation") {
      setFoodDiscovery(null);
      return;
    }
  }, [pending, state, setFoodDiscovery]);

  return (
    <FoodDiscoveryCanvasView
      state={state}
      pending={pending}
      isRunning={isRunning}
      onPickMood={onPickMood}
      onPickAnswer={onPickAnswer}
      onPopOne={onPopOne}
    />
  );
}

"use client";

// Container component. Owns the *agent* concerns (read shared state, send
// messages that drive tool calls) and the *transient UI* concern of the
// pending overlay. Everything else — including the screen stack and
// animation — lives in the pure presenter.
//
// CONTRACT: every food-discovery state transition (forward AND back) goes
// through an agent tool. The FE never calls `setFoodDiscovery(...)` directly
// to mutate the user-facing screen — it always asks the agent to do it via
// sendMessage(), so the agent's message history is a complete log of the
// journey. Cost: each back press is one LLM round-trip slower than a direct
// setState would be. Benefit: an explicit, debuggable contract.

import { useCallback, useEffect, useState } from "react";

import { FoodDiscoveryCanvasView } from "./canvas";
import { useFoodDiscoveryAgent } from "./use-food-discovery-agent";
import type {
  Answer,
  FoodDiscoveryState,
  MoodPickPayload,
  PendingTransition,
} from "./types";

// The sentinel message we send to drive a back-navigation tool call. Kept
// here so the prompt-side contract is visible in one place — the backend's
// FOOD_DISCOVERY_SYSTEM_PROMPT maps this to pop_food_discovery_screen.
const POP_BACK_MESSAGE = "Take me back to the previous screen.";

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
  const { state, isRunning, sendMessage } = useFoodDiscoveryAgent();
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
    // Cancel a pending loading overlay first — pure UI concern, no agent
    // round-trip needed because nothing has actually changed in state yet.
    if (pending) {
      setPending(null);
      return;
    }
    // For any real state ("aiInterpretation", "results", "error"), ask the
    // agent to pop. The agent owns the transition; we just signal intent.
    if (state) {
      sendMessage(POP_BACK_MESSAGE);
    }
  }, [pending, state, sendMessage]);

  const onDismissError = useCallback(() => {
    // Same signal path as a back press from any other screen — the
    // pop_food_discovery_screen tool handles errors by going home.
    sendMessage(POP_BACK_MESSAGE);
  }, [sendMessage]);

  return (
    <FoodDiscoveryCanvasView
      state={state}
      pending={pending}
      isRunning={isRunning}
      onPickMood={onPickMood}
      onPickAnswer={onPickAnswer}
      onPopOne={onPopOne}
      onDismissError={onDismissError}
    />
  );
}

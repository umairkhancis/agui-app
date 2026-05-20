// The one and only place where this feature touches the untyped CopilotKit
// `useAgent()` surface. Everything downstream of this hook is fully typed
// against `AgentState` and `FoodDiscoveryState`.
//
// CONTRACT: this hook deliberately does NOT expose a `setFoodDiscovery`
// setter. Every food-discovery state transition (forward AND back) must go
// through an agent tool via `sendMessage()`. That keeps the agent's message
// history a complete log of the user's journey. If you find yourself wanting
// to mutate state directly, add a tool instead.

import { useAgent } from "@copilotkit/react-core/v2";
import { useCallback } from "react";

import type { AgentState, FoodDiscoveryState } from "./types";

interface TypedAgent {
  state?: AgentState;
  isRunning: boolean;
  addMessage: (m: { role: "user"; id: string; content: string }) => void;
  runAgent: () => void;
}

export interface UseFoodDiscoveryAgentResult {
  state: FoodDiscoveryState | null;
  isRunning: boolean;
  sendMessage: (text: string) => void;
}

export function useFoodDiscoveryAgent(): UseFoodDiscoveryAgentResult {
  // `useAgent()` returns an untyped agent — narrow it once, here, behind a
  // controlled assertion so that everything we export below is type-safe.
  const { agent: rawAgent } = useAgent();
  const agent = rawAgent as unknown as TypedAgent;

  const sendMessage = useCallback(
    (text: string) => {
      agent.addMessage({
        role: "user",
        id: crypto.randomUUID(),
        content: text,
      });
      agent.runAgent();
    },
    [agent],
  );

  return {
    state: agent.state?.foodDiscovery ?? null,
    isRunning: agent.isRunning,
    sendMessage,
  };
}

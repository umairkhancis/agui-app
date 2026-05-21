"use client";

import { useAgent } from "@copilotkit/react-core/v2";

export function MinimalCanvas() {
  const { agent } = useAgent();

  return (
    <div className="h-full flex items-center justify-center bg-[--background]">
      <div className="max-w-sm w-full mx-auto px-8 py-10 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🧮</span>
          <h2 className="text-xl font-semibold">Minimal Agent</h2>
          <p className="text-sm text-muted-foreground">
            One tool: <code className="font-mono bg-muted px-1 py-0.5 rounded">add_numbers(a, b)</code>
          </p>
        </div>

        <div className="w-full rounded-lg border border-[var(--border)] bg-muted/30 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Agent status</span>
            <span className={`font-medium ${agent.isRunning ? "text-amber-500" : "text-green-500"}`}>
              {agent.isRunning ? "Running…" : "Idle"}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Try: <em>"What is 42 + 58?"</em>
        </p>
      </div>
    </div>
  );
}

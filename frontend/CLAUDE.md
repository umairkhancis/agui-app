# Frontend — CopilotKit v2 demo app

Next.js 16 app that talks to the LangGraph agent at `backend/agent/` over the AG-UI protocol. The agent is **not** in this directory — for cross-package context (how the two halves connect, docker compose, etc.), see the root `CLAUDE.md`.

## What this app demonstrates

A side-by-side chat + interactive canvas where both the user and the agent mutate the same shared state. The flagship example is a collaborative todo list (`src/components/example-canvas/`); the same wiring drives the A2UI fixed/dynamic-schema demos.

## Source layout

```
src/
├── app/
│   ├── page.tsx                          # Wires CopilotChat + ExampleLayout + ExampleCanvas
│   ├── layout.tsx                        # CopilotKit provider + A2UI catalog registration
│   ├── api/copilotkit/[[...slug]]/       # Proxies browser → AGENT_URL via CopilotRuntime v2
│   ├── declarative-generative-ui/        # A2UI catalog: definitions.ts (Zod) + renderers.tsx (React)
│   └── demo/                             # /demo route — overrides brand to "copilot"
├── components/
│   ├── example-canvas/                   # Todo list UI (reads/writes agent state)
│   ├── example-layout/                   # Chat + canvas split layout, brand-aware
│   ├── generative-ui/                    # charts/, meeting-time-picker — tool-call renderers
│   ├── headless-chat.tsx, tool-rendering.tsx
│   └── ui/                               # Primitives: button, card, input, etc.
├── hooks/                                # use-generative-ui-examples, use-example-suggestions, use-theme
└── lib/
    ├── brand.ts                          # talabat | copilot brand configs
    ├── a2ui-theme.css
    └── utils.ts
```

## Agent-state pattern

State lives in the **agent**, not the frontend. The frontend reads and writes it via `useAgent()`:

```tsx
// src/components/example-canvas/index.tsx
const { agent } = useAgent();
return (
  <TodoList
    todos={agent.state?.todos || []}
    onUpdate={(todos) => agent.setState({ todos })}
    isAgentRunning={agent.isRunning}
  />
);
```

The agent's `AgentState` TypedDict (defined in `backend/agent/src/todos.py`) is the schema. Tools on the backend return `Command(update={...})` to mutate it. There is no separate frontend store and no manual sync code — CopilotKit handles both directions.

When extending: add the new field to `AgentState` on the backend, then read `agent.state.<field>` and write via `agent.setState({...})` on the frontend.

## A2UI catalog

The agent can emit declarative UI trees (flight cards, dashboards). They render through a catalog registered once in `src/app/layout.tsx`:

```tsx
<CopilotKit a2ui={{ catalog: demonstrationCatalog }} ...>
```

The catalog is built from two type-paired files:

| File | Role |
| --- | --- |
| `src/app/declarative-generative-ui/definitions.ts` | Zod schemas — what props each component accepts |
| `src/app/declarative-generative-ui/renderers.tsx` | React components keyed by the same names |

Renderer types are checked against definitions; mismatched props fail at compile time. To add a component, add an entry to both files — that's it. The agent picks it up automatically for both fixed-schema (`backend/agent/src/a2ui_fixed_schema.py`) and dynamic-schema (`backend/agent/src/a2ui_dynamic_schema.py`) tools.

The API route (`src/app/api/copilotkit/[[...slug]]/route.ts`) sets `a2ui.injectA2UITool: false` — the agent injects the A2UI tool itself, not the runtime.

## Branding

`src/lib/brand.ts` exports a default `brand` (currently `talabat`) consumed by `layout.tsx` for `<head>` and by `ExampleLayout` for the sidebar. Pages can override at the layout boundary — see `src/app/demo/` for the pattern (passes `brand="copilot"` instead of mutating the global).

## Commands

```bash
npm install
npm run dev                 # Next.js dev (turbopack) on :3000 — needs the backend running on :8123
npm run build               # standalone build
npm run test:e2e            # Playwright (serial, 10-min per test, drives real LLM flows)
```

`next.config.ts` sets `typescript.ignoreBuildErrors: true` (the docker-route-override `HttpAgent` doesn't line up with `CopilotRuntime` v2 types). Run `npx tsc --noEmit` if you want a real type check.

`AGENT_URL` (in `.env`) points the API route at the backend; default `http://localhost:8123`.

## Tech stack

Next.js 16 · React 19 · TailwindCSS 4 · CopilotKit v2 (`@copilotkit/react-core/v2`, `@copilotkit/runtime/v2`) · Hono (API handler) · Recharts · Zod · Playwright.

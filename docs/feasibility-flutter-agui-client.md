# Feasibility Assessment: Custom Flutter/Dart Client for AG-UI Agent Backend

**Audience:** Engineering leadership

---

## 1. Context

AG-UI is an open protocol for streaming agent events to a client UI. The reference implementation is **CopilotKit (React) + `@ag-ui/client`**, maintained by an external vendor team.

For Dart/Flutter, a basic community library exists, but its feature coverage is materially below the React client (limited generative-UI support, partial protocol coverage, smaller maintainer base).

Two realistic options for the Talabat Flutter app:

- **Option A** — Build and maintain our own Dart client.
- **Option B** — Use the CopilotKit React client inside a WebView embedded in the Flutter app.
- **Option C** — Wait for a first-party Dart SDK (no published roadmap exists today).

---

## 2. What a custom Dart client must own

A custom client is not a one-off port. It is a continuously-maintained surface across the following concern areas:

| Concern | What we own |
|---|---|
| **Transport** | HTTP + SSE streaming, abort, reconnect, optional protobuf framing. |
| **Event protocol** | ~30 distinct event types, each with parsing, ordering, and reducer semantics. |
| **State reducer** | Local mirror of agent state; streaming-delta application; snapshot reconciliation; JSON-Patch deltas; time-travel; interrupts. |
| **Controlled GenUI** | Tool registry, JSON Schema generation, renderer mapping, handler execution, follow-up runs. |
| **Declarative GenUI (A2UI)** | Surface state machine, data-model path binding, action round-trip, plus a catalog of ~18 widgets implemented to visual and behavioral fidelity. |
| **Streaming UX** | Partial JSON parsing to render generative UI as args stream in. |
| **Backwards compatibility** | Legacy-protocol shims for older agent backends. |
| **Lifecycle** | Per-thread isolation, subscription/throttling, abort on navigation, reconnect on foreground. |

Each area must track ongoing changes in the AG-UI specification and the LLM provider streaming formats.

---

## 3. Cost profile

| | Custom Dart client (Option A) | WebView with React client (Option B) |
|---|---|---|
| **Initial build** | 8–12 person-weeks | 1–2 person-weeks (bridge + shell) |
| **Ongoing maintenance** | ~0.5–1.0 FTE | Minimal — protocol churn absorbed by vendor |
| **Protocol drift risk** | Owned by us | Owned by vendor |
| **Feature parity with web** | Always trailing; must port each new feature | Automatic |
| **Native design system reuse** | Full — Flutter widgets all the way down | None — UI is web inside a WebView |
| **Performance** | Native | WebView overhead (JS runtime, DOM, bridge) |
| **UX consistency with native shell** | Full | Divergent (scroll, gestures, keyboard, theming) |

---

## 4. The decision

This is a trade-off between two axes.

**Faster time to market (WebView + React client)**
Ships in weeks and inherits vendor maintenance. The cost is that we cannot leverage the investment already made in the Flutter design system — generative UI surfaces would either render through stock CopilotKit components or require us to stand up a parallel design-system artifact in React/web to match the Flutter app's look and feel. That parallel artifact becomes its own maintenance commitment.

*Mitigation:* avoid building a full React design system and instead align only at the **design-token level** — spacing scale, typography ramp, brand colors, radii. This keeps the WebView surfaces visually consistent enough to feel like Talabat, while accepting that component-level patterns (cards, buttons, inputs, list rows) will not reuse our existing Flutter component library.

**Control over the native value chain (Custom Dart client)**
Lets agent-driven generative UI render through our existing Flutter design system, reusing the component-level investment already made. The cost is the initial build of an AG-UI Dart client and an ongoing commitment to track protocol and ecosystem changes.

---

## 5. Question for the decision-maker

> Is the goal to **prove value first** through a separate, isolated flow validated by a series of experiments, or to **embed agent-driven UI within existing screens** and have it leverage the design system that the rest of the app already runs on?

If the goal is the former, the WebView path with token-level alignment is the faster, lower-risk way to put the capability in users' hands and measure outcomes. If the goal is the latter, the custom Dart client is the path that unlocks deep integration and design-system reuse — at the cost of a longer ramp.

---

## 6. Recommendation

Proceed with the **WebView + React client** path, aligned at the design-token level for visual consistency. This lets us validate agent-driven UI in a contained, experiment-friendly surface, with vendor-maintained protocol coverage and feature parity with the web client. If the experiments show durable value and the capability earns a place inside existing core flows, the custom Dart client becomes a justified follow-on investment — by then, with real product evidence backing the maintenance commitment.

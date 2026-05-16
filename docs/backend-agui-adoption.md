# Backend Protocol Choice: Adopt AG-UI vs. Invent Our Own

**Audience:** Engineering leadership

---

## 1. Context

When we build agentic capabilities into Talabat, the backend must stream events to clients (mobile, web) — incremental LLM output, tool calls, state changes, generative UI, run lifecycle. The agent runtime itself (LangGraph, CrewAI, Mastra, or our own) emits framework-specific events that do not match what clients need.

Two options:

- **Option A** — Define and maintain our own client-facing protocol, designed for Talabat's current use cases.
- **Option B** — Adopt the AG-UI protocol as the backend output, and use existing framework adapters (LangGraph → AG-UI, etc.) to translate runtime events into the standard format.

---

## 2. The problem AG-UI solves

### 2.1 Framework heterogeneity

Each agentic framework emits a different event vocabulary:

- **LangGraph** — `on_chat_model_stream`, `on_tool_end`, `on_chain_end`, `on_custom_event`, etc.
- **CrewAI** — task/crew/agent lifecycle events with its own shape.
- **Mastra** — workflow/step events with its own shape.

If the client speaks directly to a framework, switching frameworks (or running multiple in parallel) means rewriting the client. AG-UI normalizes all of these into one event vocabulary:

```
Framework events  →  Framework→AG-UI adapter  →  AG-UI events  →  Client
```

The adapter is the only piece that knows about the framework. Everything downstream is uniform.

### 2.2 The M × N integration problem

Without a standard bridge:

- **M** agentic frameworks × **N** client surfaces = **M × N** custom integrations.
- Each integration carries its own bugs, edge cases, and maintenance load.

With a standard bridge:

- **M** framework→protocol adapters + **N** protocol→client adapters = **M + N** integrations.
- Adapters are small, well-scoped, and often already exist upstream.

For Talabat this is not hypothetical. We may want LangGraph for one capability, a different framework for another, and we already have multiple client surfaces (Flutter app, web).

### 2.3 What "the protocol" actually covers

A client-facing protocol is not just message framing. To support real agentic UX it must cover:

| Concern | What the protocol must define |
|---|---|
| **Transport** | Streaming format, framing, reconnect, abort. |
| **Run lifecycle** | Start, finish, error, step boundaries, interrupts, time-travel. |
| **Text streaming** | Token-level deltas with stable message IDs. |
| **Tool calls** | Streaming partial args, results, multi-step orchestration. |
| **State sync** | Bidirectional state with snapshots, JSON-Patch deltas, conflict semantics. |
| **Generative UI** | Both controlled (client renders a named component) and declarative (server sends a UI schema). |
| **Reasoning / thinking** | Extended-thinking streams (Anthropic-style) including encrypted variants. |
| **Threading** | Per-conversation isolation, history, regeneration. |
| **Extensibility** | Custom events, raw passthrough for framework-specific signals. |

A custom protocol must specify, document, version, and evolve all of this.

---

## 3. What "rolling our own" actually entails

A custom protocol is a multi-year commitment. The concern areas:

- **Specification authorship.** We define every event type, every field, every ordering rule. Drift between teams produces silent bugs.
- **Version management.** Backends and clients drift in lockstep. We own deprecation policy and migration shims.
- **Multi-framework adapters.** Every agentic framework we adopt needs a hand-written adapter from its events to ours.
- **Client implementations.** Every client (Flutter, web, future surfaces) needs an SDK we write and maintain.
- **LLM provider drift.** Streaming formats change frequently (Anthropic extended thinking, OpenAI tool call schema variants, structured output modes). Our protocol absorbs these or breaks.
- **Generative UI taxonomy.** If we want declarative UI (server sends a schema, client renders), we must design a component vocabulary, data-binding rules, and action protocol. This is the largest undertaking and is where most custom protocols stall.
- **Tooling.** Test harnesses, replay tools, schema validators, debugger integrations — all internal.

The end state of a successful custom protocol looks structurally identical to AG-UI, because the underlying problem shape is the same. The difference is maintenance ownership.

---

## 4. Cost profile

| | Custom backend protocol (Option A) | Adopt AG-UI (Option B) |
|---|---|---|
| **Spec authorship & versioning** | Owned by us | Owned by vendor + community |
| **Framework adapters** | One per framework, written by us | Existing for LangGraph, Mastra, CrewAI, etc. |
| **Client SDKs** | One per client, written by us | Existing React client; Flutter community SDK; protocol is open for new ones |
| **LLM provider drift absorption** | We patch each time | Vendor patches; we upgrade |
| **Generative UI standard** | We design from scratch | Existing (A2UI catalog + controlled-component pattern) |
| **Framework swap-ability** | Low — each swap is an integration project | High — change the adapter, keep the protocol |
| **Time to first integration** | Months | Days (adapter + endpoint already exist) |
| **Ongoing maintenance** | High — central protocol team responsibility | Low — track upstream changes |
| **Industry interoperability** | Talabat-only | Aligned with broader ecosystem |

---

## 5. The decision

This trade-off is structurally different from the client-side one.

On the **client** side, the question is whether to reuse a vendor implementation or build native — there is a real benefit to native control (design-system reuse, performance).

On the **backend** side, the protocol is internal plumbing. There is no Talabat-specific value in a custom event vocabulary; users never see it. The only meaningful axis is **maintenance ownership**:

- A custom protocol concentrates expertise and version churn inside Talabat. Every framework swap, every LLM provider change, every new client surface is our work to do.
- AG-UI distributes that load across an external community that has already solved the same problems.

---

## 6. Question for the decision-maker

> Do we want the protocol that connects our agents to our clients to be a **product capability** we differentiate on, or a **commodity layer** where we benefit from someone else solving the moving-target problems?

If the answer is "commodity layer," AG-UI is the choice — by design, it standardizes exactly the parts that have no product value but high maintenance cost.

---

## 7. Recommendation

Adopt **AG-UI** as the backend's client-facing protocol. Use existing framework adapters (LangGraph → AG-UI today, others as we add them) to translate runtime events into the standard format.

Rationale:

- It collapses the M × N integration problem to M + N.
- It absorbs LLM provider drift, framework drift, and generative-UI evolution without our engineering team carrying the cost.
- It preserves framework swap-ability — we are not locked into LangGraph for the next agent we build.
- It preserves client swap-ability — Flutter, web, or any future surface can integrate without a Talabat-specific SDK.
- The investment we would otherwise make in a custom protocol is better spent on product capabilities that users actually experience.

A custom protocol becomes worth revisiting only if AG-UI's evolution materially diverges from our needs in a way that adapters cannot reconcile — at which point we will have real, evidence-backed requirements to design against, rather than speculative ones today.

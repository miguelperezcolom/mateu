---
title: "Mateu and AI: why not just generate React?"
---

A fair question in the age of capable coding assistants: *why use Mateu at all — why not
let the AI build the whole UI, e.g. in React?*

Posed as "Mateu **or** AI", the question is already lost — it sounds like defending a
framework against a tide. The useful question is **what you ask the AI for**. Framed that
way, Mateu doesn't compete with AI; it **relocates** it.

## Two worlds, two artifacts

**AI generates React.** The artifact the AI produces is the *final code*: thousands of
lines of JSX, hooks, state, client-side validation. That is what someone reviews, versions,
maintains, and regenerates every time the domain changes.

**AI generates the metamodel (Mateu).** You ask the AI for the *intent* — an annotated
class — and a deterministic renderer downstream materializes it. This is the determinism
axis: **AI for intent→spec, a deterministic generator for spec→UI**. What changes is not
*whether* you use AI, but **the size and risk of what the AI emits**.

## Why this matters (structural, not cosmetic)

- **The review surface collapses.** Reviewing a 30-line metamodel is tractable; reviewing
  the equivalent generated React is not — and in practice nobody does, it gets approved on
  faith.
- **Consistency becomes a system property.** 500 screens behave the same because they share
  one renderer, not because the AI got it right 500 times in a row.
- **No double source of truth.** The domain lives in the backend; the UI is derived from it.
  A new field propagates by itself. Generated React gives you two representations of the same
  truth that someone must resync forever.
- **You can enforce invariants.** On a typed metamodel you can layer validation (annotation
  processing, fail-fast, ArchUnit). On generated React there is no typed metamodel to hold
  on to.

### The counterintuitive part

The **better** AI gets at generating React, the **stronger** the case for Mateu — not
weaker. The marginal cost of *producing* code trends to zero, but the marginal cost of
*trusting* generated code — reviewing it, maintaining it, guaranteeing it hasn't drifted —
does not. AI solves the cheap problem and leaves the expensive one intact. Mateu attacks the
expensive one.

## The layer above: coordinating the enterprise's UIs

Building *one* screen — with AI or without — is the small problem. The big one is making
**all** the UIs across an organization converge. That is a different league, and it is where
Mateu stops being "a way to build a screen" and becomes the **layer that sets the rules**
above the individual UIs:

- **One contract (UIDL) + one renderer** — N teams and hundreds of screens behave the same
  because they share a renderer. Consistency is a *system property*, not something to get
  right screen by screen.
- **A shared domain vocabulary** — company conventions are encoded once as composed
  (semantic) annotations (`@ProveedorId`, `@Importe`, …) and every screen inherits them.
- **Standard ports / SPIs** — `CrudRepository`, `ListingBackend`, `Translator`, role-based
  security, i18n. Every element plugs in the same way, so cross-cutting rules apply uniformly.
- **Federation** — Maven (build-time) and `RemoteMenu` / `MicroFrontend` (runtime) let many
  services and teams compose **one** coherent application, and the design system is governed
  in a single place.

So the debate isn't really "AI or not": AI **generates the pieces**; Mateu **governs how they
fit** — the contract, the vocabulary, and the composition that make an organization's UIs
converge. That governance is exactly what generated-React-per-team cannot give you.

## The honest pushback

No self-deception — the trade-offs are real:

- **The expressive ceiling is real.** Every new pattern (list degradation, master-detail,
  filter bars) is work in the renderer. Mateu can only do what its vocabulary expresses. When
  you need an interaction the metamodel doesn't cover, you hit a wall; AI generating React
  has no such wall. If your competitive value is *differentiated UX*, Mateu is a cage.
- **You own a framework.** "AI + React" outsources the renderer to the ecosystem; Mateu makes
  you the permanent owner of the renderer, the processor, and the metamodel. That is a real
  bus-factor question.
- **AI is far better at React than at Mateu.** Millions of React examples in training, almost
  none of Mateu. In the React world the AI is your natural ally; in the Mateu world it is a
  beginner. That erodes part of the "AI emits the spec cheaply" promise. (Shipping AI
  reference files and skills — see [Use Mateu with AI assistants](/ai-assistant-reference/) —
  narrows this gap but does not erase it.)

## The dividing line

Mateu wins when:

- the UI domain falls mostly **within its vocabulary** — enterprise CRUD, forms, lists,
  master-detail;
- you value **consistency and longevity** over maximum expressiveness;
- the cost of the renderer **amortizes over hundreds of screens** and years of maintenance.

For a startup whose product *is* the interface, the honest answer is: **don't use Mateu — let
the AI generate React and pay the cost of maintaining it.** For a large, long-lived portfolio
of business screens, that same cost is exactly what Mateu removes.

See also [When to use Mateu](/when-to-use-mateu/) and [Why Mateu](/mateu-about/why-mateu/).

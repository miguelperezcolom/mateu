---
title: "Philosophy"
---

Business applications are not complex by nature. Most of the complexity they accumulate is accidental — caused by the tools and patterns used to build them, not by the domain itself.

## The accidental complexity problem

A typical internal tool starts simple. Then the standard approach splits it:

```text
domain model          (Java)
  -> application layer (Java)
  -> REST API          (Java, OpenAPI)
  -> API client        (TypeScript)
  -> frontend model    (TypeScript)
  -> frontend validation (TypeScript / Zod)
  -> UI state          (React / Redux / Zustand)
  -> routing           (React Router / Next.js)
  -> component library (MUI / Tailwind)
```

Every one of those layers has to be built, kept in sync, and maintained by people who may be on different teams. A change to a field in the domain model triggers a cascade through all of them.

For a consumer product, that split is often worth it. For an order management screen, a role editor, or an internal control plane — it rarely is.

## What Mateu changes

Mateu keeps the definition in one place:

```text
domain model          (Java)
  -> Mateu UI definition (Java annotations + methods)
  -> browser rendering
```

State, validation, actions, layout, and navigation are all defined on the backend. Mateu produces the UI description from that definition. The renderer handles the browser mechanics.

A field added to `OrderRow` appears in the list. A `@NotEmpty` constraint on `ProductEditor` is enforced in the browser. A method annotated `@Button` becomes a clickable action. None of this requires touching a frontend codebase.

## What Mateu does not try to do

Mateu is not trying to replace all frontend development. Consumer-facing products with complex interactions, custom animations, and brand-specific experiences are not the target.

Mateu is targeting a large, underserved class of applications where the cost of the frontend split is high and the benefit is low:

- backoffice and admin tools
- internal portals
- enterprise workflow applications
- distributed control planes
- service-owned management UIs

For these, the goal is simple: less code, fewer moving parts, same outcome.

## Design principles

**The backend is the source of truth.** UI definitions live alongside the application code that powers them. There is no separate UI layer to keep in sync.

**Stateless interaction.** Mateu does not store UI state on the server between requests. This keeps the system horizontally scalable and compatible with modern deployment infrastructure.

**Adapters, not frameworks.** The UI is an inbound adapter — the same architectural concept as a REST controller. It calls the same application use cases, the same query services, the same ports.

**Rendering is pluggable.** The UI definition is a protocol. Different renderers can consume the same definition and produce different visual results. Switching design systems does not require rewriting the definition.

## Next

- [The Mateu mental model](/mateu-about/mental-model) — how ViewModels and UI definitions relate
- [Advantages](/mateu-about/advantages) — concrete benefits of this approach
- [Comparison with traditional stacks](/mateu-about/comparison) — side-by-side contrast

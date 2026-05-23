---
title: "UI Definition"
---

Mateu provides a complete Java API for building server-driven UIs. You describe the interface in Java — Mateu renders it.

## Sections

| Section | Description |
|---|---|
| [Fluent components](fluent-components/) | Ready-made UI components built with the fluent builder API |
| [Annotations](annotations/) | Declarative annotations for pages, fields, layouts, and actions |
| [Interfaces](interfaces/) | Interfaces to implement for data loading, routing, and action handling |
| [Fluent records](records/) | Core records: `Form`, `App`, `Page`, `Listing`, `Action`, and more |
| [YAML UI Definition](yaml-ui-definition/) | Define pages as YAML files — no Java class needed |

## Core idea

You don’t manually build UI.

You describe it in Java — Mateu renders it.

All three styles work and can be mixed:

- **Declarative** — annotate a plain Java class; Mateu infers the layout and behaviour.
- **Fluent** — build a component tree explicitly using builders and records.
- **YAML** — describe the component tree in a YAML file; no Java class needed at all.

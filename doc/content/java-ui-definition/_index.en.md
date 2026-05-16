---
title: "UI Definition"
type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

# UI Definition

Mateu provides a complete Java API for building server-driven UIs. You describe the interface in Java — Mateu renders it.

## Sections

| Section | Description |
|---|---|
| [Fluent components](fluent-components/) | Ready-made UI components built with the fluent builder API |
| [Annotations](annotations/) | Declarative annotations for pages, fields, layouts, and actions |
| [Interfaces](interfaces/) | Interfaces to implement for data loading, routing, and action handling |
| [Fluent records](records/) | Core records: `Form`, `App`, `Page`, `Listing`, `Action`, and more |

## Core idea

You don’t manually build UI.

You describe it in Java — Mateu renders it.

Both styles work and can be mixed:

- **Declarative** — annotate a plain Java class; Mateu infers the layout and behaviour.
- **Fluent** — build a component tree explicitly using builders and records.


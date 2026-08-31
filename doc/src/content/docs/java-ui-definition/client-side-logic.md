---
title: "Client-side logic"
---

Not all UI behavior needs a server round-trip.

Mateu supports client-side logic declaratively through rules and related browser-side mechanisms.

## Typical examples

Client-side logic is useful for things like:

- hiding or showing fields
- changing validation dynamically
- changing required / disabled state
- updating values
- changing styles or classes

## Rules

The main mechanism for this is `@Rule`.

Rules are evaluated in the browser and can:

- change field attributes
- update state
- run actions
- execute JavaScript
- apply styles or CSS classes

## Triggers vs rules

- **triggers** define when actions run
- **rules** define how the UI changes dynamically in the browser

## The line: client logic moves state, it does not build UI

`@Rule` can already run JavaScript, and shipping whole modules to the browser — a bundle built from
a TypeScript project, or Java transpiled with TeaVM — is a direction worth taking. Before any of it,
the boundary is worth stating, because it is what keeps the framework's central promise intact:

:::note[The invariant]
Client-side code may **read and write state, trigger actions and navigate**. It may **not construct
UI**.
:::

Building UI stays derivation. The moment client code can paint, a screen can diverge from the
declaration it came from, and "the UI cannot drift away from your model" stops being true — the one
claim the whole framework rests on.

That is not a restriction on what you can build, it is a restriction on *where*: a custom widget is
still a first-class extension point ([component adapters](/design-systems/bring-your-own-design-system/)),
declared like everything else. What the invariant rules out is UI appearing from imperative code
nobody declared.

There is a second reason, less philosophical: any API given to client code has to speak the language
of the **declared model** — components by id, state, actions, routes — and never the DOM. An API that
exposed the DOM would work on one renderer and break on the others, and "one declaration, many
renderers" would quietly stop being true.

## Why this matters

This gives you dynamic behavior without introducing a separate frontend application layer.

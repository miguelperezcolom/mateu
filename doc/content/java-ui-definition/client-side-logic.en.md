---
title: "Client-side logic"
weight: 75
---

# Client-side logic

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

## Why this matters

This gives you dynamic behavior without introducing a separate frontend application layer.

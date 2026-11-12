---
title: "Quality"
description: "How Mateu's generated UX is evaluated, what it guarantees for accessibility, and how renderers and servers are held to the same output."
---

Because every screen is derived from a model, quality is decided in one place — the derivation and
the renderers — and every app gets it without code of its own. These pages describe how that
quality is measured and enforced.

## UX

- [How UX is evaluated](/ux-patterns/how-ux-is-evaluated/) — heuristic reviews, task walkthroughs,
  synthetic users, task metrics, and what each method catches and misses.
- [UX patterns](/ux-patterns/) — the patterns screens are built from, each with its rationale.

## Accessibility

- [Accessibility](/ux-patterns/accessibility/) — what is guaranteed for keyboard and screen-reader
  users on every renderer (web, Redwood, mobile, IntelliJ), and the probes that verify it.
- [Accessibility conformance report](/quality/accessibility-conformance/) — WCAG 2.2 Level A and
  AA, criterion by criterion and per renderer, in the VPAT 2.5 structure, with the known gaps.
- [Accessibility in your code](/java-user-manual/advanced/accessibility/) — what is still yours to
  get right.

## Consistency across servers and renderers

- [Wire specification](/reference/wire-specification/) — the single contract.
- [Feature parity matrix](/reference/parity/) — what each server and each renderer supports.
- [Renderer contract](/design-systems/renderer-contract/) — conformance levels for a renderer.
- The repository's `conformance/` corpus renders the same cases in Java, .NET and Python and
  requires the outputs to match exactly.

## Testing and coverage

- [Testing your UIs](/quality/testing-your-uis/) — the test harness: open a route, read the screen,
  type and press, with no browser (Java, C#, Python).
- [Unit-testing view models](/java-user-manual/advanced/testing/) — testing actions and view models
  as plain objects.
- The project itself runs line-coverage gates on the Java core and on the web libraries, end-to-end
  Playwright suites against every Java adapter, and accessibility and slow-network probes against
  the renderers on every change.

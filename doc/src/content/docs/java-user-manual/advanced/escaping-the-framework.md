---
title: "When a screen does not fit"
description: The escape ramp at both altitudes — a custom component, or a page that builds itself — and exactly what you keep when you take it.
---

Every model-driven framework dies at the last 20%. Thirty-nine screens fall out of the templates
almost for free, and then one does not — and if the answer to that one is *"then Mateu is not for
you"*, the saving on the other thirty-nine stops mattering.

So the criterion here is not **can it be done**. It is:

> **The pain of the last 20% must not exceed the pain saved on the first 80%.**

Which depends entirely on **what you keep** when you drop down. That is what this page states, and
what [`EscapeHatchGuaranteesTest`](https://github.com/miguelperezcolom/mateu) pins so it cannot
quietly erode.

## Two altitudes

Escaping is not one thing. Pick the smallest one that solves your problem.

| Altitude | Use it when | How |
|---|---|---|
| **Component** | one *field or object* has no sensible Mateu representation — a legacy model, a bespoke widget | `ComponentAdapter<T>` ([reference](/java-ui-definition/interfaces/component-adapter/)) |
| **Page** | the *whole screen* is none of the six template families | implement `ComponentTreeSupplier` and return the tree yourself |

There is a third, further down: a custom **web component** in your renderer, for when the pixels
themselves are the problem. That one is renderer-specific and outside this page.

## What you keep

At page altitude — the bigger drop — this is measured, not asserted:

| | Survives? |
|---|---|
| **The route** | ✅ your screen keeps its own URL, resolved like every other |
| **Actions** | ✅ `@Action` methods stay reachable through the same wire; nothing about the request cycle changes |
| **State binding** | ✅ fields still hydrate from and round-trip through `componentState` |
| **The shell** | ✅ menus, app header, navigation — the screen stays part of the app |
| **Every renderer** | ✅ you composed wire components, so it paints on web, mobile and inside an IDE with no renderer work |
| **The canonical page header** | ⚠️ **only if you ask for it** — see below |
| **Action *discovery*** | ⚠️ you drew the screen, so advertising what can be fired is now your job |

### The header is the one that surprises people

A `ComponentTreeSupplier` that returns a bare layout gets **exactly that** — no page metadata, so no
title, badges, `@KPI` facts or peer navigation, even if the class carries `@Title`:

```java
@UI("/special")
@Title("Ignored here")           // ← no page metadata is emitted
public class Special implements ComponentTreeSupplier {
  public Component component(HttpRequest request) {
    return VerticalLayout.builder().content(...).build();
  }
}
```

To escape *and* stay inside the shell's page grammar, return a `PageView` — it carries the header
itself:

```java
public Component component(HttpRequest request) {
  return PageView.builder()
      .title("Special screen")
      .contentItem(whateverYouLike())
      .build();
}
```

Both are legitimate. The first is right for something embedded or full-bleed; the second for a screen
that should still look like part of the application. What matters is that the choice is **yours and
explicit**, rather than a surprise you discover after shipping.

## Coming back up

Nothing is one-way. A screen that escaped is an ordinary class with an extra method: delete
`component(...)` and it falls back to inference and the templates, keeping its route, actions and
state. That is the difference between an escape ramp and an exit.

## Do not reach for it first

Escaping costs you [layout inference](/ux-patterns/layout-inference/) and the template anatomy —
which is most of what you came for. The [Mateu Way](/the-mateu-way/) is three moves: pick the family,
start from its archetype, refine where you disagree. This page is for after all three, on the one
screen out of forty where they genuinely do not fit.

---
title: "Renderer contract"
description: What a renderer has to implement to be a Mateu renderer — and the conformance levels that tell you when you are done.
---

Mateu's contract is the wire: any server can serve any renderer. This page is the other side of it —
what a **renderer** must do — and, more importantly, **when it is finished**.

That second part is the one that has been missing. Four first-party web renderers were built and
retired (SAP UI5, Redwood-OJ, PatternFly, SLDS), which is not a run of bad luck: *one renderer per
design system, maintained in first person, does not survive a single maintainer*, because the cost is
proportional to the number of design systems in the world. The way out is not more first-party
renderers — it is making yours cheap enough to own.

## What a renderer does

A renderer receives `UIIncrementDto` and paints it. Concretely:

| It must | Detail |
|---|---|
| **Paint components** | walk the component tree and render each `type`; fall back to an explicit *unsupported* placeholder rather than silently dropping — that placeholder is what conformance measures |
| **Honour commands** | the increment carries `commands` (`SetWindowTitle`, `navigateTo`, `closeModal`, `dispatchEvent`…) |
| **Show messages** | `messages` are toasts/alerts, including the undoable ones |
| **Apply fragments** | an increment is a set of partial updates targeted by `targetComponentId`, not a full repaint |
| **Post actions** | a button, a row click or a trigger posts back with the current `componentState` |
| **Execute the fetch plan** | `optionsSource`, `rowsSource`, `restAction`, `restData` are fetched **client-side** from arbitrary endpoints — a renderer that ignores them shows empty selects and empty listings with no error |
| **Resolve routes** | in [bundle mode](/java-user-manual/build/static-bundle/), from the shipped [route registry](/java-ui-definition/route-registry/) |

And one thing it must **not** do: invent UI. Everything painted comes from the declaration; see
[the authoring rule](/authoring-rule/).

## Conformance levels

"Paint the whole catalogue" is not something a third party can act on, and it is why writing a
renderer has looked like an open-ended commitment. So the surface is split into three levels, and
**a level is reached when every fixture at that level renders with no unsupported placeholder, and
every level below it does too**.

| Level | What it buys | Fixtures |
|---|---|---|
| **Core** | A Mateu app *works*. Forms, field types, validation, actions, CRUD listings, text. | 7 |
| **Standard** | A back office is *pleasant*. Sections, tabs, accordions, zones, multi-column, badges, banners, KPIs, wizards, filtering, master-detail. | 12 |
| **Full** | The rich catalogue and the extension points. Charts, uploads, embedded islands, component adapters. | 4 |

**Core is a usable renderer.** Stopping there is a legitimate, complete answer — a renderer that
reaches Core and says so is more useful than one that claims everything and is half-finished in
places nobody has mapped.

## Measuring yours

The suite drives your renderer against the shared fixture app and detects the `<mateu-unsupported>`
placeholders your fallback emits:

```bash
cd e2e
./conformance.sh --renderer my-renderer   # wires your dev server to the SUT
```

It writes `conformance-report/<renderer>/report.md` with the level reached, what is failing at the
next one, and a screenshot per fixture. The console ends with the answer you actually want:

```
Conformance level reached: STANDARD
  ✓ core: 7/7
  ✓ standard: 12/12
  ✗ full: 2/4 — missing: mixed-chart, adapter
```

Publish that number. A renderer that declares **Core** honestly is contributable; one that leaves the
question open is not.

## Declaring partial support

A renderer publishes what it supports through `ComponentRendererSingleton.set`, and the report reads
it (`__mateuRendererInfo.supportedTypes`). Declaring a subset is not a defect — it is how the report
tells *"this type is not supported"* apart from *"this type broke"*, and only the second is a bug.

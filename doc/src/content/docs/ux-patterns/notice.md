---
title: Notice
description: A compact inline banner — a theme-tinted strip with a severity icon, one line of text and an optional action.
---

**Status:** ✅ Implemented

## Intent

Surface a short, glanceable notice **inside** the UI — "2 quejas pendientes" in a guest panel, "stock bajo" next to a product — as a small tinted strip that can live anywhere: inside cards, columns or forms. Smaller than a [callout card](/ux-patterns/callout-card/) (no title/CTA block) and independent of the page-level [banners](/ux-patterns/notifications/).

## Solution

Use the `Notice` component: one line of text, a small circular severity icon and an optional right-aligned action. `theme` — `info`, `success`, `warning` or `danger` — tints the strip; `icon` overrides the theme's default glyph.

```java
Notice.builder()
        .text(guest.complaints() + " quejas pendientes")
        .theme("danger")
        .actionLabel("Revisar").actionId("review")
        .build()
```

### Declarative: `@Notice` on a String field

The field's **value** is the notice text — and a `null`/blank value hides the notice entirely, so the field doubles as its own visibility switch:

```java
@Notice(theme = "danger", slim = true, fullWidth = true)
String quejas;   // set it when there is something to say; leave blank to show nothing
```

### Options

| Parameter | Effect |
|---|---|
| `theme` | `info` (default), `success`, `warning`, `danger` |
| `icon` | overrides the theme's glyph (ℹ ✓ !) — an emoji renders at natural size, without the severity circle |
| `noIcon` | suppresses the severity icon entirely |
| `slim` | tight variant: no block margins, reduced padding, `line-height: normal` |
| `fullWidth` | spans every form column (also stretches the wrapping field) |
| `actionLabel` + `actionId` | small right-aligned action, dispatched through the standard mechanism |
| `status` | right-aligned state text in the action's spot — for the in-flight/done states of the notice's action (e.g. "Enviando…", "Firmado ✓") |

### Arbitrary content

The fluent `Notice` also accepts `content` — any components rendered inside the tinted strip, below the text (or on their own when there is no text):

```java
Notice.builder()
        .text("2 quejas pendientes").theme("danger")
        .content(List.of(BulletedList.builder()
                .items(List.of("Aire acondicionado ruidoso", "Retraso en el room service"))
                .build()))
        .build()
```

## Where it works

Every web renderer (Vaadin, SAP UI5, Redwood, PatternFly), React Native and the IntelliJ plugin. Also available from the C# (`new Notice("…") { Theme = "danger" }`) and Python (`fluent.Notice(text=…, theme=…)`) backends.

## Related

- [Callout card](/ux-patterns/callout-card/) — the bigger sibling, with title and CTA block
- [Status list](/ux-patterns/status-list/) — rows of statuses with icons and actions

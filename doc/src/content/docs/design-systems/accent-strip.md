---
title: "Accent colour"
description: "Where an app's brand accent goes, following Redwood's cobranding rules: the Section dash, the welcome hero and the console name. No colour strip."
---

`@App(accentColor)` gives the shell the app's brand colour, for example
`@App(accentColor = "#D2232A")`. Mateu uses it the way Redwood uses a custom theme's accent colour.

## The Section dash

Every section title gets a **Section dash**: a short rule under the heading that marks where the
section starts. Its colour is the app's accent. With no accent it takes the theme's primary colour,
as Redwood does when no accent is assigned. The fold-out panels' titles carry the same dash.

```java
@App(accentColor = "#D2232A")
public class MyApp { ... }
```

The accent also paints the welcome hero's background (a deep tone of it) and the console name in
the menu band, in the light theme only.

## Why there is no colour strip

Redwood's **texture strip**, the decorated band at the foot of a page header, is Oracle's own
signature: each Oracle product family has its own colours and textures, and the strip tells the user
whose product they are in. Redwood's cobranding guidelines remove it as soon as a customer brings
their own brand: *"visual elements like the strip and data textures are removed to avoid conflicting
branding"*, and the customer's accent colour goes to the Section dash instead.

A Mateu app is never an Oracle product, so Mateu follows that rule and draws no strip.
`@App(accentStrip)` and `@App(accentStripSeed)` are deprecated and have no effect, and the strip
generator `io.mateu.core.infra.AccentStrip` is deprecated for removal.

The Redwood renderer is unaffected. It shows Spectra's page headers exactly as Spectra draws them.

## Custom properties

| Property | Set by | Used for |
|---|---|---|
| `--mateu-accent` | the shell, from `accentColor` | the dash, the hero, the console name |
| `--mateu-section-dash-color` | your CSS | the Section dash only, overriding the accent |
| `--mateu-page-band-h`, `--mateu-page-band-image` | your CSS only | an optional decorative band under the page header. Mateu never sets them |

An app's own CSS can set `--mateu-accent` instead of declaring `accentColor`.

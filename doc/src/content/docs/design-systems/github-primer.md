---
title: "GitHub Primer (preview)"
description: "A web renderer drawn with GitHub's Primer React — the real Primer components and tokens, light and dark."
---

The Primer renderer draws any Mateu UI with **Primer React** (`@primer/react`, MIT), GitHub's
design system: its `PageLayout` and `NavList` shell, `PageHeader`, `FormControl` inputs,
`DataTable`, `Dialog`, `Banner`, `ActionMenu`, `UnderlineNav` and the Primer tokens, in light and
dark mode. It is the real Primer, not a theme over another design system.

It is a **preview**: it draws the whole wire catalogue and passes the Core, Standard and Full
conformance fixtures, but its API surface (how an app registers a custom component, for one) may
still change.

## Add to your project

Use it **instead of** `mateu-vaadin`:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-primer</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

and say so in the project descriptor, so the visual editor, Play and a static bundle agree with the
served app (the server warns at startup when they differ):

```yaml
# src/main/resources/specs/ui/project.yaml
type: Project
renderer: primer
```

The served page is the usual Mateu page: the server fills the title, the favicon and the mount, and
the renderer's files are served from `/assets/` like any web renderer's — under a context path or
a proxy prefix too. A C# server serves it with `MATEU_UI` pointing at the jar (or its `static/`
folder), a Python one with `add_mateu(ui=…)`.

## What it draws

- The app shell in every menu variant (side navigation, top bar, tabs, tiles, card menus), with
  `@AppContext` pickers, header actions, the notification bell, live header values, presence, the
  theme toggle, the ⌘K palette and command center, app shortcuts, the idle warning, FABs and the
  assistant panel.
- The full page header (overline, badges, KPIs, peer navigation, record switcher, banners), the
  `@Toc` index, page widths and `@Compact`.
- Listings in every layout, with filters, saved views, the column chooser, totals and groups,
  inline editing, drag to a drop zone, selector lookups and imports.
- Built-in sign-in (the same providers as every web renderer) and static bundles.
- Its own texts in English, Spanish, French, German, Portuguese and Italian.

## Known gaps

- The visual editor's canvas previews a `primer` project with Vaadin for now.
- `Bpmn` is read-only (as on Vaadin).
- A few texts that Primer React itself draws ("Select rows") stay in English.

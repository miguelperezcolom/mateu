---
title: "SAP Fiori (preview)"
description: "A web renderer drawn with SAP's UI5 Web Components and the Fiori floorplans — Horizon light, dark and high contrast."
---

The SAP renderer draws any Mateu UI with **SAP's UI5 Web Components** (`@ui5/webcomponents`,
`-fiori`, `-icons`, through the official `@ui5/webcomponents-react` wrappers — Apache-2.0) and the
**Fiori floorplans**: the shell bar and side navigation, the list report (filter area, table
toolbar, growing table), the object page header and its anchor bar, the wizard, analytical cards,
the timeline, illustrated messages, message strips and dialogs — in SAP's Horizon theme, light,
dark and high contrast. It is SAP's own design system, not a theme over another one.

Fiori elements (the generated List Report and Object Page of SAPUI5 + OData) is a different,
model-driven system and is not used: Mateu is the model, and the Fiori **guidelines** decide how it
is drawn.

It is a **preview**: it draws the whole wire catalogue and passes the Core, Standard and Full
conformance fixtures, but its API surface may still change.

## Add to your project

Use it **instead of** `mateu-vaadin`:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-ui5</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

and say so in the project descriptor, so the visual editor, Play and a static bundle agree with the
served app (the server warns at startup when they differ):

```yaml
# src/main/resources/specs/ui/project.yaml
type: Project
renderer: ui5
```

The served page is the usual Mateu page: the server fills the title, the favicon and the mount, and
the renderer's files — SAP's 72 font included — are served from `/assets/` like any web renderer's,
under a context path or a proxy prefix too. **Nothing is fetched from SAP's servers.** A C# server
serves it with `MATEU_UI` pointing at the jar (or its `static/` folder), a Python one with
`add_mateu(ui=…)`.

## What it draws

- The app shell as Fiori's shell bar: the menu as side navigation or an icon tab bar, `@AppContext`
  pickers, header actions, notifications, the profile menu, live header values, the theme toggle
  (Horizon light / dark; high contrast follows the operating system), the ⌘K palette and command
  center, app shortcuts, the idle warning, FABs and the assistant panel.
- Record pages with the object page header (badges, KPIs, peer navigation, record switcher,
  banners) and the `@Toc` index as its anchor bar; page widths and `@Compact`.
- Listings as list reports, in every layout, with filters, saved views, the column chooser, totals
  and groups, inline editing, drag to a drop zone, selector lookups and imports.
- Fields with Fiori's own controls: date, time and date-time pickers, step inputs, combo boxes,
  multi-combo boxes, rating indicators, sliders, colour pickers.
- Built-in sign-in and static bundles; its own texts — and UI5's — in English, Spanish, French,
  German, Portuguese and Italian.

## Known gaps

- The visual editor's canvas previews a `ui5` project with Vaadin for now.
- `Bpmn` is read-only (as on Vaadin).

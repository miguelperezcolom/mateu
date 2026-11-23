---
title: "Salesforce Lightning (preview)"
description: "A web renderer drawn with Salesforce's Lightning Design System — its blueprints' markup and CSS, outside the Salesforce platform."
---

The Salesforce renderer draws any Mateu UI with the **Lightning Design System** (SLDS,
`@salesforce-ux/design-system`, code under BSD-3-Clause): the Global Header and Context Bar shell,
record-home page headers, cards, the data table, the combobox, the datepicker and timepicker, Path,
modals, docked panels, toasts and SLDS's utility icons. SLDS publishes **blueprints** — markup plus
CSS — and Salesforce's own Lightning Base Components are not open source outside the platform, so
the interaction (keyboard, focus, ARIA) is Mateu's, written to each blueprint's documented
behaviour.

It is a **preview**: it draws the whole wire catalogue and passes the Core, Standard and Full
conformance fixtures, but its API surface may still change.

## Add to your project

Use it **instead of** `mateu-vaadin`:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-slds</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

and say so in the project descriptor, so the visual editor, Play and a static bundle agree with the
served app (the server warns at startup when they differ):

```yaml
# src/main/resources/specs/ui/project.yaml
type: Project
renderer: slds
```

The served page is the usual Mateu page; the renderer's files are served from `/assets/` like any
web renderer's — under a context path or a proxy prefix too. A C# server serves it with `MATEU_UI`
pointing at the jar (or its `static/` folder), a Python one with `add_mateu(ui=…)`.

## Licences

- SLDS's code is BSD-3-Clause. Its **icons and images are CC BY-ND 4.0**: the jar ships them
  unmodified (the utility sprite as the package publishes it), with the attribution and the licence
  in its `THIRD-PARTY-LICENSES.txt` and `META-INF/NOTICE`.
- **Salesforce Sans is not shipped**: the page uses the system font stack, which SLDS 2 allows. If
  you have the right to use Salesforce Sans, add it to your page yourself.
- SLDS's logo class is never used: its default image is Salesforce's own mark.

## What it draws

The same screens as every Mateu web renderer — the app shell in every menu variant, the full page
header, listings in every layout with filters, saved views and the column chooser, dashboards,
wizards, boards, overlays, built-in sign-in and static bundles — in SLDS's markup. Its own texts are
in English, Spanish, French, German, Portuguese and Italian.

## Known gaps

- Light only: SLDS 2 publishes no dark theme, so `themeToggle` draws nothing.
- The visual editor's canvas previews an `slds` project with Vaadin for now.
- A lookup opens a search popover rather than SLDS's inline lookup; a multi-select is the
  multi-selection combobox, not the dueling picklist; rich text, file upload, slider and colour
  fields keep the renderer's own widgets inside an SLDS form element.
- `Bpmn` is read-only (as on Vaadin).

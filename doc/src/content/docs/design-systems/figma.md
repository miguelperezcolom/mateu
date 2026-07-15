---
title: "Figma design-to-code"
description: "Design screens in Figma with the Mateu component library and generate the Java/C#/Python implementation through modux."
---

**Status:** 🚧 In progress — the contract, the library generator plugin and the modux importer
exist; the code generation templates are the next step.

## The idea

A designer composes screens in Figma using a **Mateu component library** (Lumo/Vaadin flavor),
and a generator turns those designs into working Mateu views — no hand-off, no re-implementation:

```
contract.json ──► Figma plugin ──► Mateu library ──► designer composes screens
      └─────────► modux importer ◄── Figma REST API (reads the composed screens)
                        └──► modux model (pages) ──► Java / C# / Python
```

The key is the **design contract** (`design/figma/contract.json` in the Mateu repo): every Mateu
component appears once, with its Figma component name (`Mateu/<Category>/<Name>`), variant axes
named exactly like the Mateu annotation parameters (`theme`, `slim`, `propertyList`…), the text
layers that map to labels/titles, and a `#config` line for ids (`fieldId=email; actionId=save`).
Both ends read it: the Figma plugin **builds** the library from it, and modux's importer maps the
designs **back** through it.

## What exists today

- **The contract** — 64 components: the full Mateu catalog (fields, sections/zones, Notice,
  StatusList, EntityHeader, wizard + stepper, crud listing + smart filter bar, dashboards, gantt,
  kanban, app shells…).
- **The library generator** — a Figma plugin (`design/figma/plugin`) that creates the whole
  library programmatically: run it once inside Figma, publish the file as a team library, re-run
  whenever the catalog grows.
- **The importer** — modux's `importfigma` use case downloads a Figma file through the REST API
  and turns every top-level frame into a page of the modux model, with the Mateu instances (and
  their variants, texts and config) as its content tree.

## What's next

The modux generation templates consuming the imported content trees to emit the Java — and then
C# and Python — implementation of each designed screen.

See `design/figma/README.md` in the repository for the designer conventions and the detailed
pipeline documentation.

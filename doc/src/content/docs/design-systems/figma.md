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

## The full flow, step by step

1. **Generate the library** (once, and whenever the catalog grows): open Figma, import
   `design/figma/plugin/manifest.json` as a development plugin, run *Mateu Library Generator* on
   an empty file and publish it as a team library.
2. **Design**: the designer composes screens using only instances from the library — one
   top-level frame per screen. Variants select the styled knobs (`theme`, `propertyList`,
   `gridLayout`…), text layers carry the labels/titles, and the small `#config` line the ids
   (`fieldId=email; actionId=save`).
3. **Bring the design into the repo**: download the file JSON —
   ```bash
   curl -H "X-Figma-Token: $FIGMA_TOKEN" \
        https://api.figma.com/v1/files/<FILE_KEY> > src/main/figma/screens.json
   ```
4. **Generate the code** with the Maven plugin (modux repo, `figma-maven-plugin`):
   ```xml
   <plugin>
     <groupId>io.mateu.modux</groupId>
     <artifactId>figma-maven-plugin</artifactId>
     <version>0.1.0-SNAPSHOT</version>
     <executions><execution><goals><goal>generate</goal></goals></execution></executions>
     <configuration>
       <basePackage>com.acme.frontoffice.ui</basePackage>
       <languages><language>java</language><language>csharp</language><language>python</language></languages>
     </configuration>
   </plugin>
   ```
   Every designed frame becomes a view class under `target/generated-sources/figma` (the Java
   ones join the compilation automatically): fields with their `@Label`s and `@Section`s
   (propertyList/frameless/zones), notices, texts, bulleted lists, separators and buttons come
   out ready; rich display components and wizard/crud frames come out as annotated skeletons with
   `TODO`s for the developer to finish.
5. **Alternatively, import into the modux model** (`importfigma` use case) when the screens
   should live in a full modux specification (aggregates, use cases, sagas…) rather than as
   standalone views.

## What's next

Deepening the emitters (wizard steps, crud detail wiring, dashboards) and the modux generation
templates consuming the imported content trees for the full-model path.

See `design/figma/README.md` in the repository for the designer conventions and the detailed
pipeline documentation.

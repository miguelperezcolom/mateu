# Mateu ⇄ Figma — design-to-code pipeline

```
contract.json ──► plugin (this repo) ──► Figma library ──► designer composes screens
      └────────► modux figma importer ◄── Figma REST API (reads the composed screens)
                        └──► modux model (pages[].content) ──► Java / C# / Python
```

`contract.json` is the **single source of truth**: every Mateu component appears once, with

- `name` — the Figma component name (`Mateu/<Category>/<Name>`); the importer recognizes
  instances by this name.
- `variants` — Figma VARIANT axes, named **exactly** like the Mateu annotation/record
  parameters (`theme`, `slim`, `propertyList`, `gridLayout`…).
- `props` — non-visual config (fieldId, actionId…). The plugin materializes them as a subtle
  text layer named `#config` whose content is `key=value; key2=value2` — designers fill the
  values, the importer parses them.
- `texts` — the named text layers whose (overridden) content maps to the given Mateu param
  (`Title` → `title`, `Text` → `text`…).
- `sketch` — the compact draw spec the plugin renders (visual only, never read back).
- `java` / `csharp` / `python` — the construct each component maps to, for the generators.

## Generating the library

1. `cd plugin && npm install && npm run build`
2. In Figma: **Plugins → Development → Import plugin from manifest…** → pick
   `plugin/manifest.json`, then run *Mateu Library Generator* on an empty file.
3. The plugin creates one page per category (`Mateu · Fields`, `Mateu · Layout`, …) with a
   component (or variant set) per catalog entry. Publish the file as a team library.

Re-running the plugin **replaces** the generated pages — do it whenever `contract.json` grows
(new Mateu components) and re-publish.

## Designing screens (conventions the importer relies on)

- Compose screens with **instances from the library only**; free-drawn shapes are ignored.
- One top-level frame per screen; its name becomes the route/view name.
- Rename nothing inside instances; **edit text layers** to set labels/titles/texts, and the
  `#config` line to set ids (`fieldId=email`, `actionId=save`…).
- Use variants for the styled knobs (theme, slim, gridLayout, progress…) — they map 1:1 to the
  Mateu parameters.
- Nesting: put field instances INSIDE a `Mateu/Layout/Section` instance's content area (or a
  ZonesRow column) exactly like the generated code will nest them.

## Reading back (modux)

modux's Figma importer (`model-driven-generator`, use case `importfigma`) downloads the file via
the Figma REST API (`GET /v1/files/:key`, token in `FIGMA_TOKEN`), walks the document, matches
`Mateu/*` instances against this contract and produces `pages[].content` trees
(`UiComponentNodeEntity`: `kind` + params) in the modux model — from which modux generates the
Java (and C#/Python) implementation.

## Status and how to pick it up (2026-10-29)

The library has **never been generated in a real Figma** — the plugin is verified only by
`tsc`, esbuild and its unit tests (Figma cannot run headless), and no Mateu library is published
yet. The goal is to generate it from scratch, review it and publish it. It needs **Figma Desktop
on macOS or Windows**: the browser cannot import development plugins and there is no official
Linux client.

1. Build the plugin (Node 20+; `dist/` is git-ignored, so this is always needed):
   ```bash
   cd design/figma/plugin
   npm ci
   npm run typecheck && npm test   # 2 tests: every contract sketch primitive is drawable
   npm run build                   # → dist/code.js (~76 kB)
   ```
2. In Figma Desktop create an EMPTY design file (e.g. "Mateu UI Kit").
3. *Main menu → Plugins → Development → Import plugin from manifest…* →
   `design/figma/plugin/manifest.json`.
4. *Plugins → Development → Mateu Library Generator*. Expect one page per category
   (`Mateu · Field`, `Mateu · Layout`, `Mateu · Display`, `Mateu · Page Templates`…) and the toast
   `Mateu library generated: 84 components ✔`. If it fails, the error is in
   *Plugins → Development → Show/Hide console*.
5. Review every page. Things to look at on this first real run: text overflowing its sketch, variant
   sets laid out badly (the set uses horizontal wrap auto-layout), missing fonts, components whose
   sketch does not read as the Mateu component. Fix in `src/code.ts` (drawing) or `../contract.json`
   (what is drawn), rebuild, re-run the plugin — it REPLACES the `Mateu · *` pages it generated, so
   iterating is safe.
6. Delete the empty "Page 1", optionally add a cover page, and publish:
   - Figma **Professional** or above: *Assets → Publish library* (a team library others enable and
     get updates from);
   - the **Starter** plan cannot publish team libraries (as far as we know) → *Share → Publish to
     Community*, and check whether consumers can enable it as a library or only duplicate it.
7. Put the resulting URL in this README and in `doc/.../design-systems/figma.md` (section
   "Generating the library"), so designers use the published file instead of generating their own.

Re-publish whenever `contract.json` grows: re-run the plugin on the same file, review, publish
the update.

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

---
title: "Figma design-to-code"
description: "Design screens in Figma with the Mateu component library — every component and page template — and generate specs/ui YAML (or Java/C#/Python through modux) from them."
---

**Status:** 🚧 In progress — the contract, the library generator plugin and the Figma → YAML
converter exist and are tested; the library has not been generated in a real Figma and published
yet (see "Generating the library").

## The idea

A designer composes screens in Figma using a **Mateu component library**, and those designs become
working Mateu screens — no hand-off, no re-implementation:

```
contract.json ──► Figma plugin ──► Mateu library ──► designer composes screens
      ├─────────► figma-to-yaml  ◄── Figma REST API ──► specs/ui YAML (served, or a static bundle)
      └─────────► modux importer ◄── Figma REST API ──► Java / C# / Python
```

The key is the **design contract** (`design/figma/contract.json` in the Mateu repo, also packaged in
the `io.mateu:mateu-uidl` jar at `META-INF/mateu/contract.json`): every Mateu component appears
once, with its Figma component name (`Mateu/<Category>/<Name>`), variant axes named exactly like the
Mateu parameters (`theme`, `buttonStyle`, `backgroundColor`…), the text layers that map to
labels and titles, the `#config` line for ids (`fieldId=email; actionId=save`), the named **slots**
a designer fills, and what the component becomes in YAML. Every end reads it: the plugin **builds**
the library from it, and the converters map the designs **back** through it.

## What the library holds

- **Every authorable YAML component** — 160 entries: fields, layouts (sections, tabs, form layouts,
  dashboard and foldout layouts…), display components (notices, metric cards, charts, timelines,
  avatars, badges…), listings with their columns, buttons and toolbars, overlays (drawer, dialog,
  popover). Each of the 125 component types of the YAML schema has an entry, except 12 that have
  nothing to draw (data and state carriers, raw custom elements, embedded views — the contract's
  `yamlNotDrawn` says why for each). A test keeps it that way: a new YAML component without an entry
  fails the build.
- **Every YAML page template** — one `Mateu/Page Templates/<type>` component per
  [page template](/define/yaml/pages/#page-templates--template), named exactly as the YAML `type`:
  `ItemOverviewPage`, `WelcomePage`, `DashboardLandingPage`, `GeneralOverviewPage`,
  `CollectionDetailPage`, `FoldoutPage`, `MultimediaContentPage`, `AdvancedCreateEditPage`,
  `GuidedProcessPage` and `DataManagementPage`, plus the two parts they hold
  (`GuidedProcessStep`, `DockedPanel`). Each draws the page header (`Overline`, `Title`,
  `Subtitle`), the toolbar slot, and the template's own slots (`body`, `footer`, `kpi`, `info`,
  `list`, `noSelection`, `overview`, `detail`, `steps`, `end`, `bottom`) beside `content`; the
  template's fields are variants (`backgroundColor`, `orientation`) or `#config` keys
  (`avatar.src`, `avatar.initials`, `photo.src`).
- The **Java archetypes** (`Mateu/Page Templates/Dashboard`, `Wizard`…) stay in the library for
  the modux path; they have no YAML counterpart, and the converter says which YAML template to use
  instead.

## Generating the library

The plugin (`design/figma/plugin`) creates the whole library programmatically — Figma Desktop on
macOS or Windows is needed (the browser cannot import development plugins):

1. `cd design/figma/plugin && npm ci && npm run build`
2. In Figma Desktop, create an empty design file, then *Plugins → Development → Import plugin
   from manifest…* → `design/figma/plugin/manifest.json`.
3. Run *Plugins → Development → Mateu Library Generator*: one page per category
   (`Mateu · Field`, `Mateu · Layout`, …, `Mateu · Page Templates`), one component (or variant
   set) per contract entry.
4. Publish the file as a team library. Re-run the plugin on the same file whenever the contract
   grows — it replaces the `Mateu · *` pages — and re-publish.

The step-by-step checklist for the first real run (what to review, how to publish on each Figma
plan) is in `design/figma/README.md`.

## Designing a screen

- **One top-level frame per screen**; its name becomes the file name (`Fleet` → `fleet.yaml`).
  Frames whose name starts with `_` are scratch and skipped, and so are the library's own
  `Mateu · …` pages.
- **A templated page**: drop the page template instance — as the screen itself, or inside the
  screen frame — and edit its `Title`, `Subtitle` and `Overline` text layers. Pick its variants
  (a `WelcomePage`'s `backgroundColor`) and fill its `#config` (an `ItemOverviewPage`'s
  `avatar.src=${state.image}`).
- **Slots** are the frames named `slot:<name>` the template draws. Fill them in place, or — since
  an ordinary instance takes no new layers — put a frame **named the same** (`slot:body`,
  `slot:toolbar`, `slot:kpi`) next to the template instance in the screen frame. Anything else
  next to it is the page's `content`. The page's actions go in `slot:toolbar` (Button instances,
  the primary first).
- **A free page** is a screen frame without a template: an optional `Mateu/Page/Header` instance
  gives its title, subtitle and toolbar, everything else is its content.
- Inside slots, use library instances. A plain frame is a layout (horizontal or vertical by its
  auto-layout, or the layout its name says: `FormLayout`); a plain text layer is a `Text` (a
  heading from 18 px). Containers (Section, Card, Tab, DashboardPanel, Drawer…) have their own
  `slot:` frames.
- Edit **text layers** for labels and titles (a layer left with its placeholder text is not read),
  use **variants** for the styled knobs, and fill the **`#config`** line for ids and routes
  (`fieldId=name; required=true`, `route=people/${state.id}/edit`, `rowsSource.ref=swapi-people`).
- A frame named `partial:<ref>` is shared: it becomes `{type: Partial, ref}` and its content is
  written once to `partials/<ref>.yaml` — the way two collection-detail pages share one list.
- Hidden layers and layers whose name starts with `#` are notes, never content.

## Generating YAML from a design

```bash
# 1. download the file (a personal access token with file read scope)
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     https://api.figma.com/v1/files/<FILE_KEY> > design.json

# 2. write specs/ui (Node 20+, no dependencies to install)
node design/figma/to-yaml/bin/figma-to-yaml.mjs design.json --out src/main/resources/specs/ui
```

Each screen becomes a `type: Form` page — with the `template:` its template instance names, the
template's slots filled from its `slot:` frames, and the instances inside mapped to their YAML
components (params from variants, `#config` and text layers). For example, a screen frame `person`
holding an `ItemOverviewPage` instance, a `slot:toolbar`, a `slot:body` with three PropertyRow
fields and a Tabs instance becomes:

```yaml
type: Form
title: "${state.name}"
subtitle: Character
toolbar:
  - type: Button
    buttonStyle: tertiary
    actionId: backToList
    label: Back to People
    actionable:
      type: RouteLink
      route: people
template:
  type: ItemOverviewPage
  avatar:
    src: "${state.image}"
  body:
    - type: FormField
      id: gender
      dataType: string
      propertyRow: true
      readOnly: true
      label: Gender
content:
  - type: TabLayout
    tabs:
      - type: Tab
        label: Details
        content:
          type: Text
          text: "${state.name} was born on ${state.birth_year}"
```

The converter never invents a name: every key it writes is checked against the generated authoring
schema and every value typed by it (`maxColumns=2` → `2`, `searchable=true` → `true`). What the
schema does not describe — an unknown `#config` key, a value with no YAML counterpart, a Java-only
archetype — is left out and reported as a warning. `--clean` deletes the `.yaml` files already in
the output directory before writing. The generated files carry a header comment naming the frame
they come from: regenerate them from the design rather than editing them, and keep what Figma cannot
express (`sources.yaml`, `routes.yaml`, `actions:`) in files of their own.

What a design cannot say stays out: REST sources (`sources.yaml`), routes, the data a chart or
gantt shows, and the actions a button runs beyond its `actionId` / `route`.

## Generating Java / C# / Python (modux)

The modux repository reads the same designs into code:

- its Maven plugin (`figma-maven-plugin`, goal `figma:generate`) turns every designed frame of
  the downloaded JSON (`src/main/figma/*.json`) into a view class under
  `target/generated-sources/figma`: fields with their `@Label`s and `@Section`s, notices, texts,
  bulleted lists, separators and buttons come out ready; rich display components and wizard/crud
  frames as annotated skeletons with `TODO`s;
- its `importfigma` use case brings the screens into a full modux specification (aggregates, use
  cases, sagas…).

## What's next

Generating and publishing the library in a real Figma; reading the YAML page templates in the modux
importer (it still reads only the Java archetypes); and a design file with every template filled
in, as a starting point for designers.

See `design/figma/README.md` in the repository for the designer conventions and the detailed
pipeline documentation.

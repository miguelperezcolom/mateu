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
labels and titles, the config each component takes (`fieldId`, `actionId`, `route`, `required`…),
the named **slots** a designer fills, and what the component becomes in YAML. Every end reads it: the plugin **builds**
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
  template's fields are variants (`backgroundColor`, `orientation`) or properties
  (`avatar.src`, `avatar.initials`, `photo.src`).
- **Slots and properties on every component.** Each named slot is a native Figma slot (about 90 in
  the library), and each component's config and editable texts are component properties (about 150
  config properties — TEXT or BOOLEAN — and 190 text properties): see
  [Slots and properties](#slots-and-properties) below.
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
   grows — or after updating Mateu, when the plugin itself changed (native slots and properties
   came that way) — it replaces the `Mateu · *` pages; then **re-publish** and accept the library
   update in the design files that use it.

When it ends, the plugin notifies how many properties and native slots it created and, if Figma
refused any, how many fell back to the older conventions (a `#config` layer, a plain `slot:` frame)
— both still read by the converters.

The step-by-step checklist for the first real run (what to review, how to publish on each Figma
plan) is in `design/figma/README.md`.

## Designing a screen

- **One top-level frame per screen**; its name becomes the file name (`Fleet` → `fleet.yaml`).
  Frames whose name starts with `_` are scratch and skipped, and so are the library's own
  `Mateu · …` pages.
- **A templated page**: drop the page template instance — as the screen itself, or inside the
  screen frame — and set its `title`, `subtitle` and `overline` in the properties panel. Pick its
  variants (a `WelcomePage`'s `backgroundColor`) and fill its properties (an `ItemOverviewPage`'s
  `avatar.src` = `${state.image}`).
- **Slots** are the dashed areas the template draws (`slot:body`, `slot:toolbar`, `slot:content`…):
  drag library instances into them (see [Slots and properties](#slots-and-properties)). You can
  also put a frame **named the same** (`slot:body`) next to the template instance in the screen
  frame; anything else next to it is the page's `content`. The page's actions go in the toolbar
  slot (Button instances, the primary first).
- **A free page** is a screen frame without a template: an optional `Mateu/Page/Header` instance
  gives its title, subtitle and toolbar, everything else is its content.
- Inside slots, use library instances. A plain frame is a layout (horizontal or vertical by its
  auto-layout, or the layout its name says: `FormLayout`); a plain text layer is a `Text` (a
  heading from 18 px). Containers (Section, Card, Tab, DashboardPanel, Drawer…) have their own
  `slot:` frames.
- **A Section's fields go in its content slot.** Drag the fields and buttons into the
  `Mateu/Layout/Section` instance. (With a library from before native slots, put them **under** the
  Section in the same frame instead: everything after a Section whose content slot is empty belongs
  to it, up to the next Section — that reading still works.)
- Set **properties** in the right panel for labels, titles, ids and routes (`fieldId` = `name`,
  `required` on, `route` = `people/${state.id}/edit`, `rowsSource.ref` = `swapi-people`); a text
  left with its placeholder is not read. Use **variants** for the styled knobs.
- A frame named `partial:<ref>` is shared: it becomes `{type: Partial, ref}` and its content is
  written once to `partials/<ref>.yaml` — the way two collection-detail pages share one list.
- Hidden layers and layers whose name starts with `#` are notes, never content.

## Slots and properties

The library uses two Figma features so that a designer never edits hidden layers:

- **Native slots.** Every named slot of a component (a Section's `content`, a template's `toolbar`,
  `body`, `kpi`…, a Card's or a Drawer's content) is a Figma slot. Select the instance and **drag**
  library instances into the dashed area, or insert them from the slot's **+**. A toolbar slot offers
  the Button first. The slot grows with what you put in it; its grey caption is a hint (a `#` layer)
  and is never read — delete it or leave it. The order inside the slot is the order in the page.
- **Component properties.** Every component's config — `fieldId`, `actionId`, `route`, `rowsSource.ref`,
  `required`, `readOnly`… — is a property in the **right panel** (a text box, or a toggle for the
  yes/no ones), next to its variants. Its texts (`label`, `title`, `subtitle`, the placeholder) are
  text properties too, bound to the layer you see: editing either is the same value. Repeated rows
  are named after their layer (`Title1`, `Title2`).

What the converters read, in order: the variants; then the properties; then — for instances that
come from an older library — the `#config` line and the text layers. A value set as a property wins
over the same one in `#config`.

**Updating from an older library.** Re-run the plugin on the library file and re-publish it (see
[Generating the library](#generating-the-library)). Instances already placed with the old library
keep working: their `#config` lines are still read, and a Section whose content slot is empty still
takes the layers that follow it. Accepting the library update in a design file gives its instances
the slots and properties; the converters read both spellings in the same file.

Figma's REST API does not yet document how slot content appears in `GET /v1/files`; the converters
accept a child of type `SLOT` (named after its slot, or linked to its `slot:<name>` property) and a
frame named `slot:<name>`. A layer of a type they do not know is reported as a warning, never
dropped silently — if a real file shows one, send it in.

## Generating YAML from a design

```bash
# 1. download the file (a personal access token with file read scope)
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     https://api.figma.com/v1/files/<FILE_KEY> > design.json

# 2. write specs/ui (Node 20+, no dependencies to install)
node design/figma/to-yaml/bin/figma-to-yaml.mjs design.json --out src/main/resources/specs/ui
```

Each screen becomes a `type: Form` page — with the `template:` its template instance names, the
template's slots filled from what was dropped into them, and the instances inside mapped to their
YAML components (params from variants and properties — or `#config` and text layers for older
instances). For example, a screen frame `person`
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
schema does not describe — an unknown property or `#config` key, a layer of an unknown type, a value with no YAML counterpart, a Java-only
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

# redwood-spectra — Oracle JET 19 + Spectra renderer for Mateu

`RedwoodSpectraComponentRenderer` draws the Mateu wire format with **real Oracle JET 19 (`oj-c`)
and Spectra UI (`oj-sp`) web components loaded from Oracle's public CDN** — nothing JET-related is
bundled or copied into this repo. It was written from scratch against `libs/mateu` (the shared
renderer contract) and `apps/vaadin` (reference for app wiring only). No code from `redwood-oj*`,
`sapui5`, `slds` or `redhat` was read or reused.

## Build / run / verify

```bash
# build (tsc + vite) — must stay green
yarn workspace redwood-spectra build

# dev (proxies the explorer backend on :8595)
yarn workspace redwood-spectra dev

# conformance suite against the e2e SUT (mvc-app1) — starts the SUT itself if needed
CONF_PORT=5299 e2e/conformance.sh redwood-spectra 8191 --settle 4000
```

Current conformance: **23/23 fixture routes rendered, 0 `<mateu-unsupported>` placeholders**
(report: `e2e/conformance-report/redwood-spectra/report.md`).

## Architecture

```
index.html          Oracle Redwood theme CSS (3 stylesheets, see below) + fonts + binding provider
src/oj-bootstrap.ts RequireJS + Oracle's own bundle configs from the CDN; preloads every oj-c/oj-sp
                    module the renderer uses; stashes { ready, ArrayDataProvider } on
                    window.__mateuOj; mounts <mateu-ui> only after JET is up
src/set-env.ts      registers the renderer + re-adopts Mateu shell static styles (light DOM)
src/oj.ts           ojReady(), ArrayDataProvider factory, shadow-root style injection, the two
                    Mateu contract events (value-changed / action-requested)
src/RedwoodSpectraComponentRenderer.ts
                    the renderer: OJ_RENDERED set (own switch), DELEGATED set (shared switch),
                    crud/toolbar/pagination hooks, CDN-down graceful degradation
src/fields.ts       FormField stereotype/dataType → oj-c field mapping
src/buttons.ts      Button → oj-c-button chroming; header toolbar / peer-nav hooks
src/layouts.ts      Card (hand-styled), TabLayout (oj-c-tab-bar), AccordionLayout
                    (oj-c-collapsible), FormLayout (oj-c-form-layout), H/V layouts
src/crud.ts         Crud table → oj-c-table, sort chips, pagination
src/spectra.ts      oj-sp mappings (metric card, scoreboard, hero, empty state, foldout…)
src/misc.ts         Badge, ProgressBar, Chart (chart.js config → oj-chart)
src/index.css       Lumo→Redwood token bridge + mateu-page band hooks + hand-built Redwood pieces
```

Key design decisions:

- **CDN bootstrap.** `oj-bootstrap.ts` loads RequireJS, Oracle's JET `bundles-config.js` and the
  Spectra `oj-sp-bundle-config.js` from `static.oracle.com`, then adds the one missing piece
  (`paths['oj-sp']`, which the Spectra config does not define) and preloads all modules. If the CDN
  is unreachable, `window.__mateuOj.ready` stays `false` and **every hook delegates to the shared
  base renderer** — the app degrades gracefully instead of breaking.
- **Three theme stylesheets.** `oj-redwood-min.css` alone does not define the
  `--oj-c-EXPERIMENTAL-DO-NOT-USE-*` custom properties the oj-c components read; Oracle serves them
  as two extra sheets (`Common/themes/redwood/theme.styles.css` + `Theme-redwood/theme.css`).
  `<body>` also needs `data-oj-binding-provider="preact"` or oj-c silently renders nothing.
- **oj-sp are Knockout-era composites.** They need `ojs/ojknockout` + `oj-sp/messages-manager/loader`
  loaded, and their complex attributes must be set as **kebab-case attributes with JSON strings** —
  setting JS properties renders an empty component.
- **Light DOM shell.** The renderer calls `setUseShadowRoot(false)` for the Mateu shell so oj-c
  markup (light DOM, styled from the document) works everywhere; `set-env.ts` re-adopts the Mateu
  shell components' static styles into the document so nothing loses its layout. For the few hooks
  that render inside *kept* shadow roots (`mateu-content-header` toolbar/peer-nav), the oj-c
  runtime stylesheets plus small shadow fixes (header right gutter, KPI metric styling) are injected
  at hook-call time — lit's `ref` directive is unreliable here because the monorepo loads two lit
  instances and directive classes are not shared across them.
- **Mateu contracts preserved.** Fields dispatch `value-changed {fieldId, value}`, buttons and row
  actions dispatch `action-requested {actionId, parameters}` (both bubbling + composed), crud
  page/sort state stays in `container.state` and re-search goes through
  `container.handleSearchRequested(undefined)`.

## Type → component mapping

| Mateu type | Rendered with | Why |
|---|---|---|
| FormField `regular` (text) | `oj-c-input-text` | Redwood text field |
| FormField `password` | `oj-c-input-password` | built-in reveal affordance |
| FormField `textarea` | `oj-c-text-area` | — |
| FormField `radio` | `oj-c-radioset` | real radio group |
| FormField `select`/`combobox`/`searchable`/`choice` | `oj-c-select-single` + `ArrayDataProvider` | Redwood select |
| FormField `listBox` | `oj-c-select-multiple` | multi-value |
| FormField `toggle` | `oj-switch` | Redwood switch |
| FormField `stars` | `oj-c-rating-gauge` | real rating control |
| FormField `slider` | `oj-slider` | real slider |
| FormField `fileUpload`/`uploadableImage` | `oj-c-file-picker` (+ image preview; file travels as data URI in the field value, per the Mateu contract) | Redwood dropzone |
| FormField `bool`/`boolean` | `oj-c-checkbox` (label via default slot) | — |
| FormField numeric dataTypes | `oj-c-input-number` | — |
| FormField `date` | `oj-c-input-date-picker` | `null` (not `''`) when empty — empty string throws in JET 19 |
| FormField `time` | `oj-c-input-time-mask` | same null rule |
| FormField `datetime` | date-picker + time-mask side by side | no single oj-c datetime picker |
| FormField read-only / `plainText` | hand-built Redwood read-only (small secondary label over value) | matches RDS read-only pattern |
| FormField `image`/`badge`/`link`/`markdown`/`color` | hand-built / `oj-c-badge` / `oj-link` | small presentational stereotypes |
| Button | `oj-c-button` chroming: primary→`callToAction`, error→`danger`, tertiary→`borderless`, else `outlined`; `oj-c-menu-button` for menus | Redwood button hierarchy |
| Card | hand-styled Redwood slab (white, hairline border, 8px radius) | keeps Mateu structure (TOC anchors, headers); oj-c has no card container |
| TabLayout | `oj-c-tab-bar` (`layout="condense"`) inside a `mateu-oj-tabs` host that hides/shows panels client-side | real Redwood tab strip; tab items use `itemKey` (NOT `id`) or keys resolve to `undefined` |
| AccordionLayout | stack of `oj-c-collapsible` (label via `header` slot) | real disclosure panels |
| FormLayout | `oj-c-form-layout` (`direction=row`, colspan flow); FormRow/FormItem flatten into the field stream | native Redwood form grid |
| HorizontalLayout / VerticalLayout | flex divs (spacing/alignment/justification mapped) | pure structure, no JET equivalent needed |
| Crud | `oj-c-table` (columns/data as properties, `ojRowAction` → `view`), server-side sort via clickable column-header chips, `oj-c-button` prev/next pagination; filter bar + toolbar stay shared (`mateu-filter-bar` + toolbar hook) themed Redwood | oj-c-table has no built-in sort UI or paging control in JET 19 |
| Badge | `oj-c-badge` | — |
| ProgressBar | `oj-c-progress-bar` (`value=-1` = indeterminate) | — |
| Chart | `oj-chart` (chart.js config translated; doughnut → pie with one series per label) | real JET chart |
| MetricCard / Scoreboard | `oj-sp-metric-card` / `oj-sp-scoreboard` | Spectra signature components |
| HeroSection | `oj-sp-welcome-page` | Spectra welcome hero |
| EmptyState | `oj-sp-empty-state` | Spectra empty state |
| FoldoutLayout | `oj-sp-foldout-layout` + `oj-sp-foldout-panel` | Spectra foldout |
| DashboardPanel | `oj-sp-dashboard-panel` | Spectra panel |
| Skeleton | `oj-c-skeleton` | — |
| Page / Form / App / Dialog / Drawer / Popover / Tooltip / MenuBar / Breadcrumbs / Text / Avatar… | **shared Mateu chrome** (delegated), themed via the Lumo→Redwood token bridge + `mateu-page` band hooks (`--mateu-page-band-*`, Redwood color strip) | structural containers where the design system lives in CSS, not in the component swap |

## Known gaps / notes

- **`/full-crud` renders blank under the conformance harness — backend/fixture quirk, not the
  renderer.** The SUT throws `NoSuchElementException` (`FilteredAutoCrud.buildNamedView`) when the
  nested ux posts `consumedRoute=""`: the crud router treats `full-crud` as a row id. The `vaadin`
  reference renderer fails identically on the same request body (its screenshot shows just
  "Not found"; this renderer shows an empty shell — same broken UX, different fallback text).
- **`/catalog-read-only` and `/catalog-filterable`** resolve to an `App` fixture whose nested home
  load returns another identical `App` (verified with raw sync calls — the recursion never
  terminates server-side), so no renderer can draw real content; vaadin shows "Not found", this
  renderer shows an empty shell. Conformance still reports 0 placeholders for both.
- **Crud `list` / `masterDetail` / `tree` layouts fall back to the table view.** oj-c-list-view is
  loaded but the list/tree variants are not specialised yet.
- **No sort indicators inside `oj-c-table`.** JET 19's table has no sort API; sorting is server-side
  via the clickable column-header chips above the table.
- **No paging control.** JET 19 has no pagination component; prev/next `oj-c-button`s + page label
  are used.
- **`oj-sp-smart-filters` is not used** for the crud filter bar — the shared `mateu-filter-bar`
  already implements the smart-search chips pattern and keeps all the Mateu state wiring, so it is
  themed Redwood via the token bridge instead.
- **MenuButton uses legacy `oj-menu`** for the popup (the oj-c menu surface is not public API).
- **`datetime` fields render as two controls** (date picker + time mask) because JET 19 has no
  single datetime picker; the pair writes one ISO value.
- **Page KPIs** (`Page.kpis`) are rendered by the *shared* `mateu-content-header` as bare divs
  (libs/mateu is not modified); this renderer dresses them as Redwood metrics by injecting CSS into
  that shadow root.
- Everything needs network access to `static.oracle.com`; without it the renderer delegates to the
  shared base renderer (usable, but not Redwood).

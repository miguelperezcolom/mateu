# Redwood «Dashboard landing page» — review against the guide (2026-10-23)

Source: the Redwood usage guideline for the template (`oj-sp-dashboard-landing-page`,
`oj-sp-dashboard-landing-page-pattern`, category *Overview*, since 22A) — a short page: description
+ technical names + one anatomy image — completed with the category page "Choosing the right overview
page template" (header/scoreboard/performance title/grid/panel, hero vs above-the-fold, supported
components, configurations) and the real `oj-sp` 2604.1.0 API (`design/vb-page-template-apis.md`
§2.6).

Working rule: in Redwood, **Spectra/VB rule** — their template, component and contract before an
imitation of ours; imitate only when their contract cannot be met with Mateu's content, and say so.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Mateu pieces: `Dashboard` archetype
(`backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/dashboard/Dashboard.java`),
composition in `DashboardComposer.java:35-83`; Redwood painting is the GENERIC host content (no
dashboard branch): `frontend/web/monorepo/apps/redwood/poc/core/content.mjs:801-890` (ResponsiveGrid,
DashboardPanel, Scoreboard, MetricCard) and the `isScoreboard` atom in `poc/templates/atoms.html:226-255`.

## 1. When to use it

A prioritised overview of business performance assembled from several sources: a KPI strip to keep
track of the key numbers, visualizations to compare patterns, an optional featured heading. In Mateu:
the `Dashboard` archetype (or a plain class with `MetricCard` fields under `@AutoPage` →
`InferredDashboard`).

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Header | title (req.), subtitle, primary action, timestamp, object/context switcher | `@Title` (window title); `@Toolbar` methods (`ComponentTreeSupplierMapper.java:83-121` wraps the tree in a `PageView` with toolbar/buttons only) | the shared VB header `oj-sp-header-general-overview` (title from `windowTitle`, `poc/core/pageHeader.mjs:536`; primary = `callToAction` button, `pageHeader.mjs:400-408`) | 🟡 title + actions only — subtitle/timestamp/switcher are page metadata the archetype never emits (only `ReflectionPageMapper.java:45-66` reads them) |
| 2 | Scoreboard | strip of KPIs; scrolls sideways with arrows | consecutive `MetricCard` fields → `Scoreboard` (`DashboardComposer.java:50-54,93-98`) | `div.oj-flex.mateu-scoreboard` of `oj-panel` tiles (`atoms.html:226-255`) — **imitation**, not `oj-sp-scoreboard`; tiles wrap | 🟡 |
| 3 | Performance title | optional featured heading | none | none | ❌ |
| 4 | Dashboard grid | predefined layouts for 1–5 panels (hero / above the fold) | `ResponsiveGrid` with `columns()` tracks (`DashboardComposer.java:79-82`); `@Panel(colSpan,rowSpan)` | `columns()` > 0: `gridColClasses` → oj-flex columns honouring colSpan; `columns()` = 0 (default): auto-fit cells that keep each child's width — the Scoreboard the whole row, a panel its `colSpan` (fixed 2026-10-23, `autoFitColClass(template, cells)`) | 🟡 (`rowSpan` ignored) |
| 5 | Dashboard panel | title + subtitle + one business story | `@Panel` → `DashboardPanel` (`DashboardComposer.java:58-68`) | card block with title/subtitle (`content.mjs:489-497`) inside `div.oj-panel` — not `oj-sp-dashboard-panel` | 🟡 |
| — | The template itself | `oj-sp-dashboard-landing-page` (slot `kpi`, default) | — | **composed** (generic header + generic content) | 🟡 see §7 |

## 3. Responsive behaviour

| Breakpoint | Guide (image/category page) | Mateu / Redwood | Status |
|---|---|---|---|
| Wide | scoreboard one line (arrows), panels side by side per layout | wide: scoreboard tiles in one row while they fit, then wrap; panels per `columns()` | 🟡 |
| Narrow | panels stack | oj-flex `oj-sm-12` for every block → stacked | ✅ |

## 4. Page properties

| Property | Guide | Mateu | Status |
|---|---|---|---|
| Page layout | edge to edge / full width / fixed width | `@PageWidth` on the class → `ServerSideComponentDto.pageWidth` (`ComponentTreeSupplierMapper.java:69`); default `fixed` (`poc/core/overviews.mjs:424-438`) | ✅ |
| Density | standard / compact | `@Compact` NOT read (only `PageMetadataExtractor.java:174`, reflected pages); `style()` returning `StyleConstants.COMPACT` works (`poc/pageProjection.mjs:299-316`) | 🟡 |

## 5. Elements

| # | Element | Req. | Mateu | Redwood | Status |
|---|---|---|---|---|---|
| 1 | Title | yes | `@Title` | header `page-title` | ✅ |
| 2 | Subtitle | no | — (`@Subtitle` unread on a ComponentTreeSupplier) | — | ❌ |
| 3 | Primary action | no | `@Toolbar(buttonStyle = primary)` | `primary-action` | ✅ |
| 4 | Object / context switcher | no | `RecordSwitcherSupplier` exists, but only `ReflectionPageMapper` reads it | — | ❌ on the archetype |
| 5 | Timestamp | no | `@Timestamp` unread here | — | ❌ |
| 6 | KPI: label/value/unit/trend/caption | — | `MetricCard` | atom tile | ✅ (imitation) |
| 7 | KPI selection / drill-in | no | `MetricCard.actionId` | a borderless "View" button under the value (`atoms.html:247-250`), the tile itself is not the target | 🟡 |
| 8 | `scoreboardSticky` | no | — | — | ❌ |
| 9 | `maxKpis` | no | — | — | ❌ |
| 10 | Performance title | no | — | — | ❌ |
| 11 | Panel title / subtitle | yes / no | `@Panel(title, subtitle)` | ✅ | ✅ |
| 12 | Panel `rowSpan` | — | `@Panel(rowSpan)` | ignored (only column classes, `content.mjs:454-477`) | 🟡 |
| 13 | Edit layout (user) | no | `reorderable()` (`Dashboard.java:38-41`) | drag + Alt+←/→ (`content.mjs:835-846`) | 🟡 per viewer; no content library/share (out of scope) |
| 14 | PWA back arrow | no | — | — | ➖ |

## 6. Supported panel components

| Guide | Mateu | Redwood | Status |
|---|---|---|---|
| JET chart | `Chart`, `TrendChart` | `oj-chart` | ✅ |
| JET treemap / sunburst | — | — | ❌ |
| JET thematic map | `Map` (street map) | Leaflet (JET has no street map; `poc/map.mjs`) | 🟡 different kind of map |
| List view / summarizing collection | `Grid`, `StatusList`, `Markdown` | `oj-table`, atoms | ✅ |
| Embedded analytics canvases | — | — | ➖ |
| Empty state | `EmptyState` | `oj-sp-empty-state` | ✅ |
| Drawers (general, create-edit) | action returning `Drawer` | drawer overlay | ✅ |

## 7. Template component vs composition

There is no `oj-sp-dashboard-landing-page` in `main-start-page.html` (grep: only general-overview,
foldout, welcome banner, guided process, smart-filter-search…). Its contract is a header (canonical
props) + slot `kpi` + a default slot of panels — Mateu's content fits it: the scoreboard goes to
`kpi` (as `oj-sp-scoreboard` with `data` = the metrics), the grid of `DashboardPanel`s to the default
slot (as `oj-sp-dashboard-panel`s with `panelTitle/panelSubtitle`). The panel *content* is
VB-painted atoms, which a slot can host (unlike the anchor navigator). Cost: a dashboard branch in
the projection (detect `Scoreboard` + `DashboardPanel` at top level, like `welcomeOf`) and its
generated surface.

## 8. Proposed plan

1. ~~Fix the auto-fit default~~ — done 2026-10-23: a `Scoreboard` keeps the full row and a
   `DashboardPanel` its `colSpan` without tracks too.
2. **Dashboard branch on Spectra**: `oj-sp-dashboard-landing-page` + `oj-sp-scoreboard` (`kpi`) +
   `oj-sp-dashboard-panel`; KPI click via the scoreboard's `selection` instead of a "View" button.
3. **Header metadata on composed archetypes**: let `withPageBars` also carry `@Subtitle`,
   `@Timestamp`, `RecordSwitcherSupplier`, `@Compact` (one fix for Dashboard, Welcome, ItemOverview,
   Foldout).
4. **Performance title**: a `performanceTitle()` hook on `Dashboard` (a heading before the grid).
5. `scoreboardSticky` / `maxKpis` only on demand.

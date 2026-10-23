# Redwood «Data management» — review against the guide (2026-10-23)

Source: the Redwood guide page of the Data management page template (`oj-sp-data-grid-ui-pattern`,
`oj-sp-data-management-page`; category *Transactional*, since 22B — description plus one anatomy
image), and the real API in `design/vb-page-template-apis.md` §2.9.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

## 1. When it is used

Reviewing, editing and planning a **large, complex data set** on one dense page: a spreadsheet-like
data grid (sort, filter, inline editing) and a Gantt of the same records, switchable, with panels
docked beside or under them. In Mateu: the `DataManagement` archetype
(`orchestrators/datamanagement/DataManagement.java:34`).

## 2. Regions (anatomy, from the guide's image + API)

| # | Region | Guide / API | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Transactional page header | avatar, title, subtitle, undo/redo/history, Cancel, secondary actions, Primary, timestamp | `heading()` = a `Text` (`DataManagement.java:116-126`); no header actions hook | an xl `Text` in the content | ❌ no transactional header |
| 2 | Tab bar under the header | tabs | — | — | ❌ |
| 3 | Collection toolbar | edit icons (copy/cut/paste…), actions, menu, sort, view toggle, export, column settings | the switcher (two `Button`s, `DataManagement.java:96-108`) + panel toggles (`:109-114`) | `oj-button`s | 🟡 only the view switcher and panel toggles |
| 4 | Search | `search` slot ("Ask Oracle") | — (app-level smart search / ⌘K) | — | 🟡 |
| 5 | Data grid | dense, numbered rows, cell selection, inline editing | `gridView(rq)` — any component (fluent `Grid`, embedded crud with `@InlineEditing` + `@Compact`) | fluent `Grid` → `oj-table` (`coverage.mjs:118`) | 🟡 a table, not a spreadsheet-like data grid (no cell selection / `oj-data-grid`) |
| 6 | Gantt | the same records on a timeline | `ganttView(rq)` → `Gantt` | `oj-gantt` (`poc/core/boards.mjs:102`, `coverage.mjs:93`) | ✅ |
| 7 | `innerEnd` / `innerBottom` panels (reflow) | docked panels | `endPanel(rq)` / `bottomPanel(rq)` → `DockedPanel` (`DockedPanel.java`), `ResponsiveGrid` fill+fixed track stacking under 48rem (`DataManagement.java:135-153`) | `ResponsiveGrid` → oj-flex columns | ✅ |
| 8 | `outerEnd` / `outerBottom` (overlay) | overlay panels | return a `Drawer` from an action | `oj-drawer-popup` at the end edge only | 🟡 |
| 9 | `messages` slot | page messages | wire `messages` (toasts) | toasts | 🟡 |
| — | The template itself | `oj-sp-data-management-page` | — | not used: a composed `VerticalLayout` (`DataManagement.java:165-176`) | 🟡 imitation |

## 3. Responsive behaviour

The guide has no responsive section. Mateu: full width (`PageWidthStyle.FULL_WIDTH`,
`DataManagement.java:66`); the end panel stacks under the view below 48rem; the bottom panel caps its
height at `size` (default 16rem) and scrolls.

## 4. Configuration

| Element | Guide / API | Mateu | Vaadin | Redwood | Status |
|---|---|---|---|---|---|
| Full-width canvas | page layout | `pageWidth()` = `FULL_WIDTH` | ✅ | ✅ | ✅ |
| Grid ⇄ Gantt switch | yes | `gridView`/`ganttView`, `gridLabel()`/`ganttLabel()`, state `_view` (`:36-37, 240-249`) | ✅ | ✅ | ✅ |
| Docked end / bottom panels (reflow) | `innerEnd/innerBottom`, `endOpened/bottomOpened` | `DockedPanel(id, title, content, size, open)`, toolbar toggles, ✕ in the panel | ✅ | ✅ | ✅ |
| Overlay panels | `outerEnd/outerBottom`, `endDisplay/bottomDisplay` | a `Drawer` from an action (`modeless`, `position`) | ✅ | 🟡 end edge, always modal | 🟡 |
| `bottomDrawerState` / `bottomDrawerMode` / height | API | `DrawerPosition.bottom` + `collapsible` + `maximizable` | ✅ | ❌ (see bottom-drawer review) | 🟡 |
| Transactional header (Save/Cancel, undo/redo, history, timestamp) | yes | — | ❌ | ❌ | ❌ |
| Inline editing in the grid | yes | an embedded `AutoCrud` with `@InlineEditing` as `gridView` | ✅ | not verified for an embedded crud inside a composed page | 🟡 |
| `density` | yes | `@Compact` / `Grid.compact` | ✅ | ✅ (`oj-table` display) | ✅ |
| Feedback survey | API | ⚪ out of scope | — | — | ➖ |

## 5. Findings

1. **No transactional header**: the guide's image shows title + Cancel/Primary/undo/redo/timestamp;
   the archetype composes only a heading `Text` and a toolbar, with no hook for header actions.
2. The grid is a table, not a data grid: no cell-level selection/editing on a fluent `Grid`; the
   editable path is an embedded crud with `@InlineEditing`.
3. Overlay panels inherit the Redwood drawer gaps (end edge only, always modal).
4. The page doc said Redwood draws neither grid nor Gantt — stale: both render (`oj-table`,
   `oj-gantt`). Corrected.
5. No Redwood demo route shows docked panels (`demo-redwood-showcase` `/data-management-demo` has
   none; the e2e fixture `/patterns/data` runs on Vaadin).

## 6. Proposed plan

1. Give `DataManagement` header actions (primary/secondary/cancel, timestamp) — e.g. let it honour
   `@Toolbar` methods and `@Timestamp`, or paint it inside `oj-sp-data-management-page` in Redwood.
2. Add `endPanel`/`bottomPanel` to the showcase demo so the docked panels can be shown on Redwood.
3. Longer term: a `DataGrid` (cell selection + editing → `oj-data-grid`) for the grid view.

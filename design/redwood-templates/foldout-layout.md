# Redwood «Foldout layout» — review against the guide (2026-10-23)

Source: the Redwood usage guideline (`oj-sp-foldout-layout`, `oj-sp-dynamic-foldout-page`,
`oj-sp-foldout-layout-vertical-pattern`, `oj-sp-foldout-layout-horizontal-pattern`; category
*Details* — not Overview —, since 21B). The guide is only a one-line purpose + names + one image
(dark overview panel with avatar/name/contact facts, navigation icons on top, several panels of
sections to its right), so the review leans on the real `oj-sp` 2604.1.0 API
(`design/vb-page-template-apis.md` §2.12).

Working rule: in Redwood, **Spectra/VB rule** — their template, component and contract before an
imitation of ours; imitate only when their contract cannot be met with Mateu's content, and say so.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Mateu pieces: `Foldout` archetype
(`backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/foldout/Foldout.java`),
records `FoldoutLayout`/`FoldoutPanel`/`FoldoutNavigation` (uidl `data/`). Redwood: projection
`foldoutOf`/`foldoutHeaderOf`/`foldoutSummaryOf`
(`frontend/web/monorepo/apps/redwood/poc/core/archetypes.mjs:29-174`), folded strips
`poc/foldouts.mjs`, markup `main-start-page.html:2690-2730` (layout + overview panel) and
`:6277-6300` (panels).

## 1. When to use it

An overview of a business object or process plus two or more categories of associated information.
In Mateu: `Foldout` (fluent: `FoldoutLayout`).

## 2. Regions (anatomy)

| # | Region | Guide (image + API) | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Navigation header | go to parent, previous/next object, search | `navigationHeader()` → `FoldoutNavigation` (`Foldout.java:62-64`) | the layout's own header: `display-options.go-to-parent`, `previous-step`/`next-step`, `bidirectional-navigation` (`main-start-page.html:2705-2717`; `archetypes.mjs:125-146`) | ✅ (search ❌) |
| 2 | Overview panel | identity + key info, edit | first non-`@Panel` component (`Foldout.java:184-192`), `headerTitle()` (`:102-113`), `headerBadges()` (`:119-147`), `overviewEditActionId()` (`:71-73`) | first `oj-sp-foldout-panel`, fixed 25rem (vertical) or `slot="overview"` (horizontal); `secondary-actions` pencil → `spAction` (`main-start-page.html:2721-2731`) | ✅ |
| 3 | Fold-out panels | `oj-sp-foldout-panel` × N (title, summary, recommendation, noData, secondaryActions) | `@Panel` fields → `FoldoutPanel` (`Foldout.java:194-203`) | `oj-sp-foldout-panel` per panel (`main-start-page.html:6277-6300`) | ✅ (see §5) |
| 4 | Drill-down | slot `drilldown` | — | — | ❌ |
| — | The template itself | `oj-sp-foldout-layout` | `FoldoutLayout` | **Spectra's component** | ✅ |
| — | Dynamic foldout page | `oj-sp-dynamic-foldout-page` (metadata-driven VB page) | — | — | ➖ |

## 3. Responsive behaviour

| Breakpoint | Guide / component | Mateu / Redwood | Status |
|---|---|---|---|
| Wide | panels side by side, horizontal scroll, paging dots | Spectra's layout (no flex wrapper so its responsive logic engages — comment at `main-start-page.html:2690-2693`) | ✅ |
| Narrow | one panel per view, dots | same | ✅ |
| Folded panels | the component has no folded state | `open=false` → strip + title + summary, unfolded by the layout's own selection (`poc/foldouts.mjs:1-11`) | ✅ (documented imitation of a state Spectra lacks) |

## 4. Page properties

| Property | Guide | Mateu | Status |
|---|---|---|---|
| Page layout | edge to edge (the template paints its own canvas) | `Foldout.pageWidth()` = `EDGE_TO_EDGE` (`Foldout.java:46-49`); `@PageWidth` overrides | ✅ |
| Orientation | vertical / horizontal patterns | `orientation()` (`Foldout.java:154-156`) → `overview` slot when horizontal | ✅ |
| Background | `default \| transparent` | fixed `transparent` (`main-start-page.html:2710`) | 🟡 not configurable |
| Page header | — | VB header kept when the page has toolbar actions or an `EntityHeader` (`onMateuNavigate.js:504-506`) | ✅ |

## 5. Elements

| # | Element | Mateu | Redwood | Status |
|---|---|---|---|---|
| 1 | Go to parent (+ label) | `FoldoutNavigation.parentLabel/parentActionId` | `go-to-parent` + `translations.go-to-parent` | ✅ |
| 2 | Previous / next | `previousActionId` / `nextActionId` | `previous-step` / `next-step` → `spPrevious`/`spNext` | ✅ |
| 3 | Search slot | — | — | ❌ |
| 4 | In-flow back | — | — | ❌ |
| 5 | Overview title | `headerTitle()` / `@Title` | `panel-title` | ✅ |
| 6 | Overview badges | `List<Badge>` field | JET badges, **neutral** — the colour is dropped (`archetypes.mjs:66-70`) | 🟡 |
| 7 | Overview edit | `overviewEditActionId()` | `secondary-actions` pencil | ✅ |
| 8 | Panel title | `@Panel(title)` | `panel-title` | ✅ |
| 9 | Panel subtitle | `@Panel(subtitle)` | joined into `panel-title` ("A · B") (`archetypes.mjs:90`) | 🟡 |
| 10 | Panel icon | `@Panel(icon)` (Mateu addition) | decorative span, Spectra has none (`main-start-page.html:6283-6287`) | 🟡 imitation, said |
| 11 | Panel width | `FoldoutPanel.width` | pinned flex/min/max width | ✅ |
| 12 | Panel `summary` slot | `panelSummary()` / `FoldoutPanel.summary` | a `div.mateu-foldout-summary` in the DEFAULT slot — the component reads `summary` only at creation, before VB stamps it (`main-start-page.html:6288-6294`) | 🟡 imitation, said |
| 13 | Panel `recommendation` slot | — | — | ❌ |
| 14 | Panel `noData` slot | `EmptyState` as content | in the default slot | 🟡 |
| 15 | Panel `secondaryActions` | — (overview only) | — | ❌ |
| 16 | `selectedPanel` (controlled) | `open` = initial state only | layout selection | 🟡 |

## 6. Slots: allowed components

The guide lists none for this template. Mateu puts any component in the overview and in each panel
(atoms through the same pipeline as the host content, `archetypes.mjs:35-46`). ✅

## 7. Template component vs composition

Already on Spectra (`oj-sp-foldout-layout` + `oj-sp-foldout-panel`). The two imitations (summary
line, icon) are forced by the component (summary slot read once; no icon prop) and documented in the
markup.

## 8. Proposed plan

1. Panel header actions: `@Panel(actions…)` or a `panelActions(field)` hook → `secondaryActions`
   + `spAction`, like the overview's Edit.
2. Badge colour: map `Badge.color` to the JET badge class (as the page badges already do).
3. Panel subtitle: put it in the panel body's first line instead of the title, or drop the join
   when the title is long.
4. Drill-down (`drilldown` slot) and `recommendation` only on demand.
5. Retry the real `summary` slot if a later oj-sp re-reads it (keep the imitation until then).

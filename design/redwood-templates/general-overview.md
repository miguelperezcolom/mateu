# Redwood «General overview page» — review against the guide (2026-10-23)

Source: the Redwood usage guideline (`oj-sp-general-overview-page`,
`oj-sp-general-overview-page-pattern`; category *Details*, since 22A). The guide is a single
sentence (view information about a simple business object) + one image (header "Title Context" +
subtitle + a facts strip; a wide column of titled sections with label/value pairs in three columns;
a narrow right column with its own titled section). The review leans on the real `oj-sp` 2604.1.0 API
(`design/vb-page-template-apis.md` §1.1 and §2.2).

Working rule: in Redwood, **Spectra/VB rule** — their template, component and contract before an
imitation of ours; imitate only when their contract cannot be met with Mateu's content, and say so.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Mateu pieces: `GeneralOverview<Row>`
(`backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/generaloverview/GeneralOverview.java`)
— a REFLECTED page (fields `record` + `_overview`), so the page header metadata is read
(`ReflectionPageMapper.java:45-66`). Redwood: projection `generalOverviewOf`
(`frontend/web/monorepo/apps/redwood/poc/core/overviews.mjs:230-306`), markup
`main-start-page.html:11679-11700` (`oj-sp-header-general-overview` + JET `oj-panel` columns).
Separately, `oj-sp-general-overview-page` IS used (`main-start-page.html:28958-28990`) — but only for
"native GOP" pages: an entity page (`EntityHeader`) whose content is exactly two column blocks, wide
first (`poc/pageProjection.mjs:136-156`), e.g. a `@Zones` form; **not** for this archetype.

## 1. When to use it

Viewing information about a simple business object. In Mateu: `GeneralOverview<Row>` (record
switcher + overview + optional `info`).

## 2. Regions (anatomy)

| # | Region | Guide (image + API) | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Header | title (+ object/context switcher), subtitle, badge, contextual info, actions, prev/next | switcher = `record` field + `switcherOptions()` (`GeneralOverview.java:35-36,45,121-129`); title/subtitle/badges/facts/metric from an `EntityHeader` in `overview()` | `oj-sp-header-general-overview` with `select-object` (data switcher = title), `contextual-info` (`main-start-page.html:11681-11689`) | 🟡 see §5 |
| 2 | Main slot | titled sections of label/value pairs | `overview(row, rq)` (`:54`) | the template's `main` slot; each piece → a JET `oj-panel` card (`overviews.mjs` `mainCards`) | 🟡 JET cards, not `oj-sp-section`s |
| 3 | Info slot | contextual side panel | `info(row, rq)` + `infoWidth()` (`:63-71`), composed as `ResponsiveGrid` `"main info"` (`:149-165`) | the template's own `info` slot (neutral-20 column), `promoteInfoSlot` its display option (`infoCards`, `promoteInfo`) | ✅ (`infoWidth()` not applied: Spectra sizes the column) |
| — | The template itself | `oj-sp-general-overview-page` (slots `main`/`info`/`search`/`announcement`) | — | **`oj-sp-general-overview-page`** (2026-10-24, `main-start-page.html` `#mateuOverviewHeader`) | ✅ see §7 |

Detection (`overviews.mjs:231-237`): the archetype is painted as a general overview only when the
tree holds an `EntityHeader` AND a field with options (the switcher). An overview without
`EntityHeader`, or `emptyOverview()` (`GeneralOverview.java:97-107`), falls back to the generic
form (switcher as a select, overview as content).

## 3. Responsive behaviour

| Breakpoint | Guide / component | Mateu / Redwood | Status |
|---|---|---|---|
| Wide | main + info side by side | `oj-md-(12-n)` / `oj-md-n` from `infoWidth` (`overviews.mjs:276-285`) | ✅ |
| Narrow | stacked; `promoteInfoSlot` puts info first | `oj-sm-12` stacking; promoted info goes first — **also first (left) on wide screens** (`overviews.mjs:285`), unlike Vaadin, where the `"main info"` areas keep info on the right | 🟡 |

## 4. Page properties

| Property | Guide | Mateu | Status |
|---|---|---|---|
| Page layout | (header canonical) | `@PageWidth` (reflected page) | ✅ |
| Density | `standard \| compact` | `@Compact` (reflected page, `PageMetadataExtractor.java:174`) | ✅ |
| Display mode | `light \| mixed` | not modelled; the header carries `oj-bg-neutral-0` | ❌ |

## 5. Header elements

| # | Element | Mateu | Redwood | Status |
|---|---|---|---|---|
| 1 | Title | `EntityHeader.title` | `page-title` | ✅ |
| 2 | Object switcher | `switcherOptions()` / `record` / `switchRecord` (`:168-172`) | `select-object` + `on-select-object-value-changed` → `onOverviewSwitch` chain | ✅ |
| 3 | Switcher label (`labelHint`) | `recordLabel()` (`:83-94`) | fixed `"Record"` (`main-start-page.json:101-107`) | 🟡 |
| 4 | Switcher search | — (only `RecordSwitcher.searchable` on other pages) | not set | ❌ |
| 5 | `dataSwitcherType: context` | — | always `selectObject` | 🟡 |
| 6 | Subtitle | `EntityHeader.subtitle` | `page-subtitle` | ✅ |
| 7 | Badge | `EntityHeader.badges` (Chips) | the first → the template's `badge` (`badgeStatusOf`), the rest follow the subtitle (`pageSubtitle`) | ✅ |
| 8 | Contextual info | `EntityHeader.facts` + metric (`overviews.mjs:240-241`) | `contextual-info` | ✅ |
| 9 | Primary / secondary actions | `@Toolbar` methods (page toolbar) | the template's `primary-action`/`secondary-actions` from `mateuPageHeader` (`headerPrimary`/`headerSecondary`) | ✅ |
| 10 | Previous / next item | `PeerNavigationSupplier` → `PageDto.peerNav` | not bound on `mateuOverviewHeader` | ❌ |
| 11 | Avatar | `@Avatar` / `AvatarSupplier` | not bound | ❌ |
| 12 | Timestamp | `@Timestamp` | not bound | ❌ |
| 13 | Overline | `@Overline` | not bound | ❌ |

## 6. Slots: allowed components

The guide lists none. Main and info pieces are painted as atoms (`overviews.mjs:247-254`): text,
`StatusList`, tables (`oj-table`), charts… ✅. A titled `Card` keeps its title; untitled pieces become
untitled cards.

## 7. Template component vs composition

The renderer already knows how to fill `oj-sp-general-overview-page` (`main`/`info` slots with atom
blocks, header props incl. primary/secondary actions and the switcher) for the "native GOP" path.
The archetype could take the SAME branch: header from the `EntityHeader` + page metadata, `main`
from the `main` slot, `info` from the `info` slot. That would bring actions, the template's own info
background and padding, and drop the custom column code.

## 8. Proposed plan

1. ~~**Archetype → `oj-sp-general-overview-page`**~~ — DONE 2026-10-24 (its own branch bound to
   `mateuOverview`: `main`/`info` slots, badge, primary/secondary actions, `promoteInfoSlot`).
   Still open: `previous-item`/`next-item`, `timestamp`, avatar.
2. ~~**promoteInfoSlot**~~ — now the template's own option (its layout, not ours).
3. **Detection without `EntityHeader`**: fall back to the page `@Title` as the header title, so
   any `overview()` — and `emptyOverview()` — keep the template.
4. `labelHint` from `recordLabel()`; `switcherSearch` when the option list is long.

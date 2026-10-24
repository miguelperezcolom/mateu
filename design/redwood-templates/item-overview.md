# Redwood «Item overview page» — review against the guide (2026-10-23)

Source: the Redwood usage guideline (`oj-sp-item-overview-page`, `oj-sp-item-overview-page-pattern`
in VB; category *Detail*, since 21A) — regions, responsive and interactive behaviour, page
properties, navigation actions, Item Overview component elements and the main slot's allowed
components — plus the real `oj-sp` 2604.1.0 API (`design/vb-page-template-apis.md` §2.3).

Working rule: in Redwood, **Spectra/VB rule** — their template, component and contract before an
imitation of ours; imitate only when their contract cannot be met with Mateu's content, and say so.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Mateu pieces: `ItemOverview`
(`backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/itemoverview/ItemOverview.java`)
— a `ComponentTreeSupplier`: key-info `Card` (slot `keyinfo`, sticky) + `TabLayout` (slot `tabs`)
on a `ResponsiveGrid` (`ItemOverview.java:86-97`). Redwood: projection `itemOverviewOf`
(`frontend/web/monorepo/apps/redwood/poc/core/overviews.mjs:355-396`), markup
`main-start-page.html:13478-13490` and `:15245-15270` (`oj-panel` + `oj-tab-bar`). The native
`oj-sp-item-overview-page` was mounted and **reverted** on 2026-07-27
(`frontend/web/monorepo/apps/redwood/DESIGN-NOTES.md:1241-1253`; `const iop = null` in
`webApps/vbredwoodapp/pages/shell-page-chains/onMateuNavigate.js:440-450`).

## 1. When to use it

Managing many items: a summary + comprehensive details, easy to move between items (candidate
profile, product overview). In Mateu: `ItemOverview`.

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Navigation actions | parent / back, search slot, previous-next | the page header of the routed page: `@Title`, toolbar (`ComponentTreeSupplierMapper.java:83-121`); no peer nav on a composed archetype | VB header band `oj-sp-header-general-overview`, `go-to-parent` from a `back`/`cancel`/`close` toolbar button or the parent crumb (`poc/pageProjection.mjs:163-243`) | 🟡 parent ✅, search ❌, prev/next ❌ |
| 2 | Item overview component (the page header of the template) | title, subtitle, badge, avatar/photo, edit/share/favourite, ≤3 secondary actions, body, footer | first non-`@Panel` component, wrapped in `Card("key-info")` (`ItemOverview.java:68-72,91`) | `div.oj-panel` in an `oj-md-4` column with the card's content as atoms (`main-start-page.html:13479-13485`; `overviews.mjs:362-389`) | 🟡 imitation, not `oj-sp-item-overview` |
| 3 | Main slot | Table, Dynamic Table, List View | `@Panel` fields → `Tab`s (`ItemOverview.java:74`) | `oj-tab-bar` (`edge=top`, `overflow=popup`) + the selected tab's atoms (`main-start-page.html:15252-15268`) | ✅ (tabs are Mateu's choice; any component allowed) |
| — | The template itself | `oj-sp-item-overview-page` (slots `overview`/`main`) | — | **composed**; the template was tried and reverted | 🟡 see §7 |

Detection: `itemOverviewOf` needs a `TabLayout` whose sibling is a `Card` (`overviews.mjs:356-369`).
An `ItemOverview` with no key-info field returns only the tabs (`ItemOverview.java:77-80`, degenerate
branch) and is painted as generic content.

## 3. Responsive and interactive behaviour

| Breakpoint | Guide | Mateu / Redwood | Status |
|---|---|---|---|
| Large | overview fully expanded beside main | Vaadin: fixed `panelWidth()` column, sticky (`ItemOverview.java:88,96`). Redwood: `oj-md-4` / `oj-md-8`, `panelWidth()` ignored, not sticky | 🟡 |
| Small | overview collapsed above main; tap to expand | Vaadin: stacks below 48rem (`ItemOverview.java:94`), expanded. Redwood: `oj-sm-12`, expanded | ❌ no collapse |

## 4. Page properties

| Property | Guide | Mateu | Status |
|---|---|---|---|
| Page layout | fixed / full width; edge to edge **no** | `@PageWidth` → wire (`ComponentTreeSupplierMapper.java:69`); default fixed | ✅ (edge to edge not refused) |
| Display mode | light (default) / mixed / themeable (future) | not modelled | ❌ |

## 5. Elements

### Navigation actions

| # | Element | Mateu | Redwood | Status |
|---|---|---|---|---|
| 1 | Parent navigation / PWA back | toolbar `back`/`cancel`/`close` (`pageHeader.mjs:386-397`) or parent breadcrumb | `go-to-parent` | ✅ |
| 2 | Search slot | — | — | ❌ |
| 3 | Previous / next | `PeerNavigationSupplier` is read only by `ReflectionPageMapper.java:61`; not on a `ComponentTreeSupplier` | header arrows stay `disabled` | ❌ on the archetype (works when hosted in a CRUD record page that is reflected) |

### Item overview component

| # | Element | Req. | Mateu | Redwood | Status |
|---|---|---|---|---|---|
| 1 | Item title | yes | composed in the panel (`EntityHeader.title`, `Text`) | atom inside the card | 🟡 |
| 2 | Item subtitle | no | composed | atom | 🟡 |
| 3 | Badge (status, style) | no | `EntityHeader.badges` | atom badges | 🟡 no strong/subtle, no position |
| 4 | Avatar / initials / photo (1:1, 4:3) | no | `Avatar` / `Image` in the panel | `oj-avatar` / `<img>` | 🟡 no aspect option |
| 5 | Edit / share / favourite | no | — | — | ❌ |
| 6 | Secondary actions (≤3) | no | `@Toolbar` methods | page header secondary actions, not the panel | 🟡 |
| 7 | Body slot (form layout, dynamic form, empty state) | no | the panel's component tree | atoms | ✅ |
| 8 | Footer slot (links) | no | composed at the end of the tree | atoms | 🟡 |

## 6. Main slot: allowed components

| Guide | Mateu | Status |
|---|---|---|
| Table / Dynamic Table | `Grid` (→ `oj-table`), a listing | ✅ |
| List View | `StatusList`, lists | ✅ |
| (anything else) | allowed by Mateu (`Chart`, `Markdown`…) — not validated against the guide | 🟡 |

## 7. Template component vs composition

`oj-sp-item-overview-page` has slots `overview` (where `oj-sp-item-overview` goes, with
`itemTitle/itemSubtitle/badge/photo/secondaryActions` and slots `body`/`footer`) and `main`; it owns
`overviewExpanded` (the small-screen collapse). The 2026-07-27 attempt worked at DOM level but was
reverted on looks (the panel column paints no background in `light` mode, the set floated on the
canvas — DESIGN-NOTES). The bridge keeps `itemOverviewPageOf` and contract test #31 for a retry.
A retry would give: collapse on small screens, sticky overview, item actions, prev/next.

Mapping needed for the retry: a leading `EntityHeader` in the key-info tree → `itemTitle`,
`itemSubtitle`, `badge`, facts → `body`; an `Avatar`/`Image` → `photo`; the rest of the tree → `body`.

## 7bis. Status — retried and ADOPTED (2026-10-24, phase D2)

Redwood paints the archetype with **`oj-sp-item-overview-page` + `oj-sp-item-overview`** (branch
`mateuItemOvPage`): the key panel's atoms → the overview's `body` slot; the tab bar + chosen tab →
the `main` slot; `itemTitle` = the PAGE's title — the EntityHeader's, else the window title
(`@Title`; Spectra's page template has no title attribute, its `itemTitle` is where the page names
the item — 2026-10-24) — and only without one the key card's title or the panel's LEADING heading (a
heading atom, or the first `<h1–4>` of a rich text); a leading heading saying the title is taken out
of the body, one saying something else stays, and so does a differing key card title
(`itemOverviewPageHeaderOf`); `badge`/`itemSubtitle` from an EntityHeader; the
page toolbar → its `secondaryActions`; back → `goToParent`. The look that caused the July revert is
fixed with our own CSS: the overview column gets Redwood's panel surface and a divider
(`.mateu-iop .oj-sp-item-overview-page-overview-section`), so it no longer floats on the canvas;
`displayMode` stays `light`. The VB header is suppressed (the template brings its own). Still open:
`panelWidth()` (the template sizes the column), the collapsed strip on small screens (it stacks),
prev/next (plan item 3).

## 8. Proposed plan

1. **Retry `oj-sp-item-overview-page`** with `displayMode: mixed` (or our own panel background) to
   fix the look that caused the revert; map as in §7.
2. **Until then**: honour `panelWidth()` and make the key-info column sticky in the composed version.
3. **Header metadata on composed archetypes** (shared with Dashboard/Welcome/Foldout): carry
   `PeerNavigationSupplier` in `withPageBars` → `previous-item`/`next-item`.
4. Item affordances (`ItemOverviewDisplay(edit, share, favorite)`) only on demand.

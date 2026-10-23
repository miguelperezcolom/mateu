# Redwood «Collection Detail» — review against the guide (2026-10-23)

Source: Oracle's usage guideline for the template (`oj-sp-collection-detail-page`, VB pattern
`oj-sp-collection-detail-page-pattern`, category *Transactional*, since 23B) — the page itself is
nearly empty (one sentence + one image); the substance is in the category page «Choosing the right
transactional page template» (three variations: read only, inline editing, create with a create-and-
edit drawer) and in the real API (`design/vb-page-template-apis.md` §2.4). User doc:
`doc/src/content/docs/ux-patterns/collection-detail.md`.

Working rule: on Redwood **Spectra/VB rule** — their template, component and contract first; an
imitation only when Mateu's content cannot meet their contract, and said.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Paths: `CD` = `backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/collectiondetail/CollectionDetail.java`,
`RW` = `frontend/web/monorepo/apps/redwood`.

## 1. When it is used

A list of objects next to the detail of the one selected, acting on that one without leaving the
page. In Mateu: the `CollectionDetail<Row>` archetype (`CD:35`). Page type `collection`
(`backend/shared/core/src/main/java/io/mateu/core/domain/out/componentmapper/PageTypeResolver.java:64`).

## 2. Regions (anatomy)

| # | Region | Guide / API | Mateu (model) | Redwood (renderer) | State |
|---|---|---|---|---|---|
| 1 | Header | general-overview header: title, action buttons | `@Title`, `@Subtitle`, page `@Toolbar` methods | `oj-sp-header-general-overview` (the page's normal header) | ✅ |
| 2 | Collection container — search | `search` slot, smart filters | a plain `search` form field (`CD:40-41`), debounced 400 ms (`CD:166-172`) | a generic input labelled «Search» | 🟡 not `oj-sp-smart-filter-search`; no smart filters / chips |
| 3 | Collection container — toolbar | add / more actions over the list | — (page toolbar goes to the header) | — | ❌ |
| 4 | List view | default slot; items with primary/secondary text, selection | `TaskQueue` built from `rows`/`idOf`/`titleOf`/`captionOf`/`badgesOf` (`CD:112-136`) | `oj-action-card` cards (`RW/poc/core/content.mjs:1064-1080`), the selected one shaded (`content.mjs:76`) | 🟡 cards, not `oj-list-view`; no avatar/icon per item; no checkbox selection |
| 5 | List counter / label | `listLabel` group label | `listLabel(count)` (`CD:75-80`) | the group's label | ✅ |
| 6 | Detail | `detailTemplate` slot (receives the item) | `detail(Row, rq)` — any component (`CD:59`) | the slot's content, painted as a column | ✅ |
| 7 | No selection | `noSelection` slot | `emptyDetail()` (`CD:83-94`) | the `EmptyState` as content (a slotted one is not the page's, `content.mjs:96-118`) | ✅ |
| — | The template itself | `oj-sp-collection-detail-page` | `ResponsiveGrid` slot template `"list detail"` (`CD:142-150`) | **composed**: two `oj-flex` columns (`content.mjs:854-867`) | 🟡 see §6 |

## 3. Responsive behaviour

| Breakpoint | Guide / API | State |
|---|---|---|
| Wide | list column + detail column | ✅ — but `listWidth()` (`24rem`) is approximated to an `oj-md-*` fraction (4/12 for a `22rem` track, `RW/poc/test-pms.mjs:1081`) |
| Narrow | `displayOptions.mobileMenu`: the list goes behind a menu, the detail takes the page | 🟡 the grid stacks list over detail below `48rem` (`CD:148`); no menu, no "back to list" |

## 4. Page properties

| Property | Guide | Mateu | State |
|---|---|---|---|
| Page layout | edge to edge, full width, fixed width | `@PageWidth`; default `fixed` (`RW/poc/pageProjection.mjs:288`) | ✅ |
| Density | `displayOptions.density` | `@Compact` | ✅ |

## 5. Elements and variations

| Element | Guide / API | Mateu | Redwood | State |
|---|---|---|---|---|
| Single selection | `selectedItems` | `selectCollectionItem` → `_selectedId` (`CD:153-158`) | card click | ✅ |
| Multi-selection | `selectedItems` is plural | — | — | ❌ |
| Selection in the URL (deep link, back button) | — (controlled prop) | `_selectedId` is hidden state, not route | — | ❌ (a reload loses the selection) |
| Per-item line action | — | `QueueItem.actionLabel/actionId` exist but the archetype never sets them (`CD:122-129`) | `lineActions` (`content.mjs:1074`) | 🟡 not exposed |
| Context switcher | `selectContext` | only in `GeneralOverview` | — | ❌ |
| Parent / in-flow back | `goToParent`, `inFlowBack` | breadcrumb parent | general-overview header `go-to-parent` | 🟡 |
| Variation «read only» | detail = page/tabs/accordion/visualizations | `detail()` returns any component (Card, TabLayout, charts…) | atoms | ✅ |
| Variation «inline editing» | detail editable in place | `detail()` returns an embedded editable view (island) — composition, no built-in | island | 🟡 not built in; not demoed |
| Variation «create with a drawer» | create-and-edit drawer from the list toolbar | a page `@Toolbar` action returning a `Drawer` — composition | drawer | 🟡 not built in; the action lands in the header, not on the list |
| Announcement slot | aria-live | client live regions; no server content | — | 🟡 |

## 6. Template component vs composition

Not using `oj-sp-collection-detail-page`. Its `detailTemplate` is a client-side template slot that
receives the item's data; Mateu's detail is server-composed per selection (`detail(Row, rq)`), and the
renderer already paints arbitrary content into the page container. Hosting the server-built detail in
the template's slot is likely possible (the slot is a container, like advanced-create-edit's `main`),
the list would have to move to its default slot as `oj-list-view` items. Not attempted; the composed
version is an imitation and the user doc says so.

## 7. Gaps, prioritised

1. **Selection not addressable** (`_selectedId` state, `CD:38`): a reload or a shared link loses it;
   Redwood pages keep it as controlled state the host can route. Candidate: route-encoded selection.
2. **Composed, not the template** (§6): list as `oj-action-card` cards, search as a plain input.
3. **Narrow screens** stack instead of the mobile menu (`CD:148`).
4. **No list toolbar** (add / more) and **no multi-selection**.
5. Per-item line actions exist on `QueueItem` but are not exposed by the archetype.
6. Avatar/icon per item missing from `QueueItem`.
7. The search field label «Search» is a hard-coded `@Label` (`CD:40`) — check it goes through the
   translator like the other built-in texts.

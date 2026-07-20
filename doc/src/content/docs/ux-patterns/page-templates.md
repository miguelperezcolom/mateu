---
title: Page templates
description: The full-page templates enterprise design systems standardize — and the Mateu archetype or pattern that builds each one from the backend.
---

Enterprise design systems (Oracle Redwood's RDS toolkit is the canonical example) don't stop at
components — they standardize **full-page templates**: the record overview, the collection with a
detail pane, the guided process, the create-and-edit drawer. Mateu covers these templates from the
backend: you extend an archetype or set a flag, and the page comes out with the template's anatomy
on every renderer.

This page is the map. Each row names the template (RDS naming), the Mateu piece that builds it,
and where to see it running. To pick the right one from a user goal, start with
[Choosing a page template](./choosing-a-page-template).

| Template | Mateu piece | Demo route | Guide |
|---|---|---|---|
| **Smart Filter and Search** | Every CRUD/`Listing` — the smart search bar with typed filters, chips and saved views is the default listing UX | `/products` | [Filters & listing](./filters-and-listing) |
| **Smart Search page** | `SmartSearchPage<Filters, Row>` archetype — a standalone, search-first page: intro line + smart search bar with typed facets + results; starts empty | `/smart-search-demo` | [Smart search](./smart-search) |
| **To-do list** | `TodoList<Row>` archetype — pending work as counted buckets of actionable cards; clicking a task acts on it | `/todo-list-demo` | [To-do list](./to-do-list) |
| **Create and Edit — Simple / Advanced** | `AutoCrud<T>` — routed `/new` and `/{id}/edit` forms with validation, optimistic locking and dirty guard; Advanced composes `@Section`/`@Zones`/tabs on the same crud | `/products` | [Create and edit](./create-and-edit) |
| **Create and Edit — Drawer** | `editInDrawer()` on the crud — the form slides over the listing, which never unmounts | `/drawer-crud-demo` | [Drawer](./drawer#crud-editing-in-a-drawer-editindrawer) |
| **Waterfall detail** | Composition — a `VerticalLayout` of `EntityHeader` + full-width `Card`/property-list panels telling the record top-to-bottom | — | [Waterfall detail](./waterfall-detail) |
| **Step-by-step** | `Wizard` + `@WizardProgress(STEPS)` — the classic numbered-step stepper with done/current/upcoming states | `/branching-wizard` | [Wizard](./wizard) |
| **Collection Detail** | `CollectionDetail<Row>` archetype — searchable card list + in-place detail pane | `/collection-detail-demo` | [Collection detail](./collection-detail) |
| **General Overview** | `GeneralOverview<Row>` archetype — record context switcher + `EntityHeader` metadata strip over property cards | `/general-overview-demo` | [General overview](./general-overview) |
| **Guided Process** | `Wizard` + `@WizardProgress(RAIL)` — step form with the sticky lateral rail (`current \| total` counter over the vertical step list) | `/branching-wizard` | [Wizard](./wizard) |
| **Item Overview** | `ItemOverview` archetype — sticky key-info panel + tabbed detail | `/product-overview` | [Item overview](./item-overview) |
| **Foldout Layout** | `Foldout` archetype — fixed overview + lateral fold-out panels | `/foldout-demo` | [Foldout](./foldout) |
| **Dashboard** | `Dashboard` archetype — KPI scoreboard band + responsive tile grid | `/dashboard-demo` | [Dashboard](./dashboard) |
| **Welcome Page** | `Welcome` archetype — hero with CTAs + highlight tiles | `/welcome-demo` | [Welcome page](./welcome-page) |
| **Empty States** | `EmptyState` component — used by every listing and archetype automatically | `/empty-skeleton-demo` | [Empty states & skeletons](./empty-states-and-skeletons) |
| **Data Management** (dense datagrid) | `@InlineEditing` + `@Compact` on a table crud — in-place cell editing at high density | `/inline-crud-demo` | [Inline CRUD editing](./inline-crud-editing), [High density](./high-density) |
| **Calendar** | `CalendarPage` archetype — the full page: calendar toolbar (‹/Today/›, optional *+ Create*) over the month grid, per-month event fetching, event click actions (week/day/list views not built in yet) | `/calendar-demo` | [Calendar](./calendar) |

Three notes on how to read the table:

- **Templates are backend-side.** An archetype composes existing wire components, so it renders on
  every web renderer (Vaadin, SAP UI5, Redwood, PatternFly, SLDS) and on the native ones (React
  Native, IntelliJ) without renderer work. Styling follows each design system's tokens.
- **Page width is a template parameter.** `@PageWidth(FIXED | FULL_WIDTH | EDGE_TO_EDGE)` (or the
  `PageWidthSupplier` hook — `Foldout` declares edge-to-edge) decides how the content column is
  sized: capped and centered, fluid with side margins, or touching the viewport edges. When
  neither is set, the renderer infers it from the content (full-bleed canvases → edge-to-edge,
  dense datagrids → full width, anything else → fixed).
- **The page type is inferred from the ModelView.** Every page carries a coarse `pageType` on the
  wire — `landing` (Welcome, HeroSearch), `collection` (listings, search pages, CRUDs, to-do
  lists, calendars, collection detail), `detail` (overviews, foldout, master-detail), `form`
  (plain reflected forms), `process` (wizards), `dashboard` (archetype, or any ModelView with
  `MetricCard` fields). Archetypes declare theirs through the mapping; declare it explicitly with
  `@PageTemplate(PageType.X)`. The type anchors the width default (form/process/landing are
  always capped; collection/detail/dashboard defer to the content inference) and is stamped as
  `data-page-type` on the rendered page host as a stylesheet hook.
- **Peer navigation.** A detail/overview page can implement `PeerNavigationSupplier` to add the
  previous/next-object arrows to the header (the Redwood "next/previous object" element): return a
  `PeerNav(prevLabel, prevRoute, nextLabel, nextRoute)` for the current record — a `null` route
  disables that side. Ported to .NET (`IPeerNavigationSupplier`) and Python
  (`PeerNavigationSupplier`). Demo: `/peer-nav-demo`.
- **Header timestamp.** Mark a field with `@Timestamp("Last updated")` to show a "last updated"
  line in the header (the Redwood timestamp element); the field's value renders as text and the
  field is dropped from the form body. Header key/value facts come from `@KPI` fields the same way.
  Ported to .NET (`[Timestamp]`) and Python (`Timestamp()`).
- **Backend parity.** Everything on this page also works on the .NET and Python backends — see
  the [parity matrix](/reference/parity/) for the per-feature detail.
- **Composition beats templates.** When no template fits, the same pieces compose freely:
  `HeroSection`, `EntityHeader`, `TaskQueue`, `Card`, property-list sections, zones and the
  fluent `FormField` are the vocabulary the archetypes themselves are written in.

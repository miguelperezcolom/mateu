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
and where to see it running. **The normal way to build a UI starts here**: list the screens your
app needs, decide the template for each one, then declare the data — choosing the template is
your call per screen (Mateu only composes it for you in two fully-derivable cases; see
[Choosing a page template](/ux-patterns/choosing-a-page-template/), the decision guide).

| Template | Mateu piece | Demo route | Guide |
|---|---|---|---|
| **Smart Filter and Search** | Every CRUD/`Listing` — the smart search bar with typed filters, chips and saved views is the default listing UX | `/products` | [Filters & listing](/ux-patterns/filters-and-listing/) |
| **Smart Search page** | `SmartSearchPage<Filters, Row>` archetype — a standalone, search-first page: intro line + smart search bar with typed facets + results; starts empty | `/smart-search-demo` | [Smart search](/ux-patterns/smart-search/) |
| **To-do list** | `TodoList<Row>` archetype — pending work as counted buckets of actionable cards; clicking a task acts on it | `/todo-list-demo` | [To-do list](/ux-patterns/to-do-list/) |
| **Create and Edit — Simple** | `AutoCrud<T>` — routed `/new` and `/{id}/edit` forms with validation, optimistic locking and dirty guard | `/products` | [Create and edit](/ux-patterns/create-and-edit/) |
| **Create and Edit — Advanced** | a sectioned transactional form with a canonical header (save/cancel, `@Timestamp`, `@KPI` facts, peer-nav) and either `@Toc` (section index) or `@Aside` (detail slot) | — | [Advanced create & edit](/ux-patterns/advanced-create-and-edit/) |
| **Create and Edit — Drawer** | `editInDrawer()` on the crud — the form slides over the listing, which never unmounts | `/drawer-crud-demo` | [Drawer](/ux-patterns/drawer/#crud-editing-in-a-drawer-editindrawer) |
| **Waterfall detail** | Composition — a `VerticalLayout` of `EntityHeader` + full-width `Card`/property-list panels telling the record top-to-bottom | — | [Waterfall detail](/ux-patterns/waterfall-detail/) |
| **Step-by-step** | `Wizard` + `@WizardProgress(STEPS)` — the classic numbered-step stepper with done/current/upcoming states | `/branching-wizard` | [Wizard](/ux-patterns/wizard/) |
| **Collection Detail** | `CollectionDetail<Row>` archetype — searchable card list + in-place detail pane | `/collection-detail-demo` | [Collection detail](/ux-patterns/collection-detail/) |
| **General Overview** | `GeneralOverview<Row>` archetype — record context switcher + `EntityHeader` metadata strip over property cards | `/general-overview-demo` | [General overview](/ux-patterns/general-overview/) |
| **Guided Process** | `Wizard` + `@WizardProgress(RAIL)` — step form with the sticky lateral rail (`current \| total` counter over the vertical step list) | `/branching-wizard` | [Wizard](/ux-patterns/wizard/) |
| **Item Overview** | `ItemOverview` archetype — sticky key-info panel + tabbed detail | `/product-overview` | [Item overview](/ux-patterns/item-overview/) |
| **Foldout Layout** | `Foldout` archetype — fixed overview + lateral fold-out panels | `/foldout-demo` | [Foldout](/ux-patterns/foldout/) |
| **Dashboard** | `Dashboard` archetype — KPI scoreboard band + responsive tile grid | `/dashboard-demo` | [Dashboard](/ux-patterns/dashboard/) |
| **Welcome Page** | `Welcome` archetype — hero with CTAs + highlight tiles | `/welcome-demo` | [Welcome page](/ux-patterns/welcome-page/) |
| **Empty States** | `EmptyState` component — used by every listing and archetype automatically | `/empty-skeleton-demo` | [Empty states & skeletons](/ux-patterns/empty-states-and-skeletons/) |
| **Data Management** (grid ⇄ Gantt) | `DataManagement` archetype — the same data as a grid and a Gantt with a toolbar switcher (full-width). Dense editable grids use `@InlineEditing` + `@Compact` | `/data-management-demo` | [Data management](/ux-patterns/data-management/) |
| **Gantt page** | `GanttPage` archetype — edge-to-edge Gantt canvas + docked detail; clicking a bar opens the task in a drawer | `/gantt-page-demo` | [Gantt](/ux-patterns/gantt/#gantt-page-template-ganttpage-archetype) |
| **Calendar** | `CalendarPage` archetype — the full page: calendar toolbar (‹/Today/›, optional *+ Create*) over the month grid, per-month event fetching, event click actions (week/day/list views not built in yet) | `/calendar-demo` | [Calendar](/ux-patterns/calendar/) |

Three notes on how to read the table:

- **Templates are backend-side.** An archetype composes existing wire components, so it renders on
  every web renderer (Vaadin, SAP UI5, Redwood) and on the native ones (React
  Native, IntelliJ) without renderer work. Styling follows each design system's tokens.
- **Page width is a template parameter.** `@PageWidth(FIXED | FULL_WIDTH | EDGE_TO_EDGE)` (or the
  `PageWidthSupplier` hook — `Foldout` declares edge-to-edge) decides how the content column is
  sized: capped and centered, fluid with side margins, or touching the viewport edges. When
  neither is set, the renderer infers it from the content (full-bleed canvases → edge-to-edge,
  dense datagrids → full width, anything else → fixed). On the Vaadin shell all three modes
  render: *fixed* caps the content column at 1408 px centered, *full width* is fluid, and
  *edge to edge* drops the shell gutters for the content while the page header keeps its own
  side padding (so the title never touches the viewport edge).
- **A leading `EntityHeader` becomes the page header.** When a page's content starts with an
  `EntityHeader` (the guest/record banner), the renderer hoists it into the canonical page
  header: its title becomes the page title with the badges beside it, its subtitle the page
  subtitle, and its facts + metric render as a row of label/value pairs under the title — the
  banner is not repeated in the body. This is the Redwood record-header anatomy without any
  extra annotation: compose the `EntityHeader` as the first component and the header comes out
  integrated. Applies to top-level pages only; embedded islands keep their banner inline.
- **Secondary header actions collapse into a "…" menu.** Toolbar buttons marked primary stay
  visible in the page header; when a page declares two or more secondary actions they collapse
  into an overflow menu (the Redwood header grammar), keeping the header to one primary action
  plus "…". A single secondary action stays inline.
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
- **Uniform content-page slot grammar.** The templates with a *main + contextual aside* shape
  (`ItemOverview` — key-info panel + tabs; `CollectionDetail` — searchable list + detail pane)
  compose a single `ContentLayout` with named regions — `main`, `aside` (which side via
  `asidePosition`, width via `asideWidth`, optionally `asideSticky`) and a full-width `footer` —
  instead of each reinventing a bespoke layout. Every renderer paints it with one responsive
  grammar: the aside sits beside the main region on wide viewports and stacks under it when narrow.
  It is a wire component like `DashboardLayout`/`FoldoutLayout`, so you can also compose it directly
  in a custom view. Ported to .NET and Python (`ContentLayout`).
- **`@Aside` — content-page from a plain form.** The minimal way to get the content-page grammar
  without composing anything: on an ordinary reflected form, mark one component-holder field
  `@Aside` (`.NET` `[Aside]`, Python `Aside()`). That field is pulled out of the form body and
  placed in the `aside`; the rest of the form becomes the `main` region of a `ContentLayout`
  (`position`/`width`/`sticky` come from the annotation). You keep declaring data as usual and just
  point at the one supporting panel that belongs to the side.

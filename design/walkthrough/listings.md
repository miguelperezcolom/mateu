# Walkthrough — listings & CRUD

Branch `walkthrough/listings` (from origin/master, 2026-10-12). Walked as a user would — clicks,
typing, reloads, deep links, back/forward — in headless Chromium against running apps, and fixed at
the root. Owner priority applied: Java/Vaadin and YAML/Vaadin served first, then Redwood, then the
rest.

**Apps used**: e2e `mvc-app1` (Vaadin, :18300) and the same app built for Redwood (`-Dmateu.renderer=
mateu-redwood`, :18303); `webflux-app1` (:18305); `demo-admin-panel` (:18301 — AutoCrud, drawer,
inline editing, aggregates, hero search, tree selector); `starters/yaml` served in sample mode
(:18302, and rebuilt with the Redwood jar); `starters/static` bundle (specsOnly + sample data, a dumb
static server, :18307); `demo-starwars` (YAML listings over a REST backend with `rowRoute`,
`totalPath`, :18306). Ports: core in-JVM harness, .NET and Python test suites + the shared
conformance corpus.

New fixtures (sample1, so every adapter serves them): `CapabilityBooks` (`/capability-books` —
Searchable + typed Filterable (text, NumberRange, DateRange, Set<Enum>) + Navigable, 30 rows, honours
page/size/sort, CSV export) and `CapabilityNotes` (`/capability-notes` — Editable without Navigable +
Creatable + Deletable, @NotEmpty field). New specs: `e2e/tests/shared/capability-listings.spec.ts`
(runs on all 5 Java adapters), `e2e/tests/renderer/listing-sort.spec.ts` (renderer-vaadin +
renderer-vb), one test added to `bulk-action-buttons.spec.ts` and to `static/static-vcn.spec.ts`.

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken, not fixed · N/A · ⏳ not walked yet

## Bugs fixed (one line each)

| # | Bug | Where | Commit |
|---|---|---|---|
| 1 | No reflected listing column was ever `sortable` — no header to click on ANY listing (Listing, AutoCrud) in Java, .NET or Python, despite the docs ("sorting comes free") | core `ListingColumnBuilder`, .NET `AsListingColumn`, Python `listing_column`, conformance goldens | cd5ecbeef |
| 2 | The crud search read only `field` from the sort the grid sends as `fieldId`: every header sort was dropped server-side (the page was just re-sorted in the browser) | core `SearchActionHandler` | cd5ecbeef |
| 3 | Same in the ports' crud search | .NET `SyncHandler.Search`, Python `search.py` | 51ceef186 |
| 4 | Vaadin: first header click threw (`sorter.__data` is Polymer-only), the header renderer hid the sorter, a fresh grid after each search forgot the direction → never descending | `renderColumn.ts`, `mateu-table.ts`, new `gridSort.ts` | cd5ecbeef |
| 5 | A deep link with filters `/books?genre=X` rewrote the address bar to `/books/books?genre=X` | `navigationUrl.ts routeTargetUrl` | cd5ecbeef |
| 6 | Opening a record from a filtered/paged listing pushed `/?page=1/B-11` (query treated as the mount) | core `MultiView.mountPathOf` | cd5ecbeef |
| 7 | Capability listings: a deep link, reload or Forward to a record rendered the LISTING under the record's url (the bridge never carried `_route`) | core `CapabilityCrud`, `Crud.state`, `MultiView.routingState` | cd5ecbeef |
| 8 | After a delete or a row/bulk action the listing never refreshed (RunAction aimed at a `ux_…_cs_list` id no component carries) | core `DeleteEditActionHandler`, `ActionOnRowActionHandler`, `CrudTriggersBuilder` (`LISTING_CHANGED_EVENT`) | cd5ecbeef |
| 9 | Crud forms in a drawer (editInDrawer, Editable-without-Navigable) skipped validation: a required field left empty was saved | core `DrawerFormValidator` (error banner keeps the drawer) | cd5ecbeef |
| 10 | A crud action's result list became the browser tab title (`[State[state=…`) | core `CommandMapper` | cd5ecbeef |
| 11 | A record's generated toString was its page/drawer title (`Note[id=null, text=]`) | core `PageMetadataExtractor` | cd5ecbeef |
| 12 | Export CSV button did nothing on every AutoCrud and plain Listing (action never advertised); the capability bridge hid the export buttons | uidl `Listing.exportActions`, `CrudActionsBuilder`, `CapabilityCrud` | 3118e5129 |
| 13 | A boolean filter restored from the URL showed `Certified: true` instead of `Yes` | `mateu-filter-bar.ts` | 3118e5129 |
| 14 | AutoCrud editInDrawer: opening the drawer pushed `/{id}`; after closing, a reload opened the view page | core `CrudDrawerBuilder` | 609f37d25 |
| 15 | After a delete / bulk action an AutoCrud's address bar became `/products/products` (reload 404) | `navigationUrl.ts routeTargetUrl` | 0c9b0baf6 |
| 16 | Demo `/products` row-menu actions were package-private → refused (403) | demo-admin-panel `Products` | 0c9b0baf6 |
| 17 | The YAML starter's listing (generated into every new project) had no sortable column although its comment promises sorting | `starters/yaml|static/products.yaml` | c47e42d8e |
| 18 | Redwood: a descending header sort painted the server's page in ascending order (oj-table re-sorted it in the ADP) | redwood `main-start-page.js serverSorted` | d882da395 |
| 19 | Vaadin: group marker rows of a `@GroupBy` listing showed a dead selection checkbox | `mateu-table.ts` (`isItemSelectable`) | 60029b16f |
| 20 | WebFlux/Quarkus/Helidon: a deep link with a listing's filters (`/books?x=y`) opened the APP root ui, empty | core `DirectClassResolver`, uidl `RouteResolver` | 377d1c453 |
| 21 | Static bundle: a filtered listing (`/products?status=X`) answered nothing on reload / shared link | `bundleStore.toSyncPath` | 07feff813 |
| 22 | HeroSearch / SmartSearchPage (`<Filters, Row>` bases): result columns/cards built from the FILTER fields | uidl `GenericTypeHierarchyResolver` | 88623485a |

## Matrix

Columns: **J/V mvc** = Java authored, Vaadin, Spring MVC · **J/V wf** = same on WebFlux · **Y/V** =
YAML authored, Vaadin, served · **Y/static** = YAML static bundle (specsOnly) · **RW** = Redwood
(Java, mvc) · **Y/RW** = YAML on Redwood · **.NET / Py** = ports (wire + port tests) · **RN / IJ** =
React Native / IntelliJ · **Editor** = visual editor.

| Feature | J/V mvc | J/V wf | Y/V | Y/static | RW | Y/RW | .NET | Py | RN | IJ | Editor |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bare `Listing<Row>` (no chrome, rows load on opening) | ✅ spec | ✅ spec | ✅ | ✅ | ✅ | ✅ | ✅ conf | ✅ conf | ⏳ | ⏳ | ⏳ |
| `Searchable` — word search, any order | ✅ spec | ✅ spec | ✅ | ✅ | ✅ | ⏳ | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| `Filterable` text filter / chips | ✅ spec | ✅ spec | ✅ select | ✅ select | ✅ | ✅ select | ✅ tests | ✅ tests | ⏳ | ⏳ | ⏳ |
| Typed filters (NumberRange, DateRange, Set<Enum>) | ✅ spec | ✅ spec | N/A | N/A | ✅ multi | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| AutoCrud criteria (date range default, enum multi, bool) | ✅ probe /products | ⏳ | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Header sort (asc/desc/off), server-side | 🔧 #1 #2 #4 spec | 🔧 spec | 🔧 #17 | 🔧 #17 | 🔧 #18 spec | ✅ | 🔧 #1 #3 | 🔧 #1 #3 | 🔧 #1 (now offered) ⏳ | 🔧 #1 (now offered) ⏳ | ⏳ |
| Paging (server total) / pager | ✅ spec | ✅ spec | ✅ (starwars totalPath) | ✅ client paging | ✅ | ⏳ | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| URL sync (page/sort/filters) + reload | ✅ spec | ✅ spec | ✅ | 🔧 #21 | ❌ (no listing state in URL) | ❌ | N/A | N/A | N/A | N/A | N/A |
| Deep link with filters | 🔧 #5 spec | 🔧 #20 spec | ✅ | 🔧 #21 | ⏳ | ⏳ | N/A | N/A | N/A | N/A | N/A |
| Row click (whole row) → record; back; forward | 🔧 #6 #7 spec | ✅ spec | ✅ rowRoute (starwars) | ⏳ | ✅ (back loses search, see URL row) | ⏳ | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Deep link to a record (`/books/B-07`) | 🔧 #7 spec | ✅ spec | ✅ | ✅ static-vcn | ⏳ | ⏳ | N/A | N/A | N/A | N/A | N/A |
| Record title | 🔧 #11 spec | ✅ | N/A | N/A | ✅ ("Book") | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Editable w/o Navigable → drawer, save refreshes | ✅ spec | ✅ spec | N/A | N/A | ✅ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Drawer validation (required field) | 🔧 #9 spec | 🔧 spec | N/A | N/A | 🔧 #9 (banner) | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| AutoCrud editInDrawer (open/cancel/save, url) | 🔧 #14 core test + probe | ⏳ | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Create (`/new` page or drawer) | ✅ spec | ✅ spec | ✅ starwars | ⏳ | ✅ | ⏳ | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Delete with confirmation + refresh | 🔧 #8 #15 spec | 🔧 spec | ✅ starwars (restAction) | ⏳ | ✅ | ⏳ | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Bulk actions (`@ListToolbarButton`, selection gate) | 🔧 #8 #15 spec + probe | ✅ spec | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Row action menu (ColumnActionGroup) | ✅ probe (+ demo #16) | ⏳ | N/A | N/A | ⏳ | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Inline editing (`@InlineEditing`, update-row, no no-op commits) | ✅ probe /inline-crud-demo | ⏳ | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Aggregates + `@GroupBy` | 🔧 #19 probe | ⏳ | N/A | N/A | ⏳ | N/A | ✅ conf | ✅ conf | ⏳ | ⏳ | N/A |
| Column chooser (persisted) | ✅ probe | ⏳ | ⏳ | ⏳ | ✅ (button present) | ⏳ | N/A | N/A | ⏳ | ⏳ | N/A |
| Saved views ★ default | ✅ probe | ⏳ | ⏳ | ⏳ | ✅ (button present) | ⏳ | N/A | N/A | N/A | N/A | N/A |
| Exports: CSV built-in, Excel/PDF only with an exporter | 🔧 #12 spec | ✅ spec | N/A | N/A | ✅ (button) | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Grid layout cards (HeroSearch), `searchesOnOpening=false` | 🔧 #22 probe | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Tree lookup selector (dialog, Select) | ✅ probe /tree-select | ⏳ | N/A | N/A | ⏳ | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| REST listing: proxy vs direct, `totalPath`, `rowRoute` | ✅ starwars (direct + server paging) | ⏳ | ✅ | ✅ sample | ⏳ | ✅ sample | N/A | N/A | ⏳ | ⏳ | ⏳ |
| Sample data (`sample:` in sample mode) | N/A | N/A | ✅ | ✅ | N/A | ✅ | N/A | N/A | ⏳ | ⏳ | ⏳ |
| CRUD labels / `@Not*` subtraction | ✅ existing features.spec | ✅ | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Optimistic locking (`@Version` dialog) | ✅ core test only (no app) | ⏳ | N/A | N/A | ⏳ | N/A | ✅ tests | ✅ tests | ⏳ | ⏳ | N/A |
| Audit history | ✅ core test only | ⏳ | N/A | N/A | ⏳ | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| `@DragRows` + DropZone | ✅ core test only | ⏳ | N/A | N/A | ⏳ | N/A | ⏳ | ⏳ | ⏳ | ⏳ | N/A |
| Empty states | ✅ (cap-books search w/o match shows the empty block) | ⏳ | ⏳ | ⏳ | ✅ (noData template) | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A |

## Doc claims found wrong (now true)

- `capability-listings.md` / `listing.md` / `Listing` javadoc: "rows only — that alone puts a grid
  on screen with column sorting" — no reflected column was sortable (any backend). Fixed in code
  (#1–#4), so the claim holds now.
- `starters/yaml|static/products.yaml` comment: "search, a filter, sorting and paging" — the columns
  did not declare `sortable: true`. Fixed in the starter (#17).
- `CLAUDE.md` "CSV export … Mateu owns the Export buttons": they rendered but never ran (#12).
- `CLAUDE.md` editInDrawer: "in drawer mode view→edit drawer (no view page)" — the url still moved
  to the record and a reload opened its view page (#14).

## ❌ not fixed (owner decision)

- **Redwood keeps no listing state in the URL** (search, filters, page, sort): Back from a record
  returns to an unfiltered page 1; a reload or a shared link loses the filters. Vaadin and the static
  bundle sync it. Should Redwood adopt the same `?searchText=&page=&sort=` contract? (Its routes are
  by path; nothing in the VB core writes the query today.)

## Notes for other areas

- The ports' and Java's listing columns now carry `sortable` (wire field added in .NET
  `GridColumnMetaDto.Sortable`, Python `GridColumnMeta.sortable`); RN and IntelliJ already gated their
  header sort on it, so it is now offered there too (sending `{field, direction}`, accepted by every
  server path) — not walked on device.
- `Crud.LISTING_CHANGED_EVENT` (`mateu-crud:listing-changed`) is the new refresh signal for a crud
  listing (delete, row/bulk actions). The conformance runners drop the mediator's own `mateu-crud:*`
  subscriptions (structural, like `actions`).
- A delete/bulk action still answers a mediator state flip + the event, so the listing searches twice;
  harmless, could be trimmed.
- A deep link with query params triggers two identical `search` requests on Vaadin (OnLoad + URL
  init) — harmless duplicate.
- `GenericTypeHierarchyResolver` now binds type variables along the hierarchy first (uidl, used
  everywhere): full core (1751) + uidl suites green.
- Shared machine note: `npm ci --workspace mateu-redwood` at the monorepo root wipes the other
  workspaces' `node_modules` (and vice versa).

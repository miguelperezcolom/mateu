---
title: Feature parity matrix
description: What each server (Java, .NET, Python) and each renderer supports today.
---

Mateu's contract is the wire: any server can serve any renderer. Coverage differs by
implementation — this page is the honest snapshot, and the single place to update when something
is ported. ✅ full · 🟡 partial (see note) · — not yet.

## Servers

The Java server is the reference implementation; the .NET and Python servers emit the same wire
for the surface below (verified by golden-JSON tests in `backend/dotnet/test` and
`backend/python/tests`).

| Feature | Java | .NET | Python |
|---|---|---|---|
| Forms, sections, field types, validation | ✅ | ✅ | ✅ |
| CRUD (list / detail / edit / new / save / delete) | ✅ | ✅ | ✅ |
| App shell + menus + navigation | ✅ | ✅ | ✅ |
| App shell + menus authored IN CODE (Java `AppSupplier`/`MenuSupplier` returning a fluent `AppShell`; .NET `IAppSupplier`/`IMenuSupplier` + `AppShell`; Python `AppSupplier`/`MenuSupplier` + `AppShell`) — the whole shell (or just the menu) computed at request time, overriding the static `@App`/`@Menu` declarations | ✅ | ✅ | ✅ |
| Wizards (incl. branching, cross-step state, `@WizardProgress` BAR/STEPS/RAIL) | ✅ | ✅ | ✅ |
| CRUD create/edit in a drawer (`editInDrawer` — save closes + refreshes the listing in place) | ✅ | ✅ | ✅ |
| Collection-detail / general-overview archetypes (`CollectionDetail<Row>`, `GeneralOverview<Row>`) + fluent `FormField` | ✅ | ✅ | ✅ |
| Guided import wizard (`ImportWizard<Row>`: CSV upload/paste, auto-mapping grid, validation report, typed import) | ✅ | ✅ | 🟡 |
| Page decorations (subtitle, banners, badges, KPIs, FABs) | ✅ | ✅ | ✅ |
| Header overline + title placeholder (`@Overline`/`@TitlePlaceholder`; Java also has `OverlineSupplier`/`TitlePlaceholderSupplier`, the ports carry only the declarative form — same as `@Subtitle`) | ✅ | ✅ | ✅ |
| Tabs, stereotypes, shortcuts, compact, dirty guard | ✅ | ✅ | ✅ |
| Adaptive layout inference (radios, folding, tabs) | ✅ | ✅ | ✅ |
| Nav links (`@LinkTo` / link supplier) | ✅ | ✅ | ✅ |
| [Route registry](/java-ui-definition/route-registry/) (`specs/ui/routes.yaml`: definition + view model + fixed/default params per route, merged over the derived table). Both ports mirror the model, the matching, the precedence and the definition lookup; neither has a static-bundle exporter, so nothing ships the table to a browser there | ✅ | ✅ | ✅ |
| Route registry authored IN CODE (Java `RouteEntrySupplier`, .NET `IRouteEntrySupplier`, Python `RouteEntrySupplier` → `List<RouteEntry>`): the programmatic half of the authored side — a route binding a definition/view model/pinned params independently, or a route with NO view model — discovered per backend (a bean in Java, an assembly/module type in the ports). Precedence: `routes.yaml` > code supplier > derived. (Python's `RouteEntry` has no nested `children`: author flat entries with `parent` set) | ✅ | ✅ | ✅ |
| Dashboard / Foldout / Welcome / ItemOverview archetypes | ✅ | ✅ | ✅ |
| UX components (MetricCard, Gantt, EmptyState, Skeleton…) | ✅ | ✅ | ✅ |
| Planning board (tape chart: resources × days, colored blocks, move/select actions) | ✅ | ✅ | ✅ |
| High-level UX components (Kanban, Timeline, Stat, Calendar, PricingTable, OrgChart, Heatmap, Funnel, TrendChart, FeatureGrid, Testimonials, Faq, CalloutCard, CommentThread, FileList, ComparisonCard, Checklist, ProgressSteps) | ✅ | ✅ | ✅ |
| Front-office components (EntityHeader, Meter, TaskProgress, StatusList, TaskQueue, ResourceGrid, OfferCard incl. toggle state, AddOnPicker, Ledger, PaymentPicker, ProcessMonitor, Notice incl. status/noIcon/content, BulletedList) | ✅ | ✅ | ✅ |
| Section polish (`@SeparatorBefore`, text sizes, `@Section(propertyList/frameless)`, responsive zones) | ✅ | ✅ | ✅ |
| `Anchor` (external links, `target` + rel=noopener) | ✅ | ✅ | ✅ |
| Card menus (`@Menu(display = cards)` / `MenuGroup` / `menu_group`) | ✅ | ✅ | ✅ |
| `ActionPanel` (categorised "I want to…" actions) | ✅ | ✅ | ✅ |
| `MatrixGrid` (rows × dates, collapsible sections, link/editable cells) | ✅ | ✅ | ✅ |
| `Map` with markers (`MapMarker`, `markerActionId` → `_markerId`; fits the markers when no position) | ✅ | ✅ | ✅ |
| Calendar views (`Calendar.view`/`views`: month, week, day, list), per-date cells (`days`), clickable dates (`dayActionId`); `CalendarPage` `views()`/`days()`/`actionOnDay()` | ✅ | ✅ | ✅ |
| Access keys mode (`@App(accessKeys)` → `AppDto.accessKeys`) | ✅ | ✅ | ✅ |
| `Popover.trigger` (click/hover) + `@Tooltip("field")` → `GridColumn.tooltipPath` | ✅ | ✅ | ✅ |
| `@DragRows` → `CrudlDto.dragType` + `DropZone` | ✅ | ✅ | ✅ |
| Row tones (`@RowStatus` → `CrudlDto.rowStatusField`) and listing export buttons on `AutoCrud` | ✅ | ✅ `[RowStatus]` + Export CSV / Excel / PDF (`CsvExportable`/`ExcelExportable`/`PdfExportable` on `Crud<T>`, `Listing<F,R>` or any `ICrudExports` listing; built-in dependency-free writers, pluggable `ICsvExporter`/`IExcelExporter`/`IPdfExporter`) | 🟡 `RowStatus()` + Export CSV (`Crud.csv_exportable()`, built-in CSV writer); no Excel/PDF exporters in the port |
| i18n, events (emit/subscribe), security scaffolding | ✅ | ✅ | ✅ |
| Application context selector (`@AppContext`) | ✅ | ✅ | ✅ |
| App header actions (`AppActionsSupplier` → buttons + dropdown groups) | ✅ | ✅ | ✅ |
| `@Audience` persona projection (audience app-context + projection filter) | ✅ | ✅ | ✅ |
| Capture fields (`@Signature`, `@PhotoCapture`) | ✅ | ✅ | ✅ |
| Generic file upload field (`@FileUpload`, accept filter in the field attributes) | ✅ | ✅ | ✅ |
| Tree selects (`@TreeSelect` + hierarchical options) | ✅ | ✅ | ✅ |
| Smart-search listing filters (enums as multi-select, date/number ranges) | ✅ | ✅ | ✅ |
| Declarative listings (`Listing<Row>` + capabilities) | ✅ | ✅ | ✅ |
| — typed `DateRange`/`NumberRange`/`Set` filter fields | ✅ | ✅ | ✅ |
| — DB pushdown (override `find`: one query, real total, in-memory pipeline skipped) | ✅ | ✅ | ✅ |
| Tree lookup selectors (`GridLayout.tree` + `Selector`) | ✅ | ✅ | ✅ |
| Lookup fields (`@Lookup` remote combobox + `search-<field>` action) | ✅ | ✅ | ✅ |
| — `@Searchable` full selector dialogs (`Selector` + `codesearch`) | ✅ | ✅ | ✅ |
| External REST options (`@RestOptions`/`[RestOptions]`/`RestOptions()` → select; options fetched client-side from an arbitrary endpoint via `FormField.optionsSource`) | ✅ | ✅ | ✅ |
| External REST listing rows (`@RestListing`/`[RestListing]`/`@rest_listing` on a listing → rows fetched client-side from an arbitrary endpoint via `Crudl.rowsSource`; columns from the Row type) | ✅ | ✅ | ✅ |
| External REST button action (`@RestAction`/`[RestAction]`/`@rest_action` on a button → calls an arbitrary endpoint client-side via `Action.restAction`; response toast + merge into form state) | ✅ | ✅ | ✅ |
| External REST screen data (`@RestData`/`[RestData]`/`@rest_data` on a view → initial data fetched client-side on load and merged into the form state; reuses the `restAction` machinery via a synthetic `__restdata__` action + OnLoad trigger) | ✅ | ✅ | ✅ |
| — Proxy mode (`proxy = true` on any of the four → the fetch is routed through the Mateu server via the reserved `__restfetch__` action: no CORS, and `${secret.X}` auth injected server-side from a secrets provider / `MATEU_SECRET_*` env var; url values percent-encoded by position on both legs; the server resolves the DECLARED source only) | ✅ | ✅ | ✅ |
| — Proxy mode for views with no annotation to read (`RestSourceSupplier`: a view assembled at runtime declares its sources programmatically, and they gate `__restfetch__` and resolve a proxy fetch exactly as annotations do) | ✅ | ✅ | ❌ |
| [REST source catalogue](/java-ui-definition/rest-source-catalogue/) (`specs/ui/sources.yaml` + `@RestSource`/`RestSourceCatalogSupplier` → a named endpoint referenced by `ref`; two producers, authored wins). Java and .NET carry the registry (catalogue reader + `ref` resolution + `AppDto.restSources`); Python resolves inlined sources, not a named catalogue | ✅ | ✅ | 🟡 |
| [Business components](/java-ui-definition/component-catalogue/) (`specs/ui/components.yaml` + `@BusinessComponent`/`ComponentCatalogSupplier` + `ComponentRef` → a named, BOUND composition of existing pieces referenced by name; ports for free, resolves with no backend). Same two-producers/authored-wins registry as the source catalogue; .NET carries it too (`ComponentRef` expanded server-side, `AppDto.components`) | ✅ | ✅ | 🟡 |
| [Custom components](/java-ui-definition/custom-components/) (`CustomComponent(name, props, content)` — a genuinely NEW rendering as data; the per-renderer escape hatch). The WIRE is data and identical across backends; the RENDERING is per-renderer (`registerCustomComponent`, degrading to `<mateu-unsupported>`) | ✅ | ✅ | ✅ |
| Sizing intent (`hug`/`fill`/`fixed:<len>` as portable data on the component; a listing infers `fill`) | ✅ | ✅ | ✅ |
| Editable grids / inline CRUD editing (`@InlineEditing` + update-row) | ✅ | ✅ | ✅ |
| Bulk list actions (`@ListToolbarButton` + typed selection) | ✅ | ✅ | ✅ |
| Listing aggregates & grouping (`@Aggregate`/`@GroupBy` + summaries) | ✅ | ✅ | ✅ |
| Group header actions (`@GroupAction` buttons on group rows, `_groupValue` parameter) | ✅ | ✅ | — |
| Group summaries synthesized for custom `Listing`s (`ListingData.withSynthesizedGroups`) | ✅ | ✅ | — |
| Optimistic locking (`@Version` → conflict dialog on save/update-row, `_forceOverwrite`) | ✅ | ✅ | ✅ |
| Notification inbox (`NotificationsSupplier` → header bell + `_notifications-*` actions) | ✅ | ✅ | ✅ |
| Undoable toasts (`Message.undoable` → undo action id + parameters on the wire) | ✅ | ✅ | ✅ |
| Global entity search (`GlobalSearchSupplier` → `globalSearchEnabled` + `_globalsearch`) | ✅ | ✅ | ✅ |
| Dialog/Drawer overlays from actions + `closeModal`/`dispatchEvent` | ✅ | ✅ | ✅ |
| Structure ETag / template-ref (`structureHash` + request `knownStructureHash` → omit the component when unchanged) | ✅ | ✅ | ✅ |
| ModelView bindable contract (`__contract__` sync action → fields + actions on `appData._contract`, for the visual-builder tooling) | ✅ | ✅ | ✅ |
| Visual-builder live preview (`__preview__` sync action → renders arbitrary YAML page text; the plugin's preview pane) | ✅ | ✅ | ✅ |
| [`layoutDelta:`](/java-ui-definition/yaml-ui-definition/) (what a human changed about the INFERRED layout, anchored to field ids and re-applied every request, so a screen touched in the visual editor keeps following its model). The editor writes it and falls back to a `layout:` snapshot — visibly — when an edit cannot be a delta. Java and .NET apply it; Python parses the key and declines the page rather than rendering it wrongly | ✅ | ✅ | — |
| [Partials](/java-ui-definition/partials/) (`specs/ui/partials/<ref>.yaml`; spliced into the parent's content, resolved server-side so they never reach the wire). All three splice, stack where there is no list, drop a missing ref and break a cycle; only Java resolves a `ref` that names a class | ✅ | ✅ | ✅ |
| YAML pages bound to a ModelView (`specs/ui/<route>.yaml` with `modelView:` → the file supplies the layout, the class supplies state + actions; on the classpath in Java, under the cwd — `MATEU_SPECS_DIR` — in the ports) | ✅ | ✅ | ✅ |
| Static-view skip (`@StaticView`/`[StaticView]`/`@static_view` → `staticView` flag; client caches the full response for the session and skips the round-trip on return) | ✅ | ✅ | ✅ |
| Sticky sections index (`@Toc`) | ✅ | ✅ | ✅ |
| Client-side rules (`@Hidden(expr)`/`@Disabled`/rule supplier) | ✅ | ✅ | ✅ |
| Grid form fields + `@OnRowSelected` row-click actions (incl. add/create/select on plain forms outside wizards) | ✅ | ✅ | ✅ |
| Wide-field auto-colspan (grid/textarea/richText span the full row of a multi-column section) | ✅ | ✅ | — |
| Inline-editing grid "+" appends an in-place row (the detail-form response targets a container inline grids never render) | ✅ | ✅ | — |
| Multi-state embedded islands (`@Inline` orchestrator fields, host-seeded initialData) | ✅ | ✅ | — |
| Multi-column layouts (`@Zones`, `@FoldedLayout`) | ✅ | ✅ | ✅ |
| AI chat (`@AI`/`[AI]`/`@ai` → `sseUrl`; the SSE endpoint is developer-provided) | ✅ | ✅ | ✅ |
| Semantic (composed) annotations | ✅ | ✅ | ✅ (an `Annotated` alias) |
| Federation (remote menus + `MicroFrontend` islands) | ✅ | ✅ | ✅ |
| Component adapters | ✅ | ✅ `IComponentAdapter<T>` SPI | 🟡 wrapper idiom |
| Hero search archetype | ✅ | ✅ | ✅ |

Import wizard on .NET/Python: same step flow (upload/paste → auto-mapped column grid with a
select-editable target-field cell → per-line validation report → typed import + result counts)
and the same CSV semantics (`,`/`;` autodetect, RFC-4180-ish quoting, data-URI uploads), on the
ports' `[Step(n)]` wizard machinery. .NET closed the remaining gaps (2026-10-10): the validation
step's forward button is the **Import** completion action, the result step is final (no navigation,
a re-sent back/next cannot import twice), steps are named Upload / Mapping / Validation / Result,
the heading defaults to `Import <Row>` and `TimeOnly`/`DateTimeOffset`/`Guid` columns convert;
its validation surface is DataAnnotations (`[Required]`, `[Range]`…), with their default messages.
Python still imports on the validation step's **Next** and only knows `Required()` — hence its 🟡.

Smart-search filters on .NET/Python: the Crud entity's fields become the same filter widgets
(enums → multi-select IN, temporals → date ranges, `[RangeFilter]`/`RangeFilter()` numerics →
min–max), applied in-memory over `Fetch()` by default — same as Java's default repository — or
pushed to the database by overriding `Find`/`find` (the filters arrive as the raw component state
rather than Java's typed `FilterCriterion` objects; a contract difference, not a capability gap).

**Recent .NET/Python parity gains (2026-07-17)**: CRUD create/edit in a drawer
(`Crud<T>.EditInDrawer` virtual / `@edit_in_drawer` decorator — new and row clicks answer the
entity form inside a `Drawer` Add partial over the listing; cancel closes it; save persists and
answers `CloseModal` carrying the `mateu-crud:saved-in-drawer` event plus a `RunAction search`
command, so the listing refreshes in place with no navigation), the wizard RAIL progress style
(`[WizardProgress("rail")]` / `@wizard_progress("rail")` — the step form on the left, a sticky
right band with a big `current | total` counter over the vertical step list; `ProgressSteps`
carries `vertical` in all three backends), and — closing the day's last gap — the **fluent
`FormField` primitive** (a live field composed into any fluent tree, bound to componentState by
`fieldId`; with options it renders as a select) plus the `CollectionDetail` and `GeneralOverview`
archetypes built on it: tree-supplier views seed their scalar properties into `initialData` (so
search/selection round-trip) and emit an `AutoSave` trigger so typing/switching re-renders the
page in place.

**Recent .NET/Python parity gains (2026-07-11)**: inline CRUD editing
(`[InlineEditing]`/`@inline_editing` — editable columns with typed in-place editors +
the update-row action rebuilding and saving the row), lookup fields (`[Lookup]`/`Lookup()` →
combobox + remoteCoordinates, the handler answers `search-<field>` from the options supplier,
filtered and paged), Dialog/Drawer overlays returned from actions (Add partials on the initiator,
with `CloseModal`/`DispatchEvent` command factories carrying `{eventName, detail}`), `[Toc]`/`@toc`,
the full HeroSearch archetype (hero header + cards listing, starts empty), client-side rules
(`[Hidden(expr)]`/`[Disabled]` + `IRuleSupplier`/`RuleSupplier` → `ServerSideComponent.rules`),
grid form fields (list-of-rows properties → dataType `array` + stereotype `grid` + columns) with
`[OnRowSelected]`/`OnRowSelected()` injecting the clicked row into the handler method, and the
`[Zone]`/`@zones` + `[FoldedLayout]`/`@folded_layout` multi-column layouts. Earlier (2026-07-10):
CRUD search sorts and paginates; actions can return page banners, a `/route` or a UICommand.
Declarative listings (Java `Listing<Row>` + capabilities / Python `Listing[F, R]`) landed the same day with the
typed `DateRange`/`NumberRange`/`Set` filters, the `_from`/`_to` state assembly, and the
`Selector` contract on top: `@Searchable` fields open their selector listing in a modal
(`codesearch-<field>` → Dialog; row pick → value-changed/data-changed/close-modal-requested),
including TREE-shaped selectors (`gridLayout()` override → `"tree"`, rows carrying nested
`children` arrays). Semantic annotations and the AI chat landed too: .NET resolves composed
attributes transitively (`Meta.Find`, attributes decorating attribute classes) while in Python a
reusable `Annotated` alias needs no machinery at all; `[AI]`/`@ai` emit `sseUrl` and both manuals
document the SSE endpoint contract (POST `{message, sessionId, menuContext?}` → `data:` chunks).
The final gaps closed the same day: DB pushdown (`Find`/`find` override — one query with the real
total, the in-memory pipeline skipped), federation (`[RemoteMenu]`/`@remote_menu` federated menu
entries — the frontend fetches the remote menu itself — and the `MicroFrontend` island component),
and component adapters resolved as a documented idiom: both ports render plain classes
reflectively, so a thin wrapper view over the foreign object (fields exposing its data, an action
writing back) replaces Java's `ComponentAdapter` SPI — see "Adapting foreign classes" in each
manual. The four depth tails inside ✅ rows closed too: pre-existing `@Lookup`/`@Searchable`
values resolve their display label (`ILookupLabelSupplier`/`LookupLabelSupplier` →
`<fieldId>-label` partial data), grid form fields edit in place (`@InlineEditing` on the
property, rows binding back into the typed list), permission-driven field states
(`@EyesOnly`/`@ReadOnlyUnless`/`@DisabledUnless` against an adapter-supplied Identity), and the
full `@App(AUTO)` variant decision table (explicit wins; menu folders via `Group`/`group` →
TILES/HAMBURGUER_MENU/MENU_ON_TOP; flat menus → TABS). Nothing on the server surface remains
Java-only.

**2026-07-16 parity pass**: the front-office dogfooding wave (OfferCard toggle state, StatusItem
avatar, StatusList compact/frameless, Notice status/noIcon/content, `@Audience`) landed on all
three backends in the same commits; the two features that had slipped through Java-only — app
header actions with dropdown grouping (`AppActionsSupplier`) and `Anchor.target` — were ported the
same day (.NET `IAppActionsSupplier`/`Anchor { Target }`, Python `AppActionsSupplier`/`Anchor`),
each pinned by golden-JSON tests. The remaining Java-only rows above are in-page orchestration
behaviors (embedded islands, inline-grid "+", wide-field auto-colspan), not wire surface.

**2026-07-17**: optimistic locking (`[Version]`/`Version()` — stale saves and inline row updates
answer the same reload/overwrite conflict dialog as Java, byte-identical texts; `_forceOverwrite`
adopts the stored version then bumps) and the notification inbox
(`INotificationsSupplier`/`NotificationsSupplier` → `AppMetadata.notificationsEnabled` +
`_notifications-list`/`_notifications-read` with ids list or `"all"`) landed on .NET and Python,
each pinned by golden-JSON tests mirroring the Java sync suites.

### Deliberately Java-only (not oversights)

A short list of rows above is `—`/`❌` on Python **by design**, not because it is pending. It is
called out here so a reader choosing a port for GA knows exactly what is and is not on offer — the
honest edge of the "same wire" promise. (.NET closed all of these on 2026-10-10: `IRestSourceSupplier`
proxy sources, the source and component catalogues, `layoutDelta:`, group actions and synthesized
group summaries, wide-field auto-colspan, the inline-grid "+" row and the whole grid-field row
editor, multi-state embedded islands and the `IComponentAdapter<T>` SPI — each pinned by tests, and
the wire by the hard conformance gate.)

- **Proxy mode for views with no annotation to read** (`RestSourceSupplier`). Python resolves a
  proxy source by *reflecting the routed type's annotations* and never instantiates the view for
  `__restfetch__`. It is the SSRF-sensitive path (the server must take the endpoint from its own
  state, never the request); .NET instantiates the view server-side and asks it first, never the
  request.
- **In-page orchestration behaviours** — `@GroupAction` group-header buttons + synthesized group
  summaries for custom listings, wide-field auto-colspan, the inline-grid "+" append row, and
  multi-state embedded islands. Render/interaction refinements layered on the orchestrators; the
  declarative surface they sit on (grouping, aggregates, grids, inline editing) is at full parity.

The sustainable fix for this edge is not the maintainer porting each one by hand — it is the shared
wire-conformance corpus that every port runs in its own CI, so a gap fails loudly and its owner
closes it. That is tracked as a GA workstream.

## Renderers

Every renderer speaks the same wire; the depth of widget support varies.

| Feature | Vaadin (web) | Redwood (web) | IntelliJ plugin | React Native |
|---|---|---|---|---|
| Forms, CRUD, navigation | ✅ | ✅ | ✅ | ✅ |
| Smart-search filter bar (chips, ranges, multi-select) | ✅ | ✅ | ✅ (native panel) | ✅ panel (ranges, multi-select, date pickers) |
| Sorting, cards/list/tree layouts, empty states | ✅ | ✅ | ✅ (tree = JTree; cards/list adapt to the table) | ✅ |
| Inline editing (@InlineEditing, update-row) | ✅ | ✅ | ✅ (row form) | ✅ (row form) |
| Date picker | ✅ | ✅ | ✅ (calendar popup) | ✅ (own calendar) |
| Remote lookup select (@Lookup / searchable) | ✅ | ✅ | ✅ | ✅ |
| Full field-stereotype set (radio, multiSelect, slider, stepper, stars, color, image upload, money, markdown…) | ✅ | 🟡 radio, multi-select, checkboxes, toggle, number/money (`oj-input-number`), textarea, dates, lookups, file/image/signature/photo; **no** slider, stars, color or rich text/markdown yet | ✅ | ✅ |
| Client-side rules (visible/disabled/state) + \${...} interpolation | ✅ | 🟡 CSP-safe engine (visible/disabled/required/value + `OnValueChange`) on the page's own form; not yet inside drawers/dialogs or embedded islands | ✅ (shared engine) | ✅ (no-eval engine) |
| Page banners (@Banner + action-returned) | ✅ | ✅ | ✅ | ✅ |
| FABs, header badges, KPIs, charts | ✅ | 🟡 header badges, KPIs, `MetricCard`/`Scoreboard` tiles and charts on any page (`oj-chart`: bar, line, area, pie, doughnut, polar, several series); **no** FABs | ✅ (FABs as header buttons) | ✅ |
| @AutoSave / @SubscribeTo scopes / @OnRowSelected | ✅ | ✅ | ✅ | ✅ |
| Periodic refresh (`OnLoad` with `timeoutMillis` + `OnSuccess` loop, `background`) | ✅ | ✅ (stops when the screen changes) | ✅ (stops when the view changes or its tab closes) | ✅ (stops when the screen changes or unmounts) |
| Keyboard shortcuts (`@Action(shortcut)`, `@Tab(shortcut)`) + access keys mode (`@App(accessKeys)`: hold Alt, Alt+letter) | ✅ | ✅ | ✅ (Swing mnemonics) | — (no hardware-key model) |
| Hover details (`Popover` with `trigger = hover`, `@Tooltip("otherField")` on listing cells) | ✅ | ✅ (shared `oj-popup`) | ✅ | 🟡 press / long-press (no hover on touch) |
| Drag rows to a destination (`@DragRows` + `DropZone`: origin and destination in one action) | ✅ | ✅ (`oj-table` dnd) | ✅ | 🟡 "Move to…" picker (no drag on touch) |
| AI chat (sseUrl) / theme toggle | ✅ | 🟡 AI chat (the shell chat FAB's Ask Oracle palette has a 💬 Chat mode — a streaming panel wired to the shared transport core); the `themeToggle` flag is read but **no toggle is drawn** | ✅ chat (theme = the IDE's own) | ✅ |
| App context selector | ✅ | ✅ | ✅ (navigator combos) | ✅ |
| — searchable picker w/ remote search | ✅ | ✅ | 🟡 loaded options only | ✅ |
| Signature capture | ✅ canvas | ✅ canvas (own element: JET has no signature pad) | ✅ mouse canvas | ✅ svg + view-shot |
| Photo capture | ✅ getUserMedia | ✅ | 🟡 file picker (no desktop camera API) | ✅ expo-camera |
| Tree select dropdown | ✅ | ✅ | ✅ (JTree popup) | ✅ |
| Tree lookup selector (dialog) | ✅ | ✅ | ✅ (tree layout) | ✅ (tree layout) |
| Dashboards, Gantt, foldouts, skeletons | ✅ | 🟡 foldouts (`oj-sp-foldout-layout`, and collapsible panels inside a tab) and dashboards (KPI band, tiles by `colSpan`, `oj-chart`) ✅; the `Gantt` and `Skeleton` components are **not** rendered (the Room Diary's `PlanningBoard` is, on `oj-gantt`) | ✅ | ✅ |
| Custom components (`registerCustomComponent`; unknown → visible placeholder) — the per-renderer escape hatch, each renderer with its own registry + graceful degradation (placeholder + slotted children) | ✅ | 🟡 placeholder + slotted children (bridge projection) | 🟡 registry + placeholder | 🟡 registry + placeholder |
| High-level UX components (Kanban, Timeline, Stat, Calendar… + the front-office set) | ✅ | 🟡 the front-office set, `Stat` and `Calendar` (month/week/day/list) ✅; Kanban, Timeline, PricingTable, OrgChart, Heatmap, Funnel, FeatureGrid, Testimonials, Faq, CalloutCard, CommentThread, FileList, Checklist, ComparisonCard **not rendered** — see the coverage table below | ✅ | ✅ |
| App header actions (buttons + dropdown groups) | ✅ | ✅ | — (sidebar shell, no top bar) | — (drawer shell, no top bar) |
| Bulk row selection + selection-required toolbar actions | ✅ | ✅ | ✅ (native multi-select) | ✅ (checkbox column) |
| Saved views (named filter sets, default view) | ✅ | ✅ | ✅ (Views menu: apply/save/default/delete, persisted) | 🟡 apply/save/default/delete (session-scoped) |
| Column chooser (per-user show/hide/reorder) | ✅ | ✅ | ✅ (header menu show/hide + native drag-reorder, persisted) | 🟡 show/hide (session-scoped; no AsyncStorage dep) |
| Listing totals footer + group subtotal rows | ✅ | ✅ | ✅ | ✅ |
| Notification bell (inbox, unread count) | ✅ | ✅ (header bell + `oj-popup` with an `oj-list-view`) | ✅ (sidebar popup) | ✅ (drawer row) |
| Undoable toasts (Undo button) | ✅ | ✅ (JET `oj-message` with the Undo `oj-button` in its detail slot — `oj-sp-messages-toast` has no actions) | ✅ (balloon action) | ✅ (toast button) |
| Entity search (GlobalSearchSupplier: ⌘K palette / search box) | ✅ palette | 🟡 Ask Oracle command palette (navigation); GlobalSearchSupplier entity results not wired | ✅ sidebar search | ✅ drawer search |
| Planning board (tape chart) | ✅ drag+select | ✅ `oj-gantt`: move, resize, double click, range selection, hover summary | ✅ drag+select (MouseListener + pure PlanningDrag) | ✅ drag+select (PanResponder + pure planningDrag) |
| Session-expiry re-auth + retry (`onSessionExpired`) | ✅ | ✅ | ✅ (SessionGuard, sync re-auth) | ✅ (sessionGuard, retry once) |
| Card menus (`@Menu(display = cards)`: a group opening as a panel of cards) | ✅ | ✅ (`oj-popup`) | ✅ | ✅ |
| Action panel ("I want to…": categorised actions, show more, hide unpopulated, shortcut) | ✅ | ✅ (`oj-dialog` + `oj-switch`) | ✅ (dialog; IDE keymap wins on a shared shortcut) | ✅ (modal; no keyboard shortcut) |
| Matrix grid (rows × dates, collapsible sections, link cells, in-place editing) | ✅ | ✅ (`oj-data-grid`) | ✅ (`JBTable` + row header) | ✅ |
| Row tones (`@RowStatus`) | ✅ | ✅ | — | — |
| Dockable multi-tab workspace | — | — | ✅ (IDE editor tabs/splits) | — |
| App registry boot (installable → registry → backend) | — | — | ✅ (+ min IDE build gate) | ✅ |

### Redwood component coverage

What the Redwood/VB renderer does with each component type of the wire. A type it does not
render is **dropped silently** (its children, if it is a container, still render), so this table —
not the feature rows above — is the authority when a screen looks emptier on Redwood than on Vaadin.

<!-- redwood-coverage:start -->
Generated from `frontend/web/monorepo/apps/redwood/poc/coverage.mjs` and checked in CI against the
wire catalogue and the renderer's code (`node poc/parity-check.mjs`): 53 rendered, 11 layout
containers, 9 partial, 35 not rendered (they are dropped silently — the
children of a container still render).

| Component | Redwood | How |
|---|---|---|
| `AccordionLayout` | ✅ | oj-collapsible per panel |
| `ActionPanel` | ✅ | oj-dialog + oj-switch ("I want to…") |
| `AddOnPicker` | ✅ |  |
| `Anchor` | ✅ | link / file download |
| `App` | ✅ | oj-sp shell: navigation drawer / top tabs / card menus |
| `Avatar` | ✅ | oj-avatar |
| `AvatarGroup` | ✅ | oj-avatar per person, +N beyond maxItemsVisible |
| `Badge` | ✅ | oj-badge classes |
| `BulletedList` | ✅ |  |
| `Button` | ✅ | oj-button |
| `Calendar` | ✅ | month, week, day and list views (JET has no calendar: a Redwood-token grid, oj-buttonset-one switcher), per-date cells, clickable dates |
| `Card` | ✅ | oj-panel |
| `Chart` | ✅ | oj-chart: bar, line, pie, doughnut, radar/polar area, scatter; several series |
| `Crud` | ✅ | oj-table + smart search; groups, totals, tones, columns, saved views, export |
| `DashboardLayout` | ✅ | oj-flex columns, each panel its colSpan |
| `DashboardPanel` | ✅ | oj-panel tile (title, subtitle, content) |
| `Details` | ✅ | oj-collapsible (client-side state) |
| `Dialog` | ✅ | oj-dialog (overlay stack) |
| `Drawer` | ✅ | oj-drawer-popup (overlay stack), subtitle, footer actions |
| `DropZone` | ✅ | drop target for @DragRows listing rows (oj-table dnd); its content as text lines |
| `Element` | ✅ | third-party web component, events wired back |
| `EntityHeader` | ✅ | projected to the page header (sticky business card) |
| `FoldoutLayout` | ✅ | oj-sp-foldout-layout; inside a tab, collapsible panels |
| `Form` | ✅ | oj-form-layout |
| `FormField` | ✅ | oj-input-*, oj-select-*, oj-radioset, oj-checkboxset, oj-input-number, capture fields |
| `FormLayout` | ✅ | oj-form-layout |
| `Gantt` | ✅ | oj-gantt: a row per task, progress fill, task click → onTaskSelectionActionId |
| `HorizontalLayout` | ✅ | oj-flex row |
| `Image` | ✅ | JET has no image component: an <img>; relative sources are served by the backend |
| `Ledger` | ✅ |  |
| `Map` | ✅ | Leaflet + OSM tiles (JET has no street map): markers, fit, markerActionId |
| `MasterDetailLayout` | ✅ | list + detail panes |
| `MatrixGrid` | ✅ | oj-data-grid |
| `Meter` | ✅ | oj-progress-bar |
| `MetricCard` | ✅ | KPI tile: value, trend, drill-in action |
| `NotFound` | ✅ |  |
| `Notice` | ✅ | oj-sp-message-banner style band + actions |
| `OfferCard` | ✅ |  |
| `Page` | ✅ | oj-sp header (title, subtitle, KPIs, toolbar, banners) |
| `PaymentPicker` | ✅ |  |
| `PlanningBoard` | ✅ | oj-gantt (move, resize, double click, range selection) |
| `ProgressSteps` | ✅ | oj-train |
| `ResourceGrid` | ✅ |  |
| `Scoreboard` | ✅ | KPI band |
| `Separator` | ✅ |  |
| `SplitLayout` | ✅ | two panes |
| `Stat` | ✅ |  |
| `StatusList` | ✅ |  |
| `TabLayout` | ✅ | oj-tab-bar (nested strips flattened) |
| `TaskProgress` | ✅ |  |
| `TaskQueue` | ✅ |  |
| `Text` | ✅ |  |
| `TrendChart` | ✅ | oj-chart line/area |
| `BoardLayout` | ✅ layout | children stacked, not a board |
| `Container` | ✅ layout |  |
| `ContentLayout` | ✅ layout |  |
| `CustomField` | ✅ layout | its component in place |
| `Div` | ✅ layout |  |
| `FormItem` | ✅ layout |  |
| `FormSection` | ✅ layout |  |
| `FormSubSection` | ✅ layout |  |
| `FullWidth` | ✅ layout |  |
| `Scroller` | ✅ layout |  |
| `VerticalLayout` | ✅ layout |  |
| `CarouselLayout` | 🟡 | an image gallery is an oj-film-strip; slides with other content are stacked |
| `CustomComponent` | 🟡 | visible placeholder + slotted children (no VB registry) |
| `EmptyState` | 🟡 | page-level empty state only |
| `Grid` | 🟡 | oj-table (list display) with its columns and rows; no tree, no paging |
| `HeroSection` | 🟡 | Welcome archetype hero only |
| `Markdown` | 🟡 | formatted (headings, lists, quotes, code, bold, italics, links) as allowlist-sanitized HTML; no tables, and HTML inside the Markdown shows as text |
| `Popover` | 🟡 | trigger + the content as text lines in a shared oj-popup (hover/focus or click); the wrapped component shows as its text |
| `ProgressBar` | 🟡 | wizard progress only |
| `ResponsiveGrid` | 🟡 | fixed tracks → oj-flex columns sized by their fr weights and spans; auto-fill/auto-fit grids stack; reorderable tiles drag (and Alt+←/→) |
| `AccordionPanel` | ↳ | of AccordionLayout |
| `BoardLayoutItem` | ↳ | of BoardLayout |
| `BoardLayoutRow` | ↳ | of BoardLayout |
| `Breadcrumb` | ↳ | of Breadcrumbs |
| `FormRow` | ↳ | of FormLayout |
| `GridColumn` | ↳ | of Grid / Crud |
| `Tab` | ↳ | of TabLayout |
| `Bpmn` | — |  |
| `Breadcrumbs` | — | the shell has its own breadcrumbs |
| `CalloutCard` | — |  |
| `Chat` | — | the app-level AI chat panel exists; the component does not |
| `Checklist` | — |  |
| `CommentThread` | — |  |
| `ComparisonCard` | — |  |
| `ConfirmDialog` | — |  |
| `ContextMenu` | — | its wrapped content shows, the menu does not |
| `CookieConsent` | — |  |
| `Directory` | — |  |
| `Faq` | — |  |
| `FeatureGrid` | — |  |
| `FileList` | — |  |
| `FormEditor` | — |  |
| `Funnel` | — |  |
| `Heatmap` | — |  |
| `Icon` | — |  |
| `Kanban` | — |  |
| `MenuBar` | — |  |
| `MessageInput` | — |  |
| `MessageList` | — |  |
| `MicroFrontend` | — |  |
| `Notification` | — | action messages do show as toasts; the component does not |
| `OrgChart` | — |  |
| `PricingTable` | — |  |
| `ProcessMonitor` | — |  |
| `Result` | — |  |
| `Skeleton` | — | the shell shows its own loading skeleton |
| `Stepper` | — |  |
| `Testimonials` | — |  |
| `Timeline` | — |  |
| `Tooltip` | — |  |
| `VirtualList` | — |  |
| `Workflow` | — |  |
<!-- redwood-coverage:end -->

### React Native component coverage

What the React Native renderer (iOS / Android, `frontend/app/react-native`) does with each
component type of the wire. Since 2026-10-10 **every** type has a native renderer — CI fails the
build if a new wire type is added without one (`scripts/parity-check.mjs`), so a screen never shows
"Unsupported component" on a phone. 🟡 marks a deliberate mobile adaptation (no hover or
right-click on touch → press / long-press; diagram editors shown read-only).

<!-- rn-coverage:start -->
Generated from `frontend/app/react-native/scripts/coverage.mjs` and checked in CI against the
wire catalogue and the renderer's switch (`node scripts/parity-check.mjs`): every wire type has a
native renderer — 88 rendered, 11 layout containers, 6 parts of another component,
10 with a documented mobile adaptation. None is dropped.

| Component | React Native | How |
|---|---|---|
| `AccordionLayout` | ✅ |  |
| `ActionPanel` | ✅ | modal; no keyboard shortcut |
| `AddOnPicker` | ✅ |  |
| `Anchor` | ✅ | in-app route or OS browser |
| `App` | ✅ | drawer / tabs shell (AppRenderer); nested App = own island at its home route |
| `Avatar` | ✅ | image or initials |
| `AvatarGroup` | ✅ | overlapping, +N overflow |
| `Badge` | ✅ |  |
| `Breadcrumbs` | ✅ |  |
| `BulletedList` | ✅ |  |
| `Button` | ✅ |  |
| `Calendar` | ✅ | month / week / day / list |
| `CalloutCard` | ✅ |  |
| `Card` | ✅ |  |
| `CarouselLayout` | ✅ | paging swipe, dots, prev/next, auto-advance, loop |
| `Chart` | ✅ |  |
| `Chat` | ✅ | opens the assistant panel (same contract as the app chat FAB) |
| `Checklist` | ✅ |  |
| `CommentThread` | ✅ |  |
| `ComparisonCard` | ✅ |  |
| `ConfirmDialog` | ✅ |  |
| `ContentLayout` | ✅ | main / aside / footer; aside beside main ≥ 768 px, stacked on a phone |
| `CookieConsent` | ✅ | dismissible banner, dismissal persisted on the device |
| `Crud` | ✅ | table / list / cards / tree, smart-search panel, selection, totals, groups, inline edit, saved views |
| `DashboardLayout` | ✅ |  |
| `DashboardPanel` | ✅ |  |
| `Details` | ✅ | collapsible panel |
| `Dialog` | ✅ | overlay fragments open as a modal sheet |
| `Directory` | ✅ |  |
| `Drawer` | ✅ | overlay fragments open as a modal sheet; a Drawer in the tree is drawn in place |
| `EmptyState` | ✅ |  |
| `EntityHeader` | ✅ |  |
| `Faq` | ✅ |  |
| `FeatureGrid` | ✅ |  |
| `FileList` | ✅ |  |
| `FoldoutLayout` | ✅ | overview card + accordion of panels |
| `Form` | ✅ |  |
| `FormField` | ✅ | every stereotype, date picker, lookups, capture fields |
| `FormSection` | ✅ |  |
| `FormSubSection` | ✅ |  |
| `Funnel` | ✅ |  |
| `Gantt` | ✅ |  |
| `Grid` | ✅ | horizontal-scroll table, tree rows indented, action cells |
| `Heatmap` | ✅ |  |
| `HeroSection` | ✅ |  |
| `Image` | ✅ |  |
| `Kanban` | ✅ |  |
| `Ledger` | ✅ |  |
| `Map` | ✅ |  |
| `Markdown` | ✅ |  |
| `MasterDetailLayout` | ✅ | side by side ≥ 768 px, stacked on a phone |
| `MatrixGrid` | ✅ |  |
| `MenuBar` | ✅ | horizontal strip; submenus as an action sheet |
| `MessageInput` | ✅ |  |
| `MessageList` | ✅ |  |
| `Meter` | ✅ |  |
| `MetricCard` | ✅ |  |
| `MicroFrontend` | ✅ | own island (own session when it has its own baseUrl) |
| `NotFound` | ✅ |  |
| `Notice` | ✅ |  |
| `Notification` | ✅ | inline status strip |
| `OfferCard` | ✅ |  |
| `OrgChart` | ✅ |  |
| `Page` | ✅ | header (title, subtitle, badges, KPIs, toolbar, banners), FABs |
| `PaymentPicker` | ✅ |  |
| `PlanningBoard` | ✅ | drag + select (PanResponder) |
| `PricingTable` | ✅ |  |
| `ProcessMonitor` | ✅ |  |
| `ProgressBar` | ✅ |  |
| `ProgressSteps` | ✅ | vertical by design |
| `ResourceGrid` | ✅ |  |
| `ResponsiveGrid` | ✅ | declared tracks + col spans; stacks below stackBelow (600 px default) |
| `Result` | ✅ | icon by result type, links, next step |
| `Scoreboard` | ✅ |  |
| `Separator` | ✅ |  |
| `Skeleton` | ✅ |  |
| `SplitLayout` | ✅ |  |
| `Stat` | ✅ |  |
| `StatusList` | ✅ |  |
| `Stepper` | ✅ | children as numbered steps |
| `TabLayout` | ✅ |  |
| `TaskProgress` | ✅ |  |
| `TaskQueue` | ✅ |  |
| `Testimonials` | ✅ |  |
| `Text` | ✅ |  |
| `Timeline` | ✅ |  |
| `TrendChart` | ✅ |  |
| `VirtualList` | ✅ |  |
| `BoardLayout` | ✅ container |  |
| `Container` | ✅ container |  |
| `CustomField` | ✅ container | its component in place |
| `Div` | ✅ container |  |
| `FormItem` | ✅ container |  |
| `FormLayout` | ✅ container |  |
| `FormRow` | ✅ container |  |
| `FullWidth` | ✅ container |  |
| `HorizontalLayout` | ✅ container |  |
| `Scroller` | ✅ container |  |
| `VerticalLayout` | ✅ container |  |
| `Bpmn` | 🟡 | read-only diagram (react-native-svg, from the BPMN DI section); edit on the web |
| `ContextMenu` | 🟡 | long-press (no right-click on touch) opens an action sheet |
| `CustomComponent` | 🟡 | registry (registerCustomComponent) + visible placeholder |
| `DropZone` | 🟡 | "Move to…" picker (no drag on touch) |
| `Element` | 🟡 | HTML tags map to native text / image / rule, on.click runs its action; custom elements (web components) show their text content |
| `FormEditor` | 🟡 | read-only definition preview; edit on the web |
| `Icon` | 🟡 | emoji / glyphs and common icon names; other design-system icons show a dot |
| `Popover` | 🟡 | opens on press (no hover on touch) |
| `Tooltip` | 🟡 | long-press shows it (no hover on touch); also the accessibility hint |
| `Workflow` | 🟡 | read-only layered diagram; edit on the web |
| `AccordionPanel` | ✅ part | of AccordionLayout |
| `BoardLayoutItem` | ✅ part | of BoardLayout |
| `BoardLayoutRow` | ✅ part | of BoardLayout (items side by side ≥ 768 px) |
| `Breadcrumb` | ✅ part | of Breadcrumbs |
| `GridColumn` | ✅ part | of Grid / Crud |
| `Tab` | ✅ part | of TabLayout |
<!-- rn-coverage:end -->

### IntelliJ plugin component coverage

The IntelliJ plugin has a case for **every** wire component type in `ComponentMetadataDto` (115 as
of 2026-10-10). This is enforced, not just claimed: `WireTypeParityTest` reads the backend's
`@JsonSubTypes` list and fails the plugin build when a type has no branch in
`ui/ComponentRenderer.kt`, and `WireTypeRenderTest` renders each of them headlessly and checks for
exceptions, the "Unsupported component" fallback and accessible names on every control. The types
below were the last to arrive, so this is how each one maps to Swing:

| Wire type | IntelliJ rendering |
|---|---|
| `Grid` / `GridColumn` | `JBTable` over the page rows (read-only); a stray column shows its header |
| `VirtualList` | `JBList`, one line per row |
| `MasterDetailLayout` | `Splitter` (master / detail) |
| `CarouselLayout` | one slide at a time, ‹ › buttons and `n / total` |
| `BoardLayout` / `BoardLayoutRow` / `BoardLayoutItem` | rows stacked, equal-width columns |
| `ContentLayout` | `main-*` centre, `aside-*` start/end column (`asideWidth`), `footer-*` below |
| `ResponsiveGrid` | grid with the column count of `gridTemplateColumns` |
| `FormItem`, `Tab`, `AccordionPanel`, `Stepper` met outside their container | a row / titled group / stack of their children |
| `Breadcrumbs` / `Breadcrumb` | link trail, current item in bold |
| `MenuBar` | row of buttons; groups open a popup menu (submenus nest) |
| `ContextMenu` | the wrapped component with a popup (right click, or left click when asked) |
| `Directory` | sitemap of links under group headings |
| `Avatar` / `AvatarGroup` | round initials badge (name as tooltip and accessible name); `+N` overflow |
| `Icon` | the platform icon for known names, else the name |
| `Details` | disclosure toggle (▸/▾) over its content |
| `Tooltip` | tooltip + accessible description on the wrapped component |
| `Notification`, `Result`, `NotFound` | inline strip / outcome page with links / not-found page with a way back |
| `CookieConsent` | dismissible strip (the IDE has no cookies; dismissal lasts the session) |
| `Element` | the element as HTML text; an `on.click` runs its action |
| `Bpmn` | the process as an ordered list of its named flow nodes (start → tasks → end) |
| `Workflow`, `FormEditor` | their value, read-only and monospaced |
| `Chat`, `MessageList`, `MessageInput` | inline assistant (mateu-chat SSE, with the project's token), message list, input + Send (`{message}`) |
| `Dialog`, `Drawer` met inline | opened as the usual overlay window, once per id |
| `ConfirmDialog` | modal confirm / reject / cancel when `openedCondition` holds |
| `MicroFrontend` | an embedded island with its own context; another origin gets its own session **without** the project's token |

Since 2026-07-12 (DS-native rule) the non-Vaadin web renderers render crud layouts
(table/list/cards/masterDetail/tree), toolbar buttons and grid-stereotype form fields with their
OWN design-system components, and since 2026-07-16 the shells render the app header actions
(plain buttons + dropdown groups) with their own widgets too.

MessageList/MessageInput (Vaadin): as of 2026-07-10 these carry a real data model
(`List<MessageListItem>` / an `actionId` that fires on submit) — they were previously stubs that
rendered hardcoded demo data.

**Retired renderers (2026-08-12 reconciliation).** SAP UI5, Redwood-OJ (OJET), Red Hat/PatternFly
and SLDS were **retired**, and their `apps/sapui5`, `apps/redhat` and `apps/slds` directories have
since been deleted. They had a column here long after they stopped
existing — which is the worst failure mode for this page, since a matrix that promises a renderer
nobody can use is worse than one that admits a gap. **The supported web renderers are Vaadin and the
Redwood/VB line.**

`frontend/app/vscode-extension` is **not** a renderer: it hosts the visual editor (the same web
bundle the IntelliJ JCEF host runs), so it belongs with the tooling, not in this table.

**Authoring tooling.** The IntelliJ plugin (renderer, visual editor, specs/ui schema validation,
binding checks, **New | Mateu** file templates, per-project settings with bearer/OIDC
authentication) and the VS Code extension (the same visual editor bundle, `yamlValidation` for
`specs/ui/**`, **Mateu: New File…** with the same skeletons) are supported tooling. The Figma
design-to-code pipeline remains *preview*: it is not covered by the support promise above.

**Fetch-plan edges (known renderer gaps).** The client-side fetch plan (`optionsSource`,
`rowsSource`, `restAction`, `restData` — see [the renderer contract](/design-systems/renderer-contract/))
is honoured with two edges:

- **Multi-value `optionsSource`.** Vaadin resolves `optionsSource` on a single-select field (the
  common reference case — a record pointing at one other entity). A **multi-value** field
  (`multiSelect`/`listBox`/`combobox` — a record pointing at *many*) reads static `options` or a
  remote `search-<field>` action, not `optionsSource`; a one-to-many reference to an external
  catalogue is not wired yet. It spans three widget branches and is deliberately deferred rather
  than half-wired.
- **VB/Redwood REST sources.** The Redwood/VB line resolves REST sources **by ref natively** and does
  not consume the shared catalogue the way the Vaadin/native renderers do — by design for now (its
  transport shares no core with the web renderers).

Update this page whenever parity moves — it is referenced from the language manuals and the
[Rosetta](/reference/language-rosetta/).

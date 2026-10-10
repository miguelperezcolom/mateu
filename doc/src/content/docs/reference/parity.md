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
| [App shell as data](/java-ui-definition/yaml-app-shell/) (`type: AppShell` definition bound to a mount route) with its FLOWS — `actions:` with `steps:` that a menu `RuleLink` (`RunAction` rule) runs client-side, no round-trip — plus `widgets:` and the header switches `themeToggle`/`commandCenter`/`chromeless`/`accessKeys`. Code-built shells carry the same (`AppShell.builder().action(...)`). The ports have no `type: AppShell` definitions: N/A there | ✅ | N/A | N/A |
| Wizards (incl. branching, cross-step state, `@WizardProgress` BAR/STEPS/RAIL) | ✅ | ✅ | ✅ |
| CRUD create/edit in a drawer (`editInDrawer` — save closes + refreshes the listing in place) | ✅ | ✅ | ✅ |
| Collection-detail / general-overview archetypes (`CollectionDetail<Row>`, `GeneralOverview<Row>`) + fluent `FormField` | ✅ | ✅ | ✅ |
| Guided import wizard (`ImportWizard<Row>`: CSV upload/paste, auto-mapping grid, validation report, typed import) | ✅ | ✅ | ✅ |
| Page decorations (subtitle, banners, badges, KPIs, FABs) | ✅ | ✅ | ✅ |
| Header overline + title placeholder (`@Overline`/`@TitlePlaceholder`; Java also has `OverlineSupplier`/`TitlePlaceholderSupplier`, the ports carry only the declarative form — same as `@Subtitle`) | ✅ | ✅ | ✅ |
| Tabs, stereotypes, shortcuts, compact, dirty guard | ✅ | ✅ | ✅ |
| Redwood pattern gaps (2026-10-10): display records (`Toggle` + `WizardDisplay`/`CrudDisplay`/`GeneralOverviewDisplay`), wizard drafts/skip/early completion/`beforeStepNavigate` (ports: steps by number), edit-drawer save-and-next + error banner, `GeneralOverview` info slot, foldout `summary`, `DataManagement` docked panels, header `RecordSwitcherSupplier`, `@Section` edit/add/view-more, hero tone, `Announce` command, smart-search pre-search content — see [Page templates](/ux-patterns/page-templates/#display-options-one-tri-state-grammar) | ✅ | ✅ | ✅ |
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
| Row tones (`@RowStatus` → `CrudlDto.rowStatusField`) and listing export buttons on `AutoCrud` | ✅ | ✅ `[RowStatus]` + Export CSV / Excel / PDF (`CsvExportable`/`ExcelExportable`/`PdfExportable` on `Crud<T>`, `Listing<F,R>` or any `ICrudExports` listing; built-in dependency-free writers, pluggable `ICsvExporter`/`IExcelExporter`/`IPdfExporter`) | ✅ `RowStatus()` + Export CSV / Excel / PDF (`csv_exportable()` / `excel_exportable()` / `pdf_exportable()`; openpyxl MIT and reportlab BSD, the `export` extra — a format whose library is missing is not offered, as Java shows a button only with an exporter bean) |
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
| — Proxy mode for views with no annotation to read (`RestSourceSupplier`: a view assembled at runtime declares its sources programmatically, and they gate `__restfetch__` and resolve a proxy fetch exactly as annotations do) | ✅ | ✅ | ✅ |
| [REST source catalogue](/java-ui-definition/rest-source-catalogue/) (`specs/ui/sources.yaml` + `@RestSource`/`RestSourceCatalogSupplier` → a named endpoint referenced by `ref`; two producers, authored wins). Java and .NET carry the registry (catalogue reader + `ref` resolution + `AppDto.restSources`); Python carries it too (`@rest_source` / `RestSourceCatalogSupplier` / `sources.yaml`, `AppMetadata.restSources`, refs resolved server-side for proxy fetches) | ✅ | ✅ | ✅ |
| [Action catalogue](/java-ui-definition/action-catalogue/) (`specs/ui/actions.yaml` + any `type: Actions` file + `ActionCatalogSupplier` → named client-runnable actions — flows / `restAction` — run by id from the shell menu or any page; two producers, authored wins; owner first, then the catalogue, then the server; non-runnable entries rejected with a warning). `AppDto.actionCatalogue` lowered on all three; a page carries the entries its tree names. .NET (`IActionCatalogSupplier`) and Python (`ActionCatalogSupplier`) have no YAML shell/page `actions:`, so "owner" there is the view's methods; no bundle exporter in the ports | ✅ | ✅ | ✅ |
| [Business components](/java-ui-definition/component-catalogue/) (`specs/ui/components.yaml` + `@BusinessComponent`/`ComponentCatalogSupplier` + `ComponentRef` → a named, BOUND composition of existing pieces referenced by name; ports for free, resolves with no backend). Same two-producers/authored-wins registry as the source catalogue; .NET and Python carry it too (`ComponentRef` expanded server-side, `AppDto.components`; Python `@business_component` / `fluent.ComponentRef`) | ✅ | ✅ | ✅ |
| [Custom components](/java-ui-definition/custom-components/) (`CustomComponent(name, props, content)` — a genuinely NEW rendering as data; the per-renderer escape hatch). The WIRE is data and identical across backends; the RENDERING is per-renderer (`registerCustomComponent`, degrading to `<mateu-unsupported>`) | ✅ | ✅ | ✅ |
| Sizing intent (`hug`/`fill`/`fixed:<len>` as portable data on the component; a listing infers `fill`) | ✅ | ✅ | ✅ |
| Editable grids / inline CRUD editing (`@InlineEditing` + update-row) | ✅ | ✅ | ✅ |
| Bulk list actions (`@ListToolbarButton` + typed selection) | ✅ | ✅ | ✅ |
| Listing aggregates & grouping (`@Aggregate`/`@GroupBy` + summaries) | ✅ | ✅ | ✅ |
| Group header actions (`@GroupAction` buttons on group rows, `_groupValue` parameter; Python `@group_action` + `GroupActionVisibility`) | ✅ | ✅ | ✅ |
| Group summaries synthesized for custom `Listing`s (`ListingData.withSynthesizedGroups`) | ✅ | ✅ | ✅ |
| Optimistic locking (`@Version` → conflict dialog on save/update-row, `_forceOverwrite`) | ✅ | ✅ | ✅ |
| Notification inbox (`NotificationsSupplier` → header bell + `_notifications-*` actions) | ✅ | ✅ | ✅ |
| Undoable toasts (`Message.undoable` → undo action id + parameters on the wire) | ✅ | ✅ | ✅ |
| Global entity search (`GlobalSearchSupplier` → `globalSearchEnabled` + `_globalsearch`) | ✅ | ✅ | ✅ |
| Dialog/Drawer overlays from actions + `closeModal`/`dispatchEvent` | ✅ | ✅ | ✅ |
| Structure ETag / template-ref (`structureHash` + request `knownStructureHash` → omit the component when unchanged) | ✅ | ✅ | ✅ |
| ModelView bindable contract (`__contract__` sync action → fields + actions on `appData._contract`, for the visual-builder tooling) | ✅ | ✅ | ✅ |
| Visual-builder live preview (`__preview__` sync action → renders arbitrary YAML page text; the plugin's preview pane) | ✅ | ✅ | ✅ |
| [`layoutDelta:`](/java-ui-definition/yaml-ui-definition/) (what a human changed about the INFERRED layout, anchored to field ids and re-applied every request, so a screen touched in the visual editor keeps following its model). The editor writes it and falls back to a `layout:` snapshot — visibly — when an edit cannot be a delta. Java, .NET and Python apply it (same three rules) | ✅ | ✅ | ✅ |
| [Partials](/java-ui-definition/partials/) (`specs/ui/partials/<ref>.yaml`; spliced into the parent's content, resolved server-side so they never reach the wire). All three splice, stack where there is no list, drop a missing ref and break a cycle; only Java resolves a `ref` that names a class | ✅ | ✅ | ✅ |
| YAML pages bound to a ModelView (`specs/ui/<route>.yaml` with `modelView:` → the file supplies the layout, the class supplies state + actions; on the classpath in Java, under the cwd — `MATEU_SPECS_DIR` — in the ports) | ✅ | ✅ | ✅ |
| Static-view skip (`@StaticView`/`[StaticView]`/`@static_view` → `staticView` flag; client caches the full response for the session and skips the round-trip on return) | ✅ | ✅ | ✅ |
| Sticky sections index (`@Toc`) | ✅ | ✅ | ✅ |
| Client-side rules (`@Hidden(expr)`/`@Disabled`/rule supplier) | ✅ | ✅ | ✅ |
| Grid form fields + `@OnRowSelected` row-click actions (incl. add/create/select on plain forms outside wizards) | ✅ | ✅ | ✅ |
| Wide-field auto-colspan (grid/textarea/richText span the full row of a multi-column section) | ✅ | ✅ | ✅ |
| Inline-editing grid "+" appends an in-place row (the detail-form response targets a container inline grids never render) | ✅ | ✅ | ✅ |
| Multi-state embedded islands (`@Inline` orchestrator fields, host-seeded initialData; Python: a field holding a routed view + `Inline()`) | ✅ | ✅ | ✅ |
| Multi-column layouts (`@Zones`, `@FoldedLayout`) | ✅ | ✅ | ✅ |
| AI chat (`@AI`/`[AI]`/`@ai` → `sseUrl`; the SSE endpoint is developer-provided) | ✅ | ✅ | ✅ |
| Semantic (composed) annotations | ✅ | ✅ | ✅ (an `Annotated` alias) |
| Federation (remote menus + `MicroFrontend` islands) | ✅ | ✅ | ✅ |
| Component adapters | ✅ | ✅ `IComponentAdapter<T>` SPI | ✅ (`ComponentAdapter` + `AdaptedView`) |
| Hero search archetype | ✅ | ✅ | ✅ |

Import wizard on .NET/Python: same step flow (upload/paste → auto-mapped column grid with a
select-editable target-field cell → per-line validation report → typed import + result counts)
and the same CSV semantics (`,`/`;` autodetect, RFC-4180-ish quoting, data-URI uploads), on the
ports' `[Step(n)]` wizard machinery, and both ports now have the full flow (2026-10-10). On .NET the
validation step's forward button is the **Import** completion action, the result step is final (no
navigation, a re-sent back/next cannot import twice), steps are named Upload / Mapping / Validation /
Result, the heading defaults to `Import <Row>` and `TimeOnly`/`DateTimeOffset`/`Guid` columns
convert; its validation surface is DataAnnotations (`[Required]`, `[Range]`…). On Python the import
is the wizard's completion action (`@wizard_completion_action("Import")`, Java's `doImport`, then a
read-only result step) and its report checks `Required()`, `Min`/`Max`/`Size`/`Pattern` — the same
constraints that travel as client-side `validations` and are re-checked when a form is saved.

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

### What the ports closed (2026-10-10)

Both ports closed every server row above on 2026-10-10, each pinned by its own tests and the
wire by the hard conformance gate:

- **.NET**: `IRestSourceSupplier` proxy sources, the source and component catalogues,
  `layoutDelta:`, group actions and synthesized group summaries, wide-field auto-colspan, the
  inline-grid "+" row and the whole grid-field row editor, multi-state embedded islands, the
  `IComponentAdapter<T>` SPI, Excel/PDF exports and the import wizard's completion action.
- **Python**: the same list (`RestSourceSupplier`, `@rest_source`/`sources.yaml`,
  `@business_component`/`ComponentRef`, `layoutDelta:`, `@group_action`, the grid row editor,
  embedded islands, `ComponentAdapter`, Excel/PDF exports, `@wizard_completion_action`), plus
  `Min`/`Max`/`Size`/`Pattern` validation and class- and method-level `@eyes_only`.

Proxy mode for views assembled at runtime stays the SSRF-sensitive path on every server: the
endpoint is taken from what the server holds (the view's own declarations), never from the request.

The shared wire-conformance corpus is a HARD gate on Python: every case must match the Java golden
except an explicit, strictly-xfailed allow-list whose every entry is a defect of the golden itself
(today one: `dashboard`, whose Java golden advertises list-row actions for the fields of a `Text`
component).

## Renderers

Every renderer speaks the same wire; the depth of widget support varies.

| Feature | Vaadin (web) | Redwood (web) | IntelliJ plugin | React Native |
|---|---|---|---|---|
| Forms, CRUD, navigation | ✅ | ✅ | ✅ | ✅ |
| Redwood pattern gaps (2026-10-10): header record/context switcher, `Announce`, hero tone, foldout `summary-N`, crud `preSearch`, a `Drawer` re-sent with an open drawer's id refreshing in place | ✅ shared DS-neutral elements | ✅ oj-sp header data switcher, `dark-<tone>` banner, `oj-sp-foldout-panel` summary slot | ✅ combo + speed search | ✅ bottom-sheet switcher |
| Smart-search filter bar (chips, ranges, multi-select) | ✅ | ✅ | ✅ (native panel) | ✅ panel (ranges, multi-select, date pickers) |
| Sorting, cards/list/tree layouts, empty states | ✅ | ✅ | ✅ (tree = JTree; cards/list adapt to the table) | ✅ |
| Inline editing (@InlineEditing, update-row) | ✅ | ✅ | ✅ (row form) | ✅ (row form) |
| Date picker | ✅ | ✅ | ✅ (calendar popup) | ✅ (own calendar) |
| Remote lookup select (@Lookup / searchable) | ✅ | ✅ | ✅ | ✅ |
| Full field-stereotype set (radio, multiSelect, slider, stepper, stars, color, image upload, money, markdown…) | ✅ | ✅ radio, multi-select, checkboxes, toggle, number/money (`oj-input-number`), textarea, dates, lookups, file/image/signature/photo, slider (`oj-slider`), stars (`oj-rating-gauge`), color, rich text (own editor: HTML, legacy Quill Delta read), markdown/html read-only | ✅ | ✅ |
| Client-side rules (visible/disabled/state) + \${...} interpolation | ✅ | ✅ CSP-safe engine (visible/disabled/required/value + `OnValueChange`) on every surface: the page, embedded islands and the open drawer/dialog | ✅ (shared engine) | ✅ (no-eval engine) |
| Page banners (@Banner + action-returned) | ✅ | ✅ | ✅ | ✅ |
| FABs, header badges, KPIs, charts | ✅ | ✅ header badges, KPIs, `MetricCard`/`Scoreboard` tiles and charts on any page (`oj-chart`: bar, line, area, pie, doughnut, polar, funnel, several series); page and app `@Fab`s stacked above the shell FAB | ✅ (FABs as header buttons) | ✅ |
| @AutoSave / @SubscribeTo scopes / @OnRowSelected | ✅ | ✅ | ✅ | ✅ |
| Periodic refresh (`OnLoad` with `timeoutMillis` + `OnSuccess` loop, `background`) | ✅ | ✅ (stops when the screen changes) | ✅ (stops when the view changes or its tab closes) | ✅ (stops when the screen changes or unmounts) |
| Keyboard shortcuts (`@Action(shortcut)`, `@Tab(shortcut)`) + access keys mode (`@App(accessKeys)`: hold Alt, Alt+letter) | ✅ | ✅ | ✅ (Swing mnemonics) | — (no hardware-key model) |
| Hover details (`Popover` with `trigger = hover`, `@Tooltip("otherField")` on listing cells) | ✅ | ✅ (shared `oj-popup`) | ✅ | 🟡 press / long-press (no hover on touch) |
| Drag rows to a destination (`@DragRows` + `DropZone`: origin and destination in one action) | ✅ | ✅ (`oj-table` dnd) | ✅ | 🟡 "Move to…" picker (no drag on touch) |
| AI chat (sseUrl) / theme toggle | ✅ | ✅ AI chat at parity with the web panel (header button + left drawer: streaming, agent progress and tool steps, token usage, markdown answers with in-app links, screen context + projection, `mcpUrl`, `@AI(upload)` attachments, local agent, dictation, wide mode, `render-screen`/navigation events); `@App(themeToggle)` draws a header light/dark switch (JET's inverted colour scheme, remembered like the web) | ✅ chat (theme = the IDE's own) | ✅ |
| App context selector | ✅ | ✅ | ✅ (navigator combos) | ✅ |
| — searchable picker w/ remote search | ✅ | ✅ | 🟡 loaded options only | ✅ |
| Signature capture | ✅ canvas | ✅ canvas (own element: JET has no signature pad) | ✅ mouse canvas | ✅ svg + view-shot |
| Photo capture | ✅ getUserMedia | ✅ | 🟡 file picker (no desktop camera API) | ✅ expo-camera |
| Tree select dropdown | ✅ | ✅ | ✅ (JTree popup) | ✅ |
| Tree lookup selector (dialog) | ✅ | ✅ | ✅ (tree layout) | ✅ (tree layout) |
| Dashboards, Gantt, foldouts, skeletons | ✅ | ✅ foldouts (`oj-sp-foldout-layout`, collapsible panels inside a tab), dashboards (KPI band, tiles by `colSpan`, `oj-chart`), `Gantt` and `PlanningBoard` on `oj-gantt`, `Skeleton` | ✅ | ✅ |
| Custom components (`registerCustomComponent`; unknown → visible placeholder) — the per-renderer escape hatch, each renderer with its own registry + graceful degradation (placeholder + slotted children) | ✅ | ✅ registry (`bridge.registerCustomComponent(name, mount)`) + placeholder and slotted children | 🟡 registry + placeholder | 🟡 registry + placeholder |
| High-level UX components (Kanban, Timeline, Stat, Calendar… + the front-office set) | ✅ | ✅ every type — Oracle components where they exist (oj-chart funnel, oj-avatar, oj-action-card, oj-rating-gauge, oj-checkboxset, oj-menu-button, oj-collapsible, oj-dialog…), Redwood-token atoms where JET has none (board, timeline, heatmap, org outline, BPMN); see the coverage table below | ✅ | ✅ |
| App header actions (buttons + dropdown groups) | ✅ | ✅ | — (sidebar shell, no top bar) | — (drawer shell, no top bar) |
| Bulk row selection + selection-required toolbar actions | ✅ | ✅ | ✅ (native multi-select) | ✅ (checkbox column) |
| Saved views (named filter sets, default view) | ✅ | ✅ | ✅ (Views menu: apply/save/default/delete, persisted) | 🟡 apply/save/default/delete (session-scoped) |
| Column chooser (per-user show/hide/reorder) | ✅ | ✅ | ✅ (header menu show/hide + native drag-reorder, persisted) | 🟡 show/hide (session-scoped; no AsyncStorage dep) |
| Listing totals footer + group subtotal rows | ✅ | ✅ | ✅ | ✅ |
| Notification bell (inbox, unread count) | ✅ | ✅ (header bell + `oj-popup` with an `oj-list-view`) | ✅ (sidebar popup) | ✅ (drawer row) |
| Undoable toasts (Undo button) | ✅ | ✅ (JET `oj-message` with the Undo `oj-button` in its detail slot — `oj-sp-messages-toast` has no actions) | ✅ (balloon action) | ✅ (toast button) |
| Entity search (GlobalSearchSupplier: ⌘K palette / search box) | ✅ palette | ✅ the Ask palette: destinations + GlobalSearchSupplier entity results by category | ✅ sidebar search | ✅ drawer search |
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
render shows a visible "Unsupported component" placeholder (its children, if it is a container, still
render), so this table — not the feature rows above — is the authority on what Redwood paints.

<!-- redwood-coverage:start -->
Generated from `frontend/web/monorepo/apps/redwood/poc/coverage.mjs` and checked in CI against the
wire catalogue and the renderer's code (`node poc/parity-check.mjs`): 95 rendered, 11 layout
containers, 2 partial, 0 not rendered. A type the renderer does not know
(one added to the wire later) shows a visible "Unsupported component" placeholder, like the web
renderers, and its children still render.

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
| `Bpmn` | ✅ | an SVG drawn from its BPMN-DI (or laid out by its flows): bpmn-js is not under a permissive licence |
| `Breadcrumbs` | ✅ | a breadcrumb nav in the content (the shell keeps its own trail) |
| `BulletedList` | ✅ |  |
| `Button` | ✅ | oj-button |
| `Calendar` | ✅ | month, week, day and list views (JET has no calendar: a Redwood-token grid, oj-buttonset-one switcher), per-date cells, clickable dates |
| `CalloutCard` | ✅ | oj-panel band with its theme, icon and CTA oj-button |
| `Card` | ✅ | oj-panel |
| `CarouselLayout` | ✅ | an image gallery is an oj-film-strip; other slides one at a time with a ‹ › pager and dots (client-side) |
| `Chart` | ✅ | oj-chart: bar, line, pie, doughnut, radar/polar area, scatter; several series |
| `Chat` | ✅ | an inline conversation streamed from its sseUrl (poc/chat.mjs); the app-level assistant is the shell panel |
| `Checklist` | ✅ | oj-checkboxset per item (sends {_item, _done}) + oj-progress-bar |
| `CommentThread` | ✅ | replies indented under their comment, oj-avatar per author |
| `ComparisonCard` | ✅ | oj-panel: both values and the delta with its trend |
| `ConfirmDialog` | ✅ | oj-dialog, open while its openedCondition holds; Confirm / Reject / Cancel send their actions |
| `ContextMenu` | ✅ | its content, then an oj-menu-button with the menu; a right click on the content opens it too |
| `CookieConsent` | ✅ | a band fixed to the top/bottom; hidden once its cookie exists, dismissing sets it |
| `Crud` | ✅ | oj-table + smart search; groups, totals, tones, columns, saved views, export |
| `CustomComponent` | ✅ | a registry the app fills (bridge.registerCustomComponent); without a view, a visible placeholder + its children — same contract as the web |
| `DashboardLayout` | ✅ | oj-flex columns, each panel its colSpan |
| `DashboardPanel` | ✅ | oj-panel tile (title, subtitle, content) |
| `Details` | ✅ | oj-collapsible (client-side state) |
| `Dialog` | ✅ | oj-dialog (overlay stack) |
| `Directory` | ✅ | a column per group with its links (in-app routes navigate inside the shell) |
| `Drawer` | ✅ | oj-drawer-popup (overlay stack), subtitle, footer actions |
| `DropZone` | ✅ | drop target for @DragRows listing rows (oj-table dnd); its content as text lines |
| `Element` | ✅ | third-party web component, events wired back |
| `EmptyState` | ✅ | oj-sp-empty-state: the page-level one, and any other in the content with its call to action |
| `EntityHeader` | ✅ | projected to the page header (sticky business card) |
| `Faq` | ✅ | oj-collapsible per question (client-side state), the answer as Markdown |
| `FeatureGrid` | ✅ | oj-panel / oj-action-card tiles on an oj-flex grid of its columns |
| `FileList` | ✅ | a row per file: icon by type, download link, size · type, its action |
| `FoldoutLayout` | ✅ | oj-sp-foldout-layout; inside a tab, collapsible panels |
| `Form` | ✅ | oj-form-layout |
| `FormField` | ✅ | oj-input-*, oj-select-*, oj-radioset, oj-checkboxset, oj-input-number, capture fields |
| `FormLayout` | ✅ | oj-form-layout |
| `Funnel` | ✅ | oj-chart type funnel |
| `Gantt` | ✅ | oj-gantt: a row per task, progress fill, task click → onTaskSelectionActionId |
| `Grid` | ✅ | oj-table (list display): tree rows with disclosure, client-side paging by its size |
| `Heatmap` | ✅ | JET has none: a calendar heatmap (a column per week), 4 levels + legend, values on hover |
| `HeroSection` | ✅ | the Welcome archetype: oj-sp-header-welcome-banner; in the content, a hero band (title, subtitle, background image) over its children |
| `HorizontalLayout` | ✅ | oj-flex row |
| `Icon` | ✅ | the Redwood icon font (oj-ux-ico-*), an emoji as text |
| `Image` | ✅ | JET has no image component: an <img>; relative sources are served by the backend |
| `Kanban` | ✅ | JET has no board: oj-panel columns, cards as oj-action-card when they act (_clickedCard) |
| `Ledger` | ✅ |  |
| `Map` | ✅ | Leaflet + OSM tiles (JET has no street map): markers, fit, markerActionId |
| `Markdown` | ✅ | formatted (headings, lists, quotes, code, tables, bold, italics, links, allowed inline HTML) as allowlist-sanitized HTML |
| `MasterDetailLayout` | ✅ | list + detail panes |
| `MatrixGrid` | ✅ | oj-data-grid |
| `MenuBar` | ✅ | oj-buttons, links and oj-menu-buttons for submenus |
| `MessageInput` | ✅ | oj-input-text + Send oj-button; Enter or Send sends {message} |
| `MessageList` | ✅ | oj-avatar + name, time and text per message |
| `Meter` | ✅ | oj-progress-bar |
| `MetricCard` | ✅ | KPI tile: value, trend, drill-in action |
| `MicroFrontend` | ✅ | loaded from its baseUrl into a surface of its own and painted in place; its actions go back to it |
| `NotFound` | ✅ |  |
| `Notice` | ✅ | oj-sp-message-banner style band + actions |
| `Notification` | ✅ | an info band (title — text); action messages show as toasts |
| `OfferCard` | ✅ |  |
| `OrgChart` | ✅ | the tree as an indented outline (VB templates cannot recurse) with oj-avatar; nodes with an action are oj-action-cards (_clickedNode) |
| `Page` | ✅ | oj-sp header (title, subtitle, KPIs, toolbar, banners) |
| `PaymentPicker` | ✅ |  |
| `PlanningBoard` | ✅ | oj-gantt (move, resize, double click, range selection) |
| `Popover` | ✅ | trigger + the content WITH its structure (headings, lists, links, badges, markdown) as sanitised HTML in a shared oj-popup (hover/focus or click) |
| `PricingTable` | ✅ | oj-panel plans (the featured one highlighted), CTA oj-button |
| `ProcessMonitor` | ✅ | a row per process: systems, ok/warning/error badges, status, action |
| `ProgressBar` | ✅ | oj-progress-bar (value or the state at valueKey, indeterminate); a wizard shows its progress as the guided process |
| `ProgressSteps` | ✅ | oj-train |
| `ResourceGrid` | ✅ |  |
| `ResponsiveGrid` | ✅ | fixed tracks → oj-flex columns by their fr weights and spans; auto-fill/auto-fit → as many per row as fit at each breakpoint; reorderable tiles drag (and Alt+←/→) |
| `Result` | ✅ | oj-panel with the icon of its type, message, links and the what-next action |
| `Scoreboard` | ✅ | KPI band |
| `Separator` | ✅ |  |
| `Skeleton` | ✅ | the shell skeleton bones (JET has no skeleton), text/card/grid/form × count |
| `SplitLayout` | ✅ | two panes |
| `Stat` | ✅ |  |
| `StatusList` | ✅ |  |
| `Stepper` | ✅ | a numbered step header per child, its content below |
| `TabLayout` | ✅ | oj-tab-bar (nested strips flattened) |
| `TaskProgress` | ✅ |  |
| `TaskQueue` | ✅ |  |
| `Testimonials` | ✅ | oj-panel quotes, oj-avatar, oj-rating-gauge (read only) |
| `Text` | ✅ |  |
| `Timeline` | ✅ | oj-timeline is deprecated: a Redwood list with markers, items with an action as borderless oj-buttons (_clickedItem) |
| `Tooltip` | ✅ | the wrapped component keeps its view; the text opens in the shared oj-popup on hover/focus (on the button itself, or an info marker) |
| `TrendChart` | ✅ | oj-chart line/area |
| `VirtualList` | ✅ | every item through the same projection (no windowing — neither has the neutral web renderer) |
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
| `FormEditor` | 🟡 | read only: the defined form previewed with the real field widgets; the web designer edits it |
| `Workflow` | 🟡 | read only: the definition as a numbered flow of steps; the web designer edits it |
| `AccordionPanel` | ↳ | of AccordionLayout |
| `BoardLayoutItem` | ↳ | of BoardLayout |
| `BoardLayoutRow` | ↳ | of BoardLayout |
| `Breadcrumb` | ↳ | of Breadcrumbs |
| `FormRow` | ↳ | of FormLayout |
| `GridColumn` | ↳ | of Grid / Crud |
| `Tab` | ↳ | of TabLayout |
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

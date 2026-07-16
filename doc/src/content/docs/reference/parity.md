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
| Wizards (incl. branching, cross-step state, `@WizardProgress` steppers) | ✅ | ✅ | ✅ |
| Page decorations (subtitle, banners, badges, KPIs, FABs) | ✅ | ✅ | ✅ |
| Tabs, stereotypes, shortcuts, compact, dirty guard | ✅ | ✅ | ✅ |
| Adaptive layout inference (radios, folding, tabs) | ✅ | ✅ | ✅ |
| Nav links (`@LinkTo` / link supplier) | ✅ | ✅ | ✅ |
| Dashboard / Foldout / Welcome / ItemOverview archetypes | ✅ | ✅ | ✅ |
| UX components (MetricCard, Gantt, EmptyState, Skeleton…) | ✅ | ✅ | ✅ |
| High-level UX components (Kanban, Timeline, Stat, Calendar, PricingTable, OrgChart, Heatmap, Funnel, TrendChart, FeatureGrid, Testimonials, Faq, CalloutCard, CommentThread, FileList, ComparisonCard, Checklist, ProgressSteps) | ✅ | ✅ | ✅ |
| Front-office components (EntityHeader, Meter, TaskProgress, StatusList, TaskQueue, ResourceGrid, OfferCard incl. toggle state, AddOnPicker, Ledger, PaymentPicker, ProcessMonitor, Notice incl. status/noIcon/content, BulletedList) | ✅ | ✅ | ✅ |
| Section polish (`@SeparatorBefore`, text sizes, `@Section(propertyList/frameless)`, responsive zones) | ✅ | ✅ | ✅ |
| `Anchor` (external links, `target` + rel=noopener) | ✅ | ✅ | ✅ |
| i18n, events (emit/subscribe), security scaffolding | ✅ | ✅ | ✅ |
| Application context selector (`@AppContext`) | ✅ | ✅ | ✅ |
| App header actions (`AppActionsSupplier` → buttons + dropdown groups) | ✅ | ✅ | ✅ |
| `@Audience` persona projection (audience app-context + projection filter) | ✅ | ✅ | ✅ |
| Capture fields (`@Signature`, `@PhotoCapture`) | ✅ | ✅ | ✅ |
| Tree selects (`@TreeSelect` + hierarchical options) | ✅ | ✅ | ✅ |
| Smart-search listing filters (enums as multi-select, date/number ranges) | ✅ | ✅ | ✅ |
| Declarative listings (`Listing<Filters, Row>`) | ✅ | ✅ | ✅ |
| — typed `DateRange`/`NumberRange`/`Set` filter fields | ✅ | ✅ | ✅ |
| — DB pushdown (override `find`: one query, real total, in-memory pipeline skipped) | ✅ | ✅ | ✅ |
| Tree lookup selectors (`GridLayout.tree` + `Selector`) | ✅ | ✅ | ✅ |
| Lookup fields (`@Lookup` remote combobox + `search-<field>` action) | ✅ | ✅ | ✅ |
| — `@Searchable` full selector dialogs (`Selector` + `codesearch`) | ✅ | ✅ | ✅ |
| Editable grids / inline CRUD editing (`@InlineEditing` + update-row) | ✅ | ✅ | ✅ |
| Dialog/Drawer overlays from actions + `closeModal`/`dispatchEvent` | ✅ | ✅ | ✅ |
| Sticky sections index (`@Toc`) | ✅ | ✅ | ✅ |
| Client-side rules (`@Hidden(expr)`/`@Disabled`/rule supplier) | ✅ | ✅ | ✅ |
| Grid form fields + `@OnRowSelected` row-click actions (incl. add/create/select on plain forms outside wizards) | ✅ | ✅ | ✅ |
| Wide-field auto-colspan (grid/textarea/richText span the full row of a multi-column section) | ✅ | — | — |
| Inline-editing grid "+" appends an in-place row (the detail-form response targets a container inline grids never render) | ✅ | — | — |
| Multi-state embedded islands (`@Inline` orchestrator fields, host-seeded initialData) | ✅ | — | — |
| Multi-column layouts (`@Zones`, `@FoldedLayout`) | ✅ | ✅ | ✅ |
| AI chat (`@AI`/`[AI]`/`@ai` → `sseUrl`; the SSE endpoint is developer-provided) | ✅ | ✅ | ✅ |
| Semantic (composed) annotations | ✅ | ✅ | ✅ (an `Annotated` alias) |
| Federation (remote menus + `MicroFrontend` islands) | ✅ | ✅ | ✅ |
| Component adapters | ✅ | 🟡 wrapper idiom | 🟡 wrapper idiom |
| Hero search archetype | ✅ | ✅ | ✅ |

Smart-search filters on .NET/Python: the Crud entity's fields become the same filter widgets
(enums → multi-select IN, temporals → date ranges, `[RangeFilter]`/`RangeFilter()` numerics →
min–max), applied in-memory over `Fetch()` by default — same as Java's default repository — or
pushed to the database by overriding `Find`/`find` (the filters arrive as the raw component state
rather than Java's typed `FilterCriterion` objects; a contract difference, not a capability gap).

**Recent .NET/Python parity gains (2026-07-11)**: inline CRUD editing
(`[InlineEditing]`/`@inline_editing` — editable columns with typed in-place editors +
the update-row action rebuilding and saving the row), lookup fields (`[Lookup]`/`Lookup()` →
combobox + remoteCoordinates, the handler answers `search-<field>` from the options supplier,
filtered and paged), Dialog/Drawer overlays returned from actions (Add fragments on the initiator,
with `CloseModal`/`DispatchEvent` command factories carrying `{eventName, detail}`), `[Toc]`/`@toc`,
the full HeroSearch archetype (hero header + cards listing, starts empty), client-side rules
(`[Hidden(expr)]`/`[Disabled]` + `IRuleSupplier`/`RuleSupplier` → `ServerSideComponent.rules`),
grid form fields (list-of-rows properties → dataType `array` + stereotype `grid` + columns) with
`[OnRowSelected]`/`OnRowSelected()` injecting the clicked row into the handler method, and the
`[Zone]`/`@zones` + `[FoldedLayout]`/`@folded_layout` multi-column layouts. Earlier (2026-07-10):
CRUD search sorts and paginates; actions can return page banners, a `/route` or a UICommand.
Declarative listings (`Listing<Filters, Row>` / `Listing[F, R]`) landed the same day with the
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
`<fieldId>-label` fragment data), grid form fields edit in place (`@InlineEditing` on the
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

## Renderers

Every renderer speaks the same wire; the depth of widget support varies.

| Feature | Vaadin (web) | Redwood (web) | SAP UI5 / PatternFly (web) | IntelliJ plugin | React Native |
|---|---|---|---|---|---|
| Forms, CRUD, navigation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Smart-search filter bar (chips, ranges, multi-select) | ✅ | ✅ | ✅ (shared bar) | ✅ (native panel) | ✅ panel (ranges, multi-select, date pickers) |
| Sorting, cards/list/tree layouts, empty states | ✅ | ✅ | ✅ | ✅ (tree = JTree; cards/list adapt to the table) | ✅ |
| Inline editing (@InlineEditing, update-row) | ✅ | ✅ | ✅ | ✅ (row form) | ✅ (row form) |
| Date picker | ✅ | ✅ | ✅ | ✅ (calendar popup) | ✅ (own calendar) |
| Remote lookup select (@Lookup / searchable) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Full field-stereotype set (radio, multiSelect, slider, stepper, stars, color, image upload, money, markdown…) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Client-side rules (visible/disabled/state) + \${...} interpolation | ✅ | ✅ | ✅ | ✅ (shared engine) | ✅ (no-eval engine) |
| Page banners (@Banner + action-returned) | ✅ | ✅ | ✅ | ✅ | ✅ |
| FABs, header badges, KPIs, charts | ✅ | ✅ | ✅ | ✅ (FABs as header buttons) | ✅ |
| @AutoSave / @SubscribeTo scopes / @OnRowSelected | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI chat (sseUrl) / theme toggle | ✅ | ✅ | ✅ | ✅ chat (theme = the IDE's own) | ✅ |
| App context selector | ✅ | ✅ | ✅ (shared) | ✅ (navigator combos) | ✅ |
| — searchable picker w/ remote search | ✅ | ✅ | ✅ | 🟡 loaded options only | ✅ |
| Signature capture | ✅ canvas | ✅ canvas | ✅ (shared) | ✅ mouse canvas | ✅ svg + view-shot |
| Photo capture | ✅ getUserMedia | ✅ | ✅ (shared) | 🟡 file picker (no desktop camera API) | ✅ expo-camera |
| Tree select dropdown | ✅ | ✅ | ✅ (shared) | ✅ (JTree popup) | ✅ |
| Tree lookup selector (dialog) | ✅ | ✅ | ✅ (shared) | ✅ (tree layout) | ✅ (tree layout) |
| Dashboards, Gantt, foldouts, skeletons | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dockable multi-tab workspace | — | — | — | ✅ (IDE editor tabs/splits) | — |
| App registry boot (installable → registry → backend) | — | — | — | ✅ (+ min IDE build gate) | ✅ |

🟡 PatternFly (redhat) & SLDS: as of 2026-07-10 both reuse the shared design-system-neutral
`<mateu-filter-bar>` (full smart-search) and the shared capture/tree field widgets
(`mateu-signature-pad`, `mateu-camera-capture`, `mateu-tree-select`) + money formatting, so those
stereotypes work. PatternFly still renders dashboards/gantt/foldout/hero as `<mateu-unsupported>`
placeholders (its `SUPPORTED_TYPES` is small); SLDS falls through to off-theme Vaadin components for
types its own switch misses. Both remain lighter than Vaadin/SAP UI5.

MessageList/MessageInput (Vaadin): as of 2026-07-10 these carry a real data model
(`List<MessageListItem>` / an `actionId` that fires on submit) — they were previously stubs that
rendered hardcoded demo data.

"Shared" = SAP UI5 and PatternFly reuse the shared web components (Lumo-variable theming), so they
inherit those features automatically.

Update this page whenever parity moves — it is referenced from the language manuals and the
[Rosetta](/reference/language-rosetta/).

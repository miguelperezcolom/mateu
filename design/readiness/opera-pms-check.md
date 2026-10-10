# Readiness check: could a team build a full PMS on current Mateu + Redwood?

*2026-10-10 · branch `check/opera-pms` from `origin/master` (e4ef17783), with `origin/integration/authoring` (PR #755) treated as about to land.*

The use case is a hotel property-management system with the scope of a well-known commercial cloud PMS:

- configuration screens;
- guest profiles, including duplicate detection and merge;
- availability, including a rate-shopping grid;
- the reservation lifecycle;
- front desk;
- housekeeping;
- folios and billing;
- cashiers;
- a nightly close ("end of day") run as a long-running process with human decisions;
- business events.

The required stack is Java 21, Spring Boot, Maven, PostgreSQL and Kafka. The UI must be written entirely in Mateu on the **Redwood** renderer. The long-running processes must use **EventConductor 2.23.10**, with their human tasks shown in the UI.

This report answers two questions: can that be built on Mateu today, and where would a team or a coding agent hit a wall? Nothing here is specific to hotels, apart from the use case itself. All fixes made on this branch are generic.

## Verdict

**Yes, with two caveats.** On the UI side, every phase has a Mateu mechanism, and almost all of them render on Redwood. The hardest screens (the room tape chart, the metrics × dates availability grid, the categorised "I want to…" overlay, folio windows with drag and drop, the housekeeping board, the guided end-of-day run) already exist in `demo/demo-vb-pms`. I drove each of them in a real browser for this check.

The two caveats:

1. **EventConductor integration is not first-class.** There is no "process instance progress + pending human tasks" view, and putting the engine in the same Boot app as Mateu ran into three integration traps:
   - a split Mateu classpath (fixed on this branch);
   - Mateu's component scan sweeping the engine's own UI layer (open);
   - field injection into view models being silently broken (fixed on this branch).

   After the fixes, a spike runs embedded EventConductor and Mateu-on-Redwood in one Spring Boot app, starts a process from a toolbar button and watches its progress refresh live. The human-task half (showing an engine form as a Mateu form and completing it) is still hand-written glue: about **2–4 days** for a team, and more for an agent without a recipe.
2. **Document output.** There is no "render this document to PDF / preview / print" API, so the guest folio, the registration card and the closing reports need a PDF library and hand-written layout. Delivering the bytes as a download works on Redwood (verified).

Four bugs found on the way would each have stopped a team cold. Three are fixed and committed on this branch:

- **A restricted screen opened by typing its URL.** Class-level `@EyesOnly` was not enforced on the first load of a route.
- **Field injection silently missing.** The documented `@Autowired` field injection into view models did not happen.
- **Two copies of Mateu on the classpath.** Mixing in a library built on an older Mateu, such as the EventConductor engine, put both copies on the classpath.

The fourth is open and not fixed here: **unverified JWT claims**. Mateu trusts the claims of the Bearer token without checking its signature. For a PMS that issues its own tokens, role-based access is only as strong as the validation the application adds in front of Mateu.

## What was run vs only read

**Run and verified**

- The backend built with a private repository (`.m2-opera`, not committed). The `mateu-core` test suite passed: **1506/1506**, including the new tests.
- `demo/demo-vb-pms` ran on :9010 with the `mateu-redwood` jar. JET and the VB runtime load from Oracle's CDN, which **was reachable**. The console shows harmless noise: a VB catalog warning and one `ojtabbar.js` load blocked by Chrome's ORB.
- Playwright (Chrome for Testing) drove 17 screens plus these flows:
  - Ctrl+I opens the "I want to…" panel;
  - holding Alt shows access-key badges (15 on the reservation page);
  - billing downloads the folio PDF;
  - the reservation search narrows 50 rows to 19 with a chip;
  - housekeeping: multi-select and the "Set room status" dialog;
  - the end-of-day wizard: the stop on an unresolved step, the run with streamed progress, the new business date.
- The Redwood renderer was rebuilt from source (`npm run bridge && npm test && npm run build && npm run copy`, all six test files green) and the fixes were re-verified in the browser.
- Dependency resolution of EventConductor 2.23.10 next to current Mateu, before and after the BOM fix (`dependency:tree`).
- A class-reference check with `jdeps`: all 146 Mateu classes that the engine jars reference still exist in current Mateu. Method signatures were not checked.
- **Spike** (scratch project, not committed): a Boot 4 app with `workflow-engine` 2.23.10 embedded (H2/JPA), `mateu-mvc` and `mateu-redwood`. A Mateu listing over the engine's `ProcessRepository` (a Mateu `CrudStore`), a toolbar action that starts a process, and a 2-second background refresh on Redwood: the row appears and its status and percentage update.

**Only read** (code, docs and tests, not run): the YAML authoring kinds in #755, the .NET/Python ports, i18n, the Keycloak bootstrap, `PdfExporter`, the JPA guidance, header widgets and `@AppContext` on Redwood.

Screenshots are in `/private/tmp/claude-501/-Users-mguel-IdeaProjects-mateu/e5e6bb22-fdb5-44ff-95b8-b8117e101445/scratchpad/opera-check/` (`00`–`32`, plus `folio-download.pdf`).

## Fixes on this branch

| Commit | What | Tests |
|---|---|---|
| `ebd5904b5` | **Security:** a class-level `@EyesOnly` now also refuses the **first load** of its route. That request names no `serverSideType`, so `WireTypePolicy` had nothing to check, and a restricted screen rendered when its URL was typed. `RunActionUseCase` now checks the instance the route resolved to, and what a `RouteHandler` returns. | `RouteLevelEyesOnlySyncTest` (failed before) |
| `290b74357` | **Redwood:** (a) bare **function-key shortcuts** (`@Action(shortcut="f2")`, `shift+f9`). The VB shell only listened to Ctrl/Alt/Meta combinations. (b) A **row click opens a record only on a navigable listing**. On a `@NotNavigable` board it used to fire `view` and render a record page the crud never offered (screenshot `22b`). | `test-pms.mjs` (+2); verified in the browser |
| `547f67f87` | **Build:** `mateu-bom` now manages the **pre-rename artifact ids** (`mvc-core`, `uidl`, `core`, `vaadin-lit`…). EventConductor 2.23.10 depends on Mateu **3.0-alpha.371** under the old ids, so Maven loaded two copies of `io.mateu.*`. Managed by the BOM, they resolve to the relocation POMs. | `MateuBomCompletenessTest` (+1 check); checked with `dependency:tree` |
| `1306efbd6` | **Core:** view models that Mateu instantiates now get their `@Autowired`/`@Inject`/`@Resource` **fields injected**. This was documented in the execution-model guide but not implemented: the first action using the service threw a NullPointerException, and the demos used static gateways instead. Injected fields are also kept out of the component state. | `ViewModelFieldInjectionSyncTest` (failed before) |

Against #755 these merge cleanly in source. Only the generated Redwood bundle files conflict, and regenerating them (`npm run bridge/build/copy`) resolves that.

## Requirement matrix

Legend:

- ✅ supported, with evidence;
- 🟡 partial (what's missing is noted);
- ❌ missing;
- ⚠️ supported but awkward.

"Demo" means `demo/demo-vb-pms`, and "shot NN" refers to a screenshot listed above.

### Shell and cross-cutting

| Requirement | Mateu mechanism | Redwood | Status | Evidence / gap |
|---|---|---|---|---|
| Sections in a hamburger, screens in a band under the header | `@App(HAMBURGER_SECTIONS)` + `@Menu` | oj-sp shell | ✅ | demo `PmsHome`, shot 00 |
| Notification bell | `NotificationsSupplier` | ✅ | ✅ | shot 00, count 3 |
| Menu group shown as cards | `@Menu(display=cards)` | `oj-popup` + action cards | ✅ | demo `QuickAccess` |
| Global search / command palette | `GlobalSearchSupplier`, `@App(commandCenter)` | Ask palette | ✅ | `poc/globalSearch.mjs` |
| Multi-hotel selector | `@AppContext` on the app class (sent with every request) | behind the settings drawer | ⚠️ | Works, but on Redwood the selector is not in the header, where back-office users look for the property. |
| Business date in the header | `WidgetSupplier` → `Text` in the header end slot | `poc/widgets.mjs` | 🟡 | Static until the next shell load. A live value needs a polling `MicroFrontend` widget. There is no "date changed" broadcast to every open session. |
| Keyboard: action shortcuts | `@Action(shortcut)` | `poc/keys.mjs` | ✅ | Ctrl/Alt combinations; **F-keys fixed here** |
| Keyboard: access keys | `@App(accessKeys=true)` | Alt badges | ✅ | shot 21 |
| Keyboard: app-wide hotkeys (quick-launch page with one-letter keys) | — | — | 🟡 | Shortcuts belong to a screen's actions. There is no app-level hotkey registry. |
| Density for power users | `@Compact` | **not honoured** | 🟡 | Redwood renders tables and forms at the airy "list" density (rows ≈48 px). Only inline-editable tables switch to "grid". The room diary and boards show about 10 rows per viewport. |
| i18n | `Translator` + `messages_*.properties`; #755 adds `type: Translations` YAML and `${i18n.…}` | chrome texts **en/es** only (`poc/i18n.mjs`) | 🟡 | The renderer's own texts follow the browser language and the content follows the server, so an untranslated app mixes languages (shot 20 has a Spanish toggle and an English "Show more"). |
| Idle-session warning | — | — | ❌ | Only 401 → `mateu-session-expired` and a retry (`sessionGuard.ts`, the Redwood bridge). |
| Deep links, back/forward, dirty guard | built in | ✅ | ✅ | path routes, `/bookings/reservations` |

### Phase 1: configuration, profiles, availability, reservations

| Requirement | Mateu mechanism | Redwood | Status | Evidence / gap |
|---|---|---|---|---|
| Admin lists (room types, rooms, transaction codes, taxes, market/source, guarantees, payment methods, policies) | `AutoCrud<T>` + `CrudStore`; filters, export | oj-table + smart search | ✅ ⚠️ | Mechanically trivial. ⚠️ Every entity needs a hand-written `CrudStore` adapter over JPA. There is no Spring Data adapter (`crud-store.md` shows the pattern). |
| Rate codes with a price per day | Editable grid (`@InlineEditing`), or `MatrixGrid` with editable rows | `oj-data-grid` editable cells | ✅ | demo `PropertyAvailability` (overbooking row edited in place), shot 05 |
| Profiles: search, presentation page, business card | `AutoCrud` + `EntityHeader`/`ItemOverview` | sticky header | ✅ | demo `ReservationDetail`, shot 08 |
| Duplicate detection | Domain logic; a `Notice` or listing filter to show it | ✅ | ✅ | No framework support needed |
| **Profile merge: side-by-side compare, pick fields per attribute** | none dedicated; compose an editable grid (one row per attribute, an enum "keep from A/B" select) or a form with one radio per attribute | inline editors | ⚠️ | No compare-and-pick component. The composition works but reads like a form, not the usual merge screen (left/right columns, a checkbox per value, paging between candidates). |
| Availability (metrics × dates, collapsible sections, linked cells, inline edit) | `MatrixGrid` | `oj-data-grid` | ✅ | shot 05 |
| **Rate-shopping grid** (rate codes × room types, closed/struck-out cells, cell detail, add to a cart) | `MatrixGrid` (`cellActionId`, cell tone), `Drawer` as the cart | ✅ | 🟡 | Clicking a cell to add it to a side-panel cart works. ❌ Dragging a **cell** into a cart: drag and drop is listing rows → `DropZone` only. ❌ There is no struck-through cell style (a tone or a ✕ glyph instead). |
| Reservations: create/modify/cancel/reinstate, confirmation numbers | Forms + `@Toolbar` actions + `ConfirmDialog`; rules (`RuleSupplier`) | ✅ | ✅ | demo `NewReservation` (linked dates, rules), shot 06 |
| Nightly rate breakdown | `@Tooltip`/`Popover` on the rate cell; a "daily details" grid | hover popup | ✅ | demo `ReservationSearch` rate tooltip |
| Reservation search | `AutoCrud` smart search, row tones, column chooser, saved views, CSV/Excel export | ✅ | ✅ ⚠️ | shot 23. ⚠️ Enum values show raw in cells (`IN_HOUSE`); only option labels are humanised. |
| Room diary / tape chart | `PlanningBoard` (move, resize, double-click, empty-range selection) | `oj-gantt` | ✅ | shot 04 |
| Property calendar (day/week/month/list) | `CalendarPage` | own grid + `oj-buttonset-one` | ✅ | shot 02 |

### Phase 2: front desk and housekeeping

| Requirement | Mateu mechanism | Redwood | Status | Evidence / gap |
|---|---|---|---|---|
| Arrivals / in-house / departures lists with row actions | `AutoCrud`, `@ListToolbarButton`, row actions, `@RowStatus` | ✅ | ✅ | |
| Assign room with suggestions | A form with a `@Lookup`/`@Searchable` room field and suggestion buttons (`Button.parameters`), or `ResourceGrid` cards | ✅ | ✅ | composition |
| Check-in page of panels + chained prompts | `@Section` form, `ConfirmDialog`/`Dialog` returned from actions, signature, camera | ✅ | ✅ | demo `RegistrationCard`, shot 09 |
| Walk-in workflow | `Wizard` (+ `@WizardProgress(RAIL)`) | `oj-sp` guided process | ✅ | wizard verified in the end-of-day flow (shots 24–27) |
| Room move | `Drawer` form, or a drag on the `PlanningBoard` | ✅ | ✅ | |
| Departure / early departure / check-out with a zero balance | Actions + domain checks + `Message`/`ConfirmDialog` | ✅ | ✅ | |
| Telephone console (list + detail) | `MasterDetailLayout` + `TaskQueue` | ✅ | ✅ | shot 10 |
| Housekeeping board: statuses, multi-select, bulk status dialog, background refresh | `AutoCrud` + `@RowStatus` + `@ListToolbarButton` returning a `Dialog`; `@Trigger(OnSuccess, timeoutMillis)` loop | `poc/polling.mjs` | ✅ | shot 22; **row-click bug fixed here** |
| Out of order / out of service with dates, removed from inventory | Form + domain | ✅ | ✅ | |
| Floor plan | `Element` (custom web component), events wired back | ✅ | ✅ ⚠️ | demo `FloorPlan` (shot 12). ⚠️ The component has to be written by hand. |

### Phase 3: folios, check-out, cashiers

| Requirement | Mateu mechanism | Redwood | Status | Evidence / gap |
|---|---|---|---|---|
| Folio windows (up to 8), side by side | `ResponsiveGrid` of window cards + grouped listing | ✅ | ✅ | demo `FolioWindows`, shot 16 |
| Move charges between windows by drag and drop | `@DragRows` + `DropZone` | `oj-table` drag and drop | ✅ | demo `FolioWindows` |
| Transfer wizard (pick charges → split → confirm) | `Wizard` with a selection grid | ✅ | ✅ | |
| Summarised / detailed view, subtotals | `@GroupBy` + `@Aggregate` | group rows + totals | ✅ | shot 15 |
| Charges with tax, payments, adjustments | Forms/dialogs + `Ledger`/`PaymentPicker` | ✅ | ✅ | |
| **Generate the guest folio (PDF), preview, print** | `UICommand.downloadFile(bytes)` | `poc/files.mjs` | 🟡 | The download works (shot 14, `folio-download.pdf`), but the demo writes the PDF bytes by hand (`SimplePdf`). `PdfExporter` (PDFBox) covers **listing export only**. There is no document/report API, no "open in a new tab" for generated bytes (`NavigateTo` needs a URL), and no print. |
| Cashier open/close (PIN, blind drop) | Forms, password field, actions | ✅ | ✅ | |

### Phase 4: end of day (EventConductor)

| Requirement | Mateu mechanism | Redwood | Status | Evidence / gap |
|---|---|---|---|---|
| A guided run that stops at decisions, with streamed progress | `Wizard` + `LongTask` (SSE) | ✅ | ✅ | shots 24–27; **but the demo drives it in-process, not through EventConductor** |
| Start an EventConductor process from the UI | `@ListToolbarButton`/`@Toolbar` action → `ProcessUpstreamEventUseCase` | ✅ | ✅ | spike, shots 31–32 |
| Show process progress live | Listing over `ProcessRepository` (a Mateu `CrudStore`), `getCompletionPercentage()`, background refresh loop | `poc/polling.mjs` | ✅ ⚠️ | spike. ⚠️ Polling only: there is no per-page server push, and a long SSE stream applies only `LongTask` events live on Redwood. |
| **Pending human tasks inbox + complete a task** | `TodoList`/`TaskQueue`/`AutoCrud` over the engine's `FormExecutionRepository` (also a `CrudStore`); the form and its completion (`CompleteTaskUseCase`) are glue | ✅ components | 🟡 | No adapter turns an engine **form definition** into a Mateu form. That is hand-written per task, or a generic adapter (work on the EventConductor side). Running the forms engine embedded needs a `StreamBridge` (Kafka) bean (EventConductor side). |
| Embed the engine in the same Boot app | — | — | ⚠️ | See Probe 1: three traps, two fixed here. |

### Phases 5–6 and non-functional

| Requirement | Mateu mechanism | Status | Evidence / gap |
|---|---|---|---|
| Business events on Kafka | Not a UI concern | n/a | — |
| Spring Boot version | Boot **4.x**, Java 21 (`backend/pom.xml` 4.1.0; demos 4.0.5) | ✅ ⚠️ | EventConductor 2.23.10 is on Boot 4.1.1, so they are compatible (the spike ran). ⚠️ `prerequisites.md` still lists "3.x / 4.x". Nothing builds or tests on Boot 3. |
| Coordinates | `io.mateu:mateu-mvc`, `mateu-annotation-processor-mvc`, `mateu-redwood`, `mateu-bom` | ✅ | The challenge kit's 403 coordinates (`mvc-core`, `redwood`) relocate (`backend/relocations`). |
| PostgreSQL/JPA-backed lists | `CrudStore.find(text, filters, pageable)` / `find(…, criteria, …)` overridable for database push-down | ⚠️ | No ready-made Spring Data adapter (see Gap 9). |
| Login | `@KeycloakSecured` (keycloak-js bootstrap), or bring your own token (`configureAuthToken`) | ⚠️ | No built-in login page or Spring Security integration. A self-issued OAuth token endpoint needs a custom login screen or bootstrap. |
| Roles per screen / field / action | `@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless`; #755 adds `access:` in YAML | ✅ | **Route bypass fixed here.** ⚠️ The `Authorizer` decodes the JWT **without verifying its signature** (documented). The application must validate tokens before Mateu reads them (Spring Security resource server or a gateway). |
| Printing in general (registration cards, reports) | Browser print + `@media print` (`advanced/printing.md`) | 🟡 | Same gap as the folio. |
| Live reload while authoring | #755 (dev mode, IDE "Run App (Live)") | ✅ | Read, not run. |

## Probes

### Probe 1: EventConductor in the same Spring Boot app

Steps tried, in order (spike in the scratchpad, not committed):

1. **Dependency tree.** `workflow-engine`/`forms-engine` 2.23.10 depend on `io.mateu:mvc-core`, `vaadin-lit` and `annotation-processor-mvc` **3.0-alpha.371** at compile scope. Next to current Mateu, `dependency:tree` showed `mvc-core`, `uidl`, `core`, `dtos` and `annotation-processor-*` at 371 **and** `mateu-mvc`, `mateu-uidl`… at the current version: two copies of `io.mateu.*`. **Fixed by managing the old ids in `mateu-bom`** (`547f67f87`). Only one copy remains, plus `mateu-vaadin` arriving through the engine, which the app must exclude (`<exclusion>io.mateu:vaadin-lit</exclusion>`).
2. **Binary compatibility.** All 146 `io.mateu.(uidl|core|dtos)` classes that the engine jars reference exist in current Mateu. Method signatures were not checked.
3. **Boot.**
   - The engine's in-memory mode **fails**. Mateu's generated configuration component-scans **all of `io.mateu`** (`config.ftl`: `@ComponentScan(basePackageClasses = io.mateu.ReferenceForPackageScanning)`). That sweeps in the engine's own management UI (`io.mateu.workflow.infra.in.ui`), which needs JPA. The engine's `@WorkflowEmbeddedApplication` tries to exclude that layer, but Mateu's scan brings it back.
   - The embedded + JPA (H2) mode boots, because the swept UI beans can then resolve.
   - `forms-engine` embedded additionally needs a `StreamBridge` (Kafka) bean (an engine-side issue).
4. **Glue.**
   - First run: `@Autowired ProcessRepository` was **null** in the Mateu-instantiated listing. **Fixed** (`1306efbd6`).
   - After the fix: the toolbar action starts a process, and the 2-second background refresh shows it `RUNNING 25%` while it waits for its message step (shot 32).
   - A `@ListToolbarButton` defaults to `rowsSelectedRequired = true`. A list-level action such as "start a run" must say `false`, or Redwood answers "select rows first" (⚠️).

**What it costs a team today:**

- process list + progress: ~0.5 day;
- task inbox listing: ~0.5 day;
- the task form and completion: 1–3 days, depending on how many distinct forms;
- live updates: polling only;
- the scan trap: ~0.5 day to diagnose.

That is roughly 2–4 days. A coding agent without a recipe would likely lose more time on the scan trap and the classpath split than on the glue.

### Probe 2: PDF of a folio

There is no API. `PdfExporter` exports a **listing** (`Listing.pdfExportable()`). A folio document (header, guest, windows, lines, taxes, totals) needs PDFBox or OpenPDF, a layout written by hand, and `UICommand.downloadFile`. That download works on Redwood (verified). Preview in a new tab and print are missing.

### Probe 3: very dense grids

All of these render and interact on Redwood:

- the room diary (`PlanningBoard` → `oj-gantt`, 1–28 days, move, resize, empty-range selection);
- property availability (`MatrixGrid` → `oj-data-grid`, 16 rows × 14 dates, linked cells, in-place edit);
- the housekeeping board (40 rooms).

The limits are density, which ignores `@Compact`, and the lack of virtualisation hints for hundreds of rooms. I did not measure a 300-room tape chart.

### Probe 4: keyboard on Redwood

- Ctrl/Alt action shortcuts work, and so do `@Tab(shortcut)` and Alt access-key badges. Ctrl+I opens the "I want to…" panel (shot 20).
- Bare function keys did not work; fixed here.
- Missing: an app-wide hotkey or quick-launch registry, and keyboard date arithmetic in date fields (typing "+7").

### Probe 5: roles

`@EyesOnly` hides menu entries, refuses actions and serverSideTypes, and (after the fix) refuses the route itself. `@ReadOnlyUnless` and `@DisabledUnless` work per field and per button. #755 adds the same thing as YAML `access:`. The caveat is the unverified JWT (see the Phase 5–6 table).

### Probe 6: multi-hotel

`@AppContext` works on every request (`HttpRequest.appContext("hotel")`) and on Redwood, but sits behind the settings drawer rather than in the header.

### Probe 7: business date in the header

A `WidgetSupplier` text shows it, but only refreshes on the next shell load. When the date rolls, nothing tells the other open sessions. That needs a polling header `MicroFrontend` or a notification from `NotificationsSupplier`.

### Probe 8: merge profiles

There is no compare-and-pick component (see the Phase 1 table).

## Top gaps, ranked by impact on "could someone build this"

Effort: XS < 0.5 d, S ≤ 1 d, M 2–5 d, L 1–3 weeks.

| # | Gap | Impact | Effort | Proposal |
|---|---|---|---|---|
| 1 | ~~View-model field injection silently missing~~ | Would block everyone following the docs | — | **Fixed here** (`1306efbd6`) |
| 2 | ~~`@EyesOnly` not enforced on a route's first load~~ | Security hole in any role-based app | — | **Fixed here** (`ebd5904b5`) |
| 3 | ~~Older-Mateu libraries split the classpath~~ | Blocks embedding EventConductor | — | **Fixed here** (`547f67f87`) |
| 4 | **Workflow / human-task UI** is not first-class | The phase-4 requirement, and any approval flow | M (Mateu recipe + generic `ProcessProgress`/inbox example) + M on the EventConductor side (form definition → Mateu form adapter, forms engine embeddable without Kafka) | A documented pattern plus a small adapter module. Add a page-level refresh/push hook so progress doesn't need list polling. |
| 5 | **Generated config scans all of `io.mateu`** | Sweeps any `io.mateu.*` library's beans (EventConductor's UI) into the app | S code + M verification (5 adapters, e2e SUT relies on it: `io.mateu.sample1.*`) | Scan `io.mateu.core`, `io.mateu.export` and Mateu's top-level classes only, or offer an opt-out property. |
| 6 | **No document/report output** (PDF render, preview in a new tab, print) | Folios, registration cards and closing reports in every back office | M | A `Document` API (template → PDF through the existing `mateu-export-pdf`/PDFBox), plus an `OpenFile`/preview command on every renderer. |
| 7 | **JWT claims trusted without signature verification** | Self-issued tokens: forged roles pass | S (docs + an opt-in verifier hook) | A `TokenVerifier` SPI, wired by default to Spring Security's `JwtDecoder` when present. Make the warning loud. |
| 8 | **Density**: `@Compact` ignored by Redwood | Power-user screens show about 10 rows | S–M | Map compact to `oj-table display="grid"` and a compact form-layout density in `poc/core/listing.mjs` and the form projection. |
| 9 | **No Spring Data adapter for `CrudStore`** | Every admin entity needs a hand-written store (dozens of configuration tables) | M | **Decided out of scope (2026-10-10):** data access is not Mateu's concern — apps write their `CrudStore` over their own (domain) repositories. A prototype module lives on branch `feat/spring-data-store`. |
| 10 | **Profile merge / compare-and-pick component** | A common back-office pattern, clumsy to compose | M | A `RecordMerge` component: N records side by side, a pick per attribute, then a merge action. |
| 11 | **Drag beyond listing rows** (matrix cell → cart; tape-chart block → panel) | The cart-building flow on the rate grid | M | Generalise `@DragRows`/`DropZone` to `MatrixGrid` cells and `PlanningBoard` blocks. |
| 12 | **App-wide hotkeys / quick launch** | Keyboard-heavy users | S–M | `AppHeaderAction.shortcut`, plus a quick-launch page with access letters. |
| 13 | **Live shell data** (header widget refresh, "business date changed" to all sessions) | Nightly date roll | S | A refresh trigger on `WidgetSupplier` widgets, or a shell-level poll. |
| 14 | `@NotNavigable` crud still **serves `/{id}`** server-side; its record page shows the `toString()` title and "Add another" on a non-creatable crud | Confusing deep links | S | Gate `ViewRouteResolver` with `canView()`/`@NotNavigable`; use `@Title`/the id for the record title. |
| 15 | Enum values raw in grid cells (`IN_HOUSE`) | Polish everywhere | S | Humanise enum cells in `ListingColumnBuilder`, the same way options are humanised. |
| 16 | No idle-session warning; Redwood chrome texts en/es only | Polish / international | S each | — |
| 17 | `prerequisites.md` claims Boot 3.x | Wrong expectations | XS | Say Boot 4 / Java 21. |

## Notes on #755 (authoring)

The PR does not change what can be built here, but helps teams and agents:

- `type: Translations` YAML and `${i18n…}` (i18n without Java);
- `access:` on routes, menu items and actions (roles in YAML, enforced server-side with 403);
- live reload in dev mode (faster screen iteration);
- the project descriptor that fixes the renderer to Redwood once.

Merging this branch over it only conflicts in the generated Redwood bundle files, which regenerating resolves.

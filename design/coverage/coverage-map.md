# Test coverage map (GA plan, phase 2) — 2026-10-12

Measured on `origin/master` @ `a6ca44a36` (branch `test/coverage-map`), with each suite's own tool.
This is the **measurement + gap map** that the phase-2 test-writing streams fan out from (§6). The
earlier reviews (`backends.md`, `frontends.md`, 2026-10-11/12) describe what was added then; this
document is the current state and what is left. Floors are the gates CI enforces today.

How it was measured (reproducible):

| Area | Command |
|---|---|
| Java | `cd backend && mvn -B verify -fae` (JaCoCo 0.8.15 per module; JDK 26 locally — CI uses 21) + JaCoCo CLI `merge` of every module's `jacoco.exec` and `report --classfiles shared/{uidl,dtos}/target/classes` for the cross-module figure |
| .NET | `dotnet test test/Mateu.Tests -p:TargetFrameworks=net8.0 --collect:"XPlat Code Coverage"` (coverlet, already configured; no .NET 10 SDK on this machine, so only the net8.0 leg) |
| Python | `python -m coverage run -m pytest && coverage report/json` (pyproject `[tool.coverage]`) |
| libs/mateu, apps/vaadin, apps/visual-editor, VS Code | `npx vitest run --coverage` (v8, `coverage-summary.json`) |
| Redwood poc | the exact CI command (`run_tests.yml` "Redwood core tests") |
| React Native | the exact CI command (`node --test --experimental-test-coverage … 'src/**/*.test.ts'`) |
| IntelliJ plugin | `scripts/intellij-gradle.sh test koverXmlReport koverLog` (Kover 0.9.1) |

## 1. Summary

| Area | Tests | Lines | Branches | Floor (CI) | Gap to 80% lines |
|---|---|---|---|---|---|
| Java `shared/core` | 2155 | **89.3%** (was 84.7) | **77.7%** (was 70.1) | 89% bundle lines + 77% bundle branches (S1, 2026-10-17) | — (branches: 2.3 pts) |
| Java `shared/uidl` — own suite | 145 | 49.0% | 29.7% | 49% lines / 29% branches | 31.0 (gated cross-module instead) |
| Java `shared/uidl` — all suites (cross-module) | — | **87.6%** | 73.0% | **87% / 73%** (`backend/coverage`) | — |
| Java `shared/dtos` — all suites (cross-module) | 124 (incl. dynamic) | **84.5%** | 87.4% | **84% / 87%** (`backend/coverage`) | — |
| Java `annotation-processor-core` | 46 | **95.1%** | 81.9% | 95% bundle + 95% per package / 81% branches | — |
| Java `annotation-processor-indexer` | 16 | **97.7%** | 94.7% | 97% / 94% branches | — |
| Java `mvc-core` | 51 | **88.5%** (S3: was 70.6) | 86.1% | 88% lines / 86% branches | — |
| Java `webflux-core` | 55 | **95.0%** (S3: was 79.1) | 84.9% | 95% lines / 84% branches | — |
| Java `micronaut-core` | 44 | **92.4%** (S3: was 85.0) | 82.2% | 92% lines / 82% branches | — |
| Java `quarkus-core` | 31 | **92.4%** (S3: was 86.5; quarkus-jacoco now counts @QuarkusTest, §5.1/§5.2 fixed) | 76.5% | 92% lines / 76% branches | — |
| Java `helidon-mp-core` | 32 | **91.5%** (S3: was 83.2) | 78.8% | 91% lines / 78% branches | — |
| Java `mateu-bundle-maven-plugin` | 29 | **90.1%** | 75.4% | 90% / 75% branches | — |
| Java 5 framework annotation processors | 0 | not measurable (run in javac) | | none | — |
| Java `mateu-archetype` | archetype IT | n/a (Groovy post-generate) | | IT pass/fail | — |
| .NET (net8.0) | 898 (S4, 2026-10-17; was 801) | **97.0%** (was 94.3) | 85.3% (was 80.3) | per package lines Uidl 98 / Core 96 / Dtos 99 / AspNetCore 98 + **branches** Uidl 90 / Core 84 / Dtos 95 / AspNetCore 84 (measured Uidl 98.9/90.7, Core 96.2/84.8, Dtos 99.8/100, AspNetCore 98.2/84.9) | — |
| Python | 955 (S4, 2026-10-17; was 866) | **95.4%** (was 94.1) | **88.1%** (was 84.8) | separate gates lines **95** / branches **87** (`[tool.mateu.coverage]`, one point under the branch measure: arcs vary across 3.11–3.13) + combined `fail_under` 93 | — |
| Conformance corpus | 39 cases (S4: + `crud-search`, `wizard`, `rest-source`) | — | — | exact match in Java, .NET and Python, empty allow-lists | — |
| `libs/mateu` | 2039 (S5, 2026-10-17; was 1433) | **93.5%** (was 65.8%) | 86.6% (was 51.8%; vitest 4 v8 counts — 81.3% before S5 on the same tool) | 93 L / 93 S / 93 F / 86 B | — |
| `apps/vaadin` | 246 | **86.1%** (S6, was 35.2) | 74.9% (was 27.4) | 86 / 85 / 80 / 74 | — |
| `apps/visual-editor` | 484 | **80.7%** (S6, was 66.9) | 70.2% (was 59.5) | 80 / 78 / 76 / 70 | — |
| Redwood `poc/` (58 sources) | 13 suites | **95.2%** | 79.3% | 94 L / 91 F / 78 B | — |
| Redwood VB chains (84 files, ~5k lines) | 0 executed | **0% (unmeasured)** | | none | e2e only |
| React Native `.ts` (45 loaded) | 273 | **95.5%** | 85.1% | 93 / 84 / 93 | — |
| React Native `.tsx` (37 files, 11.4k lines) | 0 | **unmeasured** | | none | — |
| IntelliJ plugin | 327 | **48.6%** | 39.2% | Kover minBound 47 | 31.4 |
| VS Code extension | 160 | **96.2%** | 79.3% | 96 / 91 / 94 / 79 | — |

S2 rows (uidl, dtos, the two APs, the bundle plugin) re-measured 2026-10-17 on `coverage/s2`; the
cross-module uidl/dtos figures now come from the `backend/coverage` module (merged exec of every
suite, gated in CI). Every Java module can also gate BRANCH coverage
(`jacoco.min.bundle.branch.coverage`, parent pom).

All suites pass and all gates are met on master (Quarkus only after the tooling problem in §5.2).

Reading it: the **servers are in good shape** (Java core/adapters 79–92%, both ports 94%); the gap
is concentrated in **the web renderers' DOM-heavy code** (`apps/vaadin`, the big LitElements in
`libs/mateu`, the visual editor's panels), **the native renderers' UI layer** (RN `.tsx`, IntelliJ
Swing renderers and IDE glue) and **the VB chains**, plus **branch coverage** almost everywhere
(Java core 70%, adapters 63–74%).

## 2. Java backend

### 2.1 Per module

Per-module JaCoCo only sees the module's own tests. That makes `uidl` look like 40.8% when core's
`TestMateu` suites drive it to 84.2%, and `dtos` has no tests → no `jacoco.exec` → **no report and
no gate at all**. Fix: an aggregate report (§5.3).

| Module | Lines / branches | Least-covered classes that matter (missed / total lines) | Why they matter |
|---|---|---|---|
| core | 84.7 / 70.1 | `AppMenuResolver` 54/164 (67%) | route → menu resolution; every app shell navigation goes through it |
| | | `McpService` 41/59 (31%) | agent entry point: RBAC + error boundary of tool calls (security default) |
| | | `YamlUidlLoader` 45/305 (85%) | parses every YAML definition; a parse failure is a silent "Not found" |
| | | `SpecsWatcher` 39/105 (63%) | live reload of `specs/ui` (dev mode) |
| | | `ComponentRegistry` 38/145 (74%) | partials/components catalogue for YAML |
| | | `RestSourceRegistry` 35/183 (81%) + `RestSourceResolver` 26/95 (73%) | proxy mode resolves sources server-side — the secret-injection path |
| | | `ImportRowAssembler` 34/99 (66%) | guided import: turns CSV rows into entities |
| | | `FieldValueConverter` 31/116 (73%) + `ValueProvider` 25/66 (62%) + `CollectionValueConverter` 22/69 (68%) | state hydration — the "field silently resets" class of bugs |
| | | `WireRestCalls` 31/94 (67%) + `SchemaToJava` 28/100 (72%) | derived OpenAPI contract + server generator |
| | | `RunMethodActionRunner` 29/79 (63%), `ActionableDispatcher` 28/71 (61%) | action dispatch (parameter injection, nested-form actions) |
| | | `PageContentBuilder` 30/82 (63%), `MasterDetailView` 29/90 (68%), `Foldout` 23/74 (69%), `EditableView` 23/81 (72%), `CrudAdapterHelper` 28/46 (39%) | archetypes/orchestrators users subclass directly |
| uidl (own) | 40.8 / 22.0 | `GenericTypeHierarchyResolver` 0/162, `SearchableSelection` 0/138, `IdSetFilter` 0/84, `CrudStore` 69/226, `FilterStateAssembler` 0/67, `HttpRequest` 60/80, `LongTask` 0/57, `Listing` 0/55, `Humanizer` 0/44 | public API defaults; cross-module they are 83–91% except `GenericClassProvider` (37%), `HttpRequest` (66%), `PageSetup` (0%), `ProgressReporter` (38%), `WeightEstimator` (53%) |
| annotation-processor-core | 73.5 / 53.5 | `UISourceFileGenerator` 34/119, `IndexedUIProcessor` 29/100, `MateuLintAnnotationProcessor` 20/63 | generates every controller; lint is the compile-time safety net |
| indexer | 67.8 / 65.8 | `MateuUIIndexerProcessor` 29/90 | writes `ui-registrations` — a miss here = routes 404 |
| mvc-core | 70.6 / 73.5 | `YamlMountAutoConfiguration` 0/56, `MateuDevAutoConfiguration` 16/51, `SpringHttpRequest` 9/17 | YAML-only apps on Spring MVC; dev endpoints (unauthenticated when on); principal extraction |
| webflux-core | 79.1 / 73.4 | `YamlMountWebFluxAutoConfiguration` 44/46, `SpringHttpRequest` 8/31 | same, reactive |
| micronaut-core | 85.0 / 85.1 | `MateuMicronautJacksonDatabindMapper` 0/15, `MateuMicronautJsonMapper` 8/16 | wire serialisation (discriminators!) |
| quarkus-core | 86.5 / 64.5 | `MateuBundleController` 0/16 (**false**, §5.1), `QuarkusHttpRequest` 7/37 | |
| helidon-mp-core | 83.2 / 63.2 | `MateuHelidonRoutes` 23/188, `HelidonMPHttpRequest` 10/24 | SSE/MCP/YAML-mount routing on Helidon SE |
| bundle plugin | 59.9 / 50.3 | `OpenApiMojo` 0/67, `ServerMojo` 0/29, `BundleMojo` 23/117 | the `openapi`/`server` goals have no mojo test (logic tested in core) |

Modules with **no tests**: `shared/dtos` (records; covered only through core — no gate), the five
`annotation-processor-<framework>` modules (FreeMarker templates only; their output is compiled and
exercised by each adapter's parity suite), `shared/frontend/*` (resource jars), `integration-tests`
(it *is* the shared IT foundation, run by the adapters), `mateu-bom`, `relocations`.
Modules with **no gate of their own**: `dtos` (0%), and the framework APs.

### 2.2 Ports

| Port | Least-covered files (lines) | Why |
|---|---|---|
| .NET | `Mcp/McpService.cs` 38% (30/80) | MCP RBAC + error boundary (was a security bug in this port) |
| | `Uidl/Capabilities.cs` 55%, `Uidl/Crud.cs` 72% | capability listings / CRUD defaults users inherit |
| | `Uidl/Catalogues.cs` 74%, `Core/Catalogues.cs` 87% | action/field-type/translation catalogues |
| | `SyncHandler.Islands.cs` 82%, `SyncHandler.State.cs` 83% | embedded islands; state round trip |
| | `PartialRegistry.cs` 84%, `Mcp/McpJsonRpc.cs` 86%, `RouteRegistry.cs` 86%, `ActionRegistry.cs` 87% | YAML partials, routing |
| | No **branch** floor (Uidl branches 73%) | |
| Python | `mateu_core/mcp.py` 72% | same MCP surface |
| | `mateu_uidl/export.py` 76% | listing exporters |
| | `mapper/_common.py` 77% | shared mapper helpers |
| | `sync_handler/search.py` 82%, `sync_handler/helpers.py` 83%, `sync_handler/wizard.py` 83%, `sync_handler/listing.py` 87% | search/filter/sort/page, wizard navigation |
| | `component_registry.py` 82%, `partial_registry.py` 84%, `rest_source_registry.py` 84%, `islands.py` 84%, `importwizard.py` 84% | |
| | Floor is *combined* lines+branches (90%); branches alone are 83.9% | |

## 3. Frontends

### 3.1 `libs/mateu` (332 files, 17 at 0%)

| File | Lines | Why it matters |
|---|---|---|
| `infra/ui/mateu-component.ts` | 39.7% of 506 (br 28%) | THE action/state boundary: claims actions, dirty tracking, shortcuts, triggers, focus-first-invalid |
| `infra/ui/mateu-app.ts` | 40.6% of 424 (br 25%) | every app shell: menus, route selection, palette, chat |
| `infra/ui/mateu-ui.ts` | **0%** of 127 | composition root: routing, popstate, notifier/banner mounting |
| `infra/ui/mateu-page.ts` | 59.9% of 237 | page header, banners, `@Toc` scrollspy, sticky sections |
| `infra/ui/ComponentElement.ts` | 61.7% of 167 | `@SubscribeTo` listener registration (re-register on reconnect) |
| `infra/ui/renderers/renderLayouts.ts` | 19.8% of 106 | tabs (open/shortcut), form layouts, labels-aside |
| `infra/ui/renderers/renderClientSideComponent.ts` | 22.1% of 113 | dispatch for every client-side component |
| `infra/ui/liveUpdates.ts` | 34.5% of 87 | polling/SSE live elements |
| `mateu-signature-pad.ts`, `mateu-camera-capture.ts`, `mateu-file-upload.ts`, `mateu-rich-text-editor.ts` | **0%** (44–57 each) | capture fields + the Tiptap editor (value = HTML, Delta migration) |
| `mateu-planning-board.ts` 8.9%, `mateu-workflow.ts` 8.9%, `mateu-form-editor.ts` 8.7%, `mateu-app-context-picker.ts` 9.6%, `mateu-foldout.ts` 11.4% | | interactive widgets (drag → `moveActionId`, app context reload) |

Also: `testbench/**`, `allIcons.ts` and the mocks are inside the coverage `include` and only dilute it.

### 3.2 `apps/vaadin` (35 files, 24 at 0% — 447 lines)

| File | Lines | Why |
|---|---|---|
| `fields/mateu-field.ts` | 40.7% of 543 (br 28%) | every field of every form on the default renderer |
| `grid/mateu-table.ts` | **0%** of 218 | table component |
| `fields/mateu-grid.ts` | 54.7% of 137 | grid fields, `@OnRowSelected` + keyboard row selection |
| `grid/renderColumn.ts` | 54.4% of 136 | column widths, inline-editable cells (`update-row`, no-op commit guard) |
| `renderers/renderLayouts.ts` | 51.0% of 149 | Vaadin form/tab layouts |
| `renderers/mateu-vaadin-foldout.ts` | 52.1% of 192 | foldout carousel (per-panel widths) |
| `grid/menuColumnRenderer.ts` 13.7%, `fields/mateu-vaadin-tree-select.ts` 24.6%, `grid/mateu-vaadin-tree.ts` 0% | | row menus, tree selects |
| `renderers/render*.ts` (Button, ToolbarButton, Menu, ConfirmDialog, Notification, Card, …), `grid/gridRenderer.ts`, `grid/renderTable.ts`, `fields/renderField.ts`, `VaadinComponentRenderer.ts` | **0%** | the dispatch from wire type to Vaadin element |

### 3.3 `apps/visual-editor`

| File | Lines | Why |
|---|---|---|
| `mateu-visual-editor.ts` | 35.8% of 742 | the editor shell embedded in both IDEs |
| `canvas/editor-canvas.ts` | 48.4% of 349 | drag/drop placement on the canvas |
| `board/mount-board.ts` | 8.3% of 359 | the mount/route board |
| `app/app-editor.ts` 41.8%, `routes/routes-editor.ts` 26.4%, `actions/actions-editor.ts` 9.4% | | editors of `type: AppShell` / routes / actions |
| `play/redwood-play.ts` 11.3%, `canvas/redwood-frame.ts` 41.9% | | Play on Redwood |
| `palette/editor-palette.ts` 15%, `widgets/ve-icon-picker.ts` 47.9% | | |

The model layer (`model/*`) is already 93–98%.

### 3.4 Redwood / VB

`poc/` is well covered and every source is loaded by the CI gate (no poc source is missing from the
run: all 47 top-level `*.mjs` + 11 `core/*.mjs`). Lowest: `reproject.mjs` (branches 36%),
`editorPreview.mjs` (lines 65%, 239–368), `richtext.mjs` 71%, `theme.mjs` 74%, `notify.mjs` 79%,
`transport.mjs` 89% (branches 73%), `matrix.mjs`/`actionPanels.mjs`/`displayDom.mjs`/`dnd.mjs`/
`hover.mjs`/`prefs.mjs`/`recordMerge.mjs`/`planning.mjs` (branches 61–68%).

**Not covered at all by unit tests**: the 84 VB action-chain files under `webApps/vbredwoodapp`
(`test-chains.mjs` reads them as TEXT to assert they stay thin). Largest: `runMateuAction.js` 689,
`onMateuNavigate.js` 592, `loadMateuShell.js` 471, `runMateuIslandAction.js` 251, `chatSend.js` 165,
`runMateuNestedAction.js` 145. Only the `renderer-vb` job (Playwright + 3 probes) exercises them.

### 3.5 Native and IDE

React Native — `.ts` 95.5%; not loaded by any test: `core/oidc.ts` (141, **auth**),
`core/AppRegistry.ts` (94), `core/secureStore.ts` (40), `hub/storage.ts` (31),
`renderer/customComponents.ts` (24); low: `a11y/a11y.ts` 14.6%, `core/documentEffects.ts` 33.9%.
The 37 `.tsx` files (11.4k lines: `DisplayRenderer` 1578, `CrudRenderer` 1193, `WireComponents`
1072, `AppRenderer` 961, `FormFieldRenderer` 875, …) are outside the coverage scope.

IntelliJ — 48.6% lines. Most-missed: `ui/DisplayRenderer.kt` 713/1149, `state/AppContext.kt`
388/804, `ui/FormFieldRenderer.kt` 288/484, `ui/CrudRenderer.kt` 278/587,
`ui/PlanningBoardRenderer.kt` 0/207, `ui/FieldWidgets.kt` 204/328, `ui/AppShellExtrasUi.kt` 0/139,
`ui/GlobalSearch.kt` 0/99, `ui/NotificationBell.kt` 0/94, `ui/ActionPanelRenderer.kt` 0/90,
`ui/MapRenderer.kt` 75/83. IDE glue that cannot run headless (`MateuVisualEditor`,
`NewMateuFileDialog`, `MateuNewProjectWizard`, `MateuProjectService`, `AddMateuRouteDialog`,
`MateuViewManager`, `MateuConfigurable`, …, ~1.1k lines at ~0%) counts in the denominator by design.

VS Code — 96.2%; only `LiveRunCommand.ts` (77%) is below 90.

## 4. End-to-end

Inventory: `e2e/tests/shared` has **23 spec files (~4.4k lines)** run against the 5 adapter SUTs;
8 of them are wire-level API tests (`request`), not browser journeys (`features.spec.ts` and
`recent-features.spec.ts` are the bulk of the "feature" coverage and assert on JSON). Plus
`federation` (5), `federation-sections` (1), `renderer` (4, run on Vaadin and VB), `static` (1),
`yaml-federation` (1), and the VB probes in CI. Hand-run only (not in CI): `slow-network-probe.mjs`,
`a11y-audit.mjs`, `rn-a11y-probe.mjs`, `live-reload-probe`.

Features from CLAUDE.md "Important Conventions" with **no e2e at all** (no spec mentions them; most
are pinned by core SyncTests + unit tests):

- **CRUD journey in the browser**: drawer create/edit (`editInDrawer`, "Save and next"), inline
  editing (`@InlineEditing` → `update-row`), optimistic-lock dialog (`@Version`), bulk actions beyond
  the selection guard, totals/grouping (`@Aggregate`/`@GroupBy`), listing exports (CSV).
- **Listings**: smart search bar typed facets (`dateRange`/`numberRange`/`multiSelect` chips),
  saved views, column chooser, `@DragRows` + `DropZone`, capability listings (`Navigable` /
  `Editable`-in-drawer / `Creatable` / `Deletable` combinations), `rowRoute` on a YAML listing.
- **Wizards** in the browser: branching, cross-step state, RAIL/STEPS progress, drafts.
- **Archetypes as journeys**: Calendar (views, day click), Gantt page (bar → drawer), Data management
  (grid ⇄ gantt), Planning board (drag), Matrix grid (edit cell), Action panel, Collection detail /
  To-do list / General overview (selection re-render), Foldout, Smart search, Hero search, Import
  wizard. (Only `layout-sizing`/`smoke` render some of them, without interaction.)
- **App chrome**: command center, notification inbox, global search (⌘K), `@AppContext` selector,
  app header actions, theme toggle, access keys (Alt badges), card menus (opening), `@Toc` scrollspy +
  sticky sections, `@Tab(open)`.
- **Inter-component**: `@SubscribeTo`/`dispatchEvent`, embedded islands re-pointed by events,
  `closeModal(event)` refresh.
- **Fields**: `@Signature`/`@PhotoCapture`, `@TreeSelect` + tree lookup selector, `@AutoSave`,
  `@Notice`/`@BulletedList`/separators, `Map` markers.
- **YAML authoring**: `actions:` writing through a proxied source with `${secret.X}` (demo-starwars
  shape), translations (`${i18n.key}`), environments, field types, sample-data mode.
- **Security in the browser**: `@EyesOnly`/`@ReadOnlyUnless`/`@DisabledUnless` and YAML `access:`
  (no SUT authenticates a browser — needs a dedicated SUT with a test `PrincipalResolver`).
- **Resilience** on the web renderer (the probe exists, not in CI), session expiry (401 → retry),
  undoable toasts, documents/print.

## 5. Coverage tooling — what is broken or misleading

1. **Quarkus hides `MateuBundleController` from JaCoCo.** `AdapterParityTest.servesTheRuntimeBundle`
   exercises it, yet it reports 0/16: `@QuarkusTest` loads a transformed copy of the REST resource in
   its own classloader, so the agent's class ids don't match the build's class files. Real figure
   91.9%, not 86.5%. Fix: `io.quarkus:quarkus-jacoco` (test scope), which instruments Quarkus' own
   classloader and writes `target/jacoco-quarkus.exec`; point `jacoco:report`/`check` at both exec
   files (or `quarkus.jacoco.data-file=${project.build.directory}/jacoco.exec` with
   `reuse-data-file=true`), then raise the floor to ~91%.
2. **Quarkus tests can hang forever on a cold `~/.m2`.** The new `quarkus-test-security` dependency
   pulls `io.quarkus:quarkus-security-deployment`; when its POM is not cached, Quarkus' bootstrap
   resolver downloads it in parallel and deadlocked (class-init of commons-logging inside Apache
   HttpClient, observed on JDK 26 — 13 min at 0% CPU until killed). Offline it fails fast with
   "Failed to collect dependencies of quarkus-security-deployment". CI is fine while its cache holds
   the artifact, but nothing bounds the hang: add a surefire `forkedProcessTimeoutInSeconds` (e.g.
   900) to quarkus-core, or `dependency:get` the deployment artifacts in the build step.
3. **Per-module JaCoCo understates uidl and skips dtos.** uidl's gate is 38% because core's suites
   don't count; dtos has no exec, so `jacoco:report` is skipped and there is no gate. Fix: a
   `jacoco:report-aggregate` (new `backend/coverage` pom module depending on core + adapters, or in
   `shared/integration-tests`) with BUNDLE floors for uidl (~83%) and dtos (~78%).
4. **Branches are ungated in Java and .NET.** Every Java rule is `LINE`; core branches are 70%,
   adapters 63–74%. Add a `BRANCH` limit per module at the measured value (ratchet).
5. **React Native `.tsx` is outside the measure.** The gate's `include` is `src/**/*.ts`; node cannot
   load `.tsx`, so 11.4k lines of renderer are not even in the denominator, and 5 `.ts` files are not
   imported by any test (oidc!). Node's runner only reports files a test loads.
6. **VB chains are unmeasured** (§3.4): 84 files run only in the browser.
7. **`libs/mateu` coverage includes test-only code** (`testbench/**`, mocks, `allIcons.ts`). *(Fixed by S5: excluded in `vitest.config.ts`.)*
8. **Python's floor mixes lines and branches** (`branch = true` + `fail_under`), so a branch
   regression can hide behind line gains; branches alone are 83.9%.
9. **.NET locally**: without a .NET 10 SDK, `dotnet test` fails (NETSDK1045) unless the target is
   narrowed (`-p:TargetFrameworks=net8.0`); worth a note in `backend/dotnet/README.md`.
10. **CLAUDE.md is stale** on core coverage ("77.8% / gate 75%"): the pom gate is 84% and the
    measure 84.7%.
11. **Probes not in CI**: web `slow-network-probe.mjs`, `a11y-audit.mjs`, `rn-a11y-probe.mjs`.
12. **Pre-existing failing e2e** noted in `frontends.md` (`bulk-action-buttons` › selection guard with
    an `@Action`) — confirm before the e2e stream starts.

## 6. Fan-out plan — 8 independent streams

Each stream owns a disjoint set of directories, so all can run in parallel worktrees and merge in any
order. Floors are raised **to the measured value at the end of the stream** (ratchet), with the
targets below as the goal. "Matters" = behaviour a user relies on; no noise tests against
catch/defensive branches.

| # | Stream | Owns (only these paths) | Targets (lines / branches) | Work list |
|---|---|---|---|---|
| **S1** | Java core behaviour | `backend/shared/core/src/test`, `backend/shared/core/pom.xml` | core 84.7→**88** / 70→**76**; add BRANCH rule | `AppMenuResolver`, `McpService`, `YamlUidlLoader`, `SpecsWatcher`, `ComponentRegistry`, `RestSourceRegistry`/`RestSourceResolver`, `ImportRowAssembler`, `FieldValueConverter`/`ValueProvider`/`CollectionValueConverter`, `WireRestCalls`/`SchemaToJava`, `RunMethodActionRunner`/`ActionableDispatcher`, `PageContentBuilder`, `MasterDetailView`, `Foldout`, `EditableView`, `CrudAdapterHelper` |
| **S2** | Java build tooling, uidl/dtos, APs, plugin | `backend/pom.xml`, new `backend/coverage/` aggregate module, `backend/shared/{uidl,dtos,annotation-processor-*}`, `backend/mateu-bundle-maven-plugin`, `.github/workflows/run_tests.yml` (Java step only) | aggregate gate uidl **85** / dtos **80**; AP core **80**, indexer **80**, plugin **80** | `report-aggregate`; uidl own tests for `GenericClassProvider`, `HttpRequest` defaults, `PageSetup`, `ProgressReporter`, `WeightEstimator`, `RouteLink`/`RemoteMenu`; `UISourceFileGenerator`, `IndexedUIProcessor`, `MateuLintAnnotationProcessor`, `MateuUIIndexerProcessor` (compile-testing); `OpenApiMojo`, `ServerMojo` mojo tests; golden-source test per framework AP template (optional) |
| **S3** | Java adapters | `backend/{mvc,webflux,micronaut,quarkus,helidon-mp}/**`, `backend/shared/integration-tests` | every adapter **≥ 85** lines / **≥ 75** branches | `quarkus-jacoco` + surefire fork timeout; YAML-mount auto-configs (mvc/webflux) via `AdapterParityITFoundation` (a YAML-only mount contract run by all five); `MateuDevAutoConfiguration`; `SpringHttpRequest`/`HelidonMPHttpRequest`/`QuarkusHttpRequest` principal + header paths; Micronaut JSON mappers (discriminators); `MateuHelidonRoutes` SSE/MCP |
| **S4** | Ports (.NET + Python) | `backend/dotnet/test`, `backend/python/tests`, CI .NET/Python steps | .NET lines **95** + branch floors (Uidl 80 / Core 83); Python lines **95**, separate branch floor **87** | .NET `McpService`, `Capabilities.cs`, `Crud.cs`, `Uidl/Catalogues.cs`, `SyncHandler.Islands/State`, `PartialRegistry`; Python `mcp.py`, `export.py`, `mapper/_common.py`, `sync_handler/{search,helpers,wizard,listing}.py`, `component_registry.py`, `partial_registry.py`, `importwizard.py`; conformance cases for CRUD search / wizard / REST source (identical fixtures ×3 — coordinate with S1 only on `conformance/cases`, owned here) |
| **S5** | Web shared lib | `frontend/web/monorepo/libs/mateu` | **75** L / **62** B (from 65.8 / 51.8) | `mateu-component`, `mateu-app`, `mateu-ui`, `mateu-page`, `ComponentElement`, `renderLayouts`, `renderClientSideComponent`, `liveUpdates`, capture fields + rich text + file upload, planning board, app-context picker, foldout; exclude testbench/mocks/allIcons from coverage |
| **S6** | Vaadin renderer + visual editor | `frontend/web/monorepo/apps/{vaadin,visual-editor}` | vaadin **60** L / **45** B (from 35 / 27); VE **75** / **65** | vaadin `mateu-field`, `mateu-table`, `mateu-grid`, `renderColumn`, `renderLayouts`, foldout, tree/tree-select, the 0% `render*.ts` dispatchers; VE `mateu-visual-editor`, `editor-canvas`, `mount-board`, `app-editor`, `routes-editor`, `actions-editor`, `redwood-play` |
| **S7** | Native + IDE + Redwood | `frontend/app/{react-native,intellij-plugin,vscode-extension}`, `frontend/web/monorepo/apps/redwood` | RN `.ts` 95 kept + oidc/AppRegistry/secureStore/a11y/documentEffects loaded; decide the `.tsx` strategy (extract logic into `.ts` view-models, or add a test renderer) and measure it; IntelliJ **60** (from 48.6); Redwood poc branches **84**; a chain harness | IntelliJ `DisplayRenderer`, `AppContext`, `FormFieldRenderer`, `CrudRenderer`, `PlanningBoardRenderer`, `FieldWidgets`, `AppShellExtrasUi`, `GlobalSearch`, `NotificationBell`, `ActionPanelRenderer`, `MapRenderer` (headless render tests, like the existing corpus); Redwood `reproject`, `editorPreview`, `richtext`, `theme`, `notify`, `transport` branches; a fake-VB-context harness running `runMateuAction`/`onMateuNavigate`/`loadMateuShell`/`runMateuIslandAction` |
| **S8** | End-to-end | `e2e/**` (specs, SUT fixtures in `e2e/sut/**`, probes), the CI `e2e` job | close §4 | one `journeys` project on mvc-app1 only (cost): CRUD drawer + inline edit + optimistic lock + export; wizard branching + cross-step; smart search typed facets + saved views + column chooser; calendar / gantt page / planning board / matrix / action panel / foldout interactions; command center, notifications, global search, app context, access keys, `@Toc`; `@SubscribeTo` islands; capture/tree-select/auto-save fields. A dedicated SUT with a test `PrincipalResolver` for role-based hiding + YAML `access:`. YAML `actions:` + proxied secret (demo-starwars shape against a local upstream). Move the web slow-network + a11y-audit probes into CI |

Ordering notes: S2's aggregate module changes `backend/pom.xml` (modules list) — the only shared
build file; S1 and S3 must not touch it (they edit their own module poms). S8 adds SUT fixtures
under `e2e/sut` only, never under `demo/` or `backend/`. S4 owns `conformance/cases`. If a stream
finds a production bug, it fixes it in its own paths or files it for the owning stream rather than
editing another stream's sources.

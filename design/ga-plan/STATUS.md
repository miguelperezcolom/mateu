# Road to beta/GA — status and how to resume

Live progress page (updated by the working session as it advances): https://claude.ai/artifact/UeYCtDuoXftPbvZQRRwLZr — republish it from `scratchpad`-style source or rebuild it from this file.

This file is the hand-off point: any session (local, at work, or a cloud session on claude.ai/code) can
continue the work from here. **Update it at the end of every block of work.** Last update: 2026-10-17 (batch 3 integrated locally on `integration/batch-3`, pending CI — the owner decisions, the natives/listings fixes and the Redwood fixes; batch 2 on `integration/walkthrough-2` also pending CI).

## Owner rules (Miguel)
- Mateu ships **UI only**; a non-UI concern is at most an interface the app implements (no DB, no PDF engine, no
  auth — the framework principal or a `PrincipalResolver`). MCP endpoint, Figma pipeline and the openapi/server
  generator stay.
- **Everything supported everywhere**: Java/YAML/editor/.NET/Python × Vaadin/Redwood/React Native/IntelliJ ×
  served/static. A gap that should work is a bug.
- **Stay on alphas** (`v3.0-alpha.N`) until the pre-beta review WITH Miguel. Releases: `gh release create
  v3.0-alpha.N --target master --title "Mateu v3.0-alpha.N" --notes-file <notes>`; CI publishes Maven Central,
  PyPI (`mateu-ui`) and NuGet (`Mateu.*`, Trusted Publishing; workflow file is `buid-and-publish.yml`, typo kept).
- The main session may merge PRs, cut releases and change GitHub settings; sub-agents never push or touch GitHub.
- Read-only for us: `opera-pms-challenge` (never read `evaluacion/`), `ec-demo1`, EventConductor. The Oracle OPERA
  user guide is confidential: never quote it. Never quote Oracle documentation. No secrets/IPs/account ids in the
  repo or docs.
- Communication with Miguel in Spanish; repo content in English.

## The plan (agreed 2026-10-12)
1. ~~Close the blockers~~ ✅ · ~~UX review~~ ✅ (no real-user tests: it's all on us)
2. **Exhaustive walkthrough** ✅ walked (all seven areas) and **integrated, pending CI** (2026-10-17: batch 1 = PR #802 merged;
   batch 2 = `integration/walkthrough-2`, see below). A matrix feature × authoring × renderer × serving, walked with real
   interaction; every cell → fix at the root + a permanent test. Brief: [`walkthrough-brief.md`](walkthrough-brief.md).
   Seven areas, one branch each (from master):
   | area | branch | port block |
   |---|---|---|
   | app shell & navigation | `walkthrough/app-shell` | 18100–18199 |
   | forms, fields, layouts, wizards | `walkthrough/forms` | 18200–18299 |
   | listings & CRUD | `walkthrough/listings` | 18300–18399 |
   | page archetypes & display components | `walkthrough/pages` | 18400–18499 |
   | actions, events, overlays | `walkthrough/actions` | 18500–18599 |
   | YAML authoring, data, tooling (wizards, editor, bundle, openapi) | `walkthrough/authoring` | 18600–18699 |
   | native renderers (RN, IntelliJ) + .NET/Python as servers | `walkthrough/native-ports` | 18700–18799 |
   Each delivers `design/walkthrough/<area>.md` (✅ / 🔧 fixed / ❌ needs owner / N/A per cell). Branches are pushed
   to origin periodically as WIP; **to resume an area, check out its branch, read its matrix file and continue the
   cells not marked yet** (same brief).
3. **Coverage** — measured in [`../coverage/coverage-map.md`](../coverage/coverage-map.md) (PR #800): 8 streams
   S1–S8 with target floors. Launch AFTER the walkthrough is integrated (its tests change the numbers).
4. **Refactor/optimization** backed by those tests — **scheduled for the weekend of 17–18 Oct** (owner, 2026-10-12), with whatever token budget is left that week.
5. **Deep independent review by Fable** (owner, 2026-10-12): at the very END, after the refactor, before GA — a different model with fresh eyes over the whole product (public API + stability, security, wire contract + Java/.NET/Python parity, core architecture, docs-vs-reality, a new developer's first hour). Runs on the separate Fable weekly quota (`model: "fable"` agents). Its report becomes the GA blocker list.
6. **Pre-beta review with Miguel** (same weekend, after the refactor) (page: https://claude.ai/artifact/LwGdbZQ2QSRVbj71EAJwVE — update it first),
   then beta, then GA.

## Minimise CI runs and releases (owner, 2026-10-12)
CI is the slow, expensive part (~35–45 min per full run), and only PRs, pushes to master and releases trigger it
(`run_tests.yml`: pull_request/workflow_call; `examples.yml`/`codeql.yml`/`docs.yml`: PRs + master; the release
re-runs the whole suite before publishing). So:
- **Branch pushes are free** (no workflow runs on a plain branch push): WIP branches are pushed often, for hand-off.
- **No per-feature PRs.** Work accumulates on its branch, verified LOCALLY (the module's tests, the bundle
  freshness and design-token checks, the relevant e2e specs on one or two adapters). One integration PR per phase:
  all seven walkthrough branches in ONE batch; the coverage streams in one batch; the refactor in one batch.
  Docs-only PRs (#800, #801) ride along in the next batch instead of running CI on their own.
- **Don't push to an open PR to "see if CI passes"**: reproduce the failure locally, fix, push once.
- **Releases only at phase ends**: one after the walkthrough batch, one after coverage + refactor (the beta
  candidate). Hot fixes for something live and broken are the only exception.
- Transient infra failures (Maven Central 502, CDN) → re-run only the failed job (`gh run rerun <id> --failed`).

## Integration practice
Branch protection needs up-to-date PRs, so green PRs are merged in **integration batches**: a branch
`integration/batch-N` from master, merge the PR heads; if the only conflicts are generated bundles, take either
side and rebuild everything once (Redwood: `npx -y npm@11 ci --workspace mateu-redwood --ignore-scripts`, then in
apps/redwood `npm run bridge && npm test && npm run build && npm run copy`; then `npx -y npm@11 ci --workspace mateu
--workspace mateu-visual-editor --workspace mateu-vaadin --include-workspace-root --ignore-scripts` and `npm run copy`
in apps/visual-editor and apps/vaadin), check `bash scripts/check-bundle-freshness.sh` and
`node scripts/check-design-tokens.mjs`, open one PR, merge it when green (SonarCloud is not required). Merging the
batch closes the included PRs. Agent worktrees live under `.claude/worktrees/` — remove them once pushed (they slow
IntelliJ down; `.claude` is excluded in Miguel's IDE).

## State at last update
- Latest release: **v3.0-alpha.422**. Demos were last redeployed on alpha.414 (image tag 2026.10.12b) and verified in a browser.
- **Phase 2 (walkthrough) integrated, pending CI**: local branch `integration/walkthrough-2` = origin/master + `walkthrough/authoring`
  + `walkthrough/native-ports` + `ga/control`, conflicts resolved keeping both sides' fixes and tests, bundles rebuilt once, every
  suite green locally (see "Batch 2 integration" below). Next: push, one PR, merge when green, then the phase release.
- **Batch 3 integrated, pending CI**: local branch `integration/batch-3` = origin/master + `pending/natives` + `pending/decisions`
  + `pending/redwood` (see "Batch 3 integration" below). Both batches start from origin/master (#812); push batch 2 first, then
  rebase or merge batch 3 on it — they do not overlap in code (batch 3 touches the ports' titles/banners, listings, Redwood).
- Open PRs: #800 (coverage map, docs only).
- Demos: `swapi.mateu.io` (root → Swagger UI) and `demo.mateu.io` — redeploy of `demo-vaadin-webflux` on alpha.414
  (index page + counter fix) pending; ops in [`../../deploy/demos/README.md`](../../deploy/demos/README.md)
  (needs the owner's machine: kube context, Docker Hub, Netlify).
- Owner-side pending: mobile store accounts (Apple Team ID, App Store app id, Android SHA-256, upload credentials,
  privacy policy URL); GitGuardian incident to mark as test credential.
- Known follow-ups not yet scheduled: flaky .NET `ActionCatalogueTests`; RN module-wide registries should be
  per-session; Java manifest settings only from system properties/env; Redwood federation doesn't know static remotes
  or remote custom elements; console registry (`design/control-plane-and-newsletter.md`) queued.


## Walkthrough results (all seven branches integrated: batch 1 = PR #802 on master; batch 2 = `integration/walkthrough-2`, pending CI)
| area | branch | matrix | ✅ | 🔧 fixed | ❌ owner | not walked |
|---|---|---|---|---|---|---|
| app shell & navigation | `walkthrough/app-shell` (16 commits) | `design/walkthrough/app-shell.md` | 63 | 33 (11 bugs) | 5 | RN, IntelliJ, static bundles, .NET in a browser, MicroFrontend, breadcrumbs, appState/appData in a browser, visual editor |
| actions, events, overlays | `walkthrough/actions` (10 commits) | `design/walkthrough/actions.md` | 54 | 22 (14 bugs) | 3 | 170 cells ⏳ (mostly RN, IntelliJ, ports beyond unit level, static bundle, editor) |
| forms, fields, layouts, wizards | `walkthrough/forms` (14 commits) | `design/walkthrough/forms.md` | ~45 ✅/🔧 of ~60 | 24 bugs | 6 | ~25 cells: RN, IntelliJ, visual editor, ImportWizard, YAML layout bound to a view model in a browser, Quarkus/Micronaut/Helidon locally (CI covers), static bundle beyond a unit test |
| page archetypes & display | `walkthrough/pages` (29 commits) | `design/walkthrough/pages.md` | ~130 | ~30 (26 bugs) | 7 | ~60: mostly .NET/Python pages in a browser, MicroFrontend |
| listings & CRUD | `walkthrough/listings` (batch 1) | `design/walkthrough/listings.md` | 117 | 24 | 4 (+1 ⚠) | 95 cells ⏳ (N/A 89) |
| YAML authoring, data, tooling | `walkthrough/authoring` (45 commits, 23 fixes) | `design/walkthrough/authoring.md` | 109 | 38 | 7 | a real security module on Helidon MP (MP-JWT); IntelliJ/VS Code completion inside a running IDE; RN for the YAML fixtures; compiling the docs' annotation-driven Java samples |
| native renderers + .NET/Python as servers | `walkthrough/native-ports` (51 commits, 42 fixes) | `design/walkthrough/native-ports.md` | ≈90 | 42 (+3 doc claims) | 5 | photo capture on a device; IntelliJ click-level interaction in a running IDE; RN Back-after-Save on a port; RN `.NET` column cells; the remaining shared e2e specs replayed on native (inline-grid-form, master-detail, recent-features, accessibility) |

Each matrix file lists every cell; the ⏳ / "not walked yet" cells are where to resume (same brief).

## Owner decisions — APPLIED on `integration/walkthrough` (2026-10-12, owner delegated: "apply your own criterion")
Local branch `integration/walkthrough` = origin/master + walkthrough/app-shell, actions, forms, pages, listings +
ga/control + test/coverage-map (conflicts resolved keeping both sides' fixes and tests; bundles rebuilt once).
Each item has a test that fails without it.
1. ✅ **Default home = first menu item**, on the WIRE (Java `AppMapper.withFirstMenuItemAsHome`, .NET
   `FirstNavigableLeaf`, Python `_first_navigable_route`; rule/remote/hidden leaves skipped; sentinel only when there is
   none) → every renderer follows it; conformance goldens `app-context`/`app-header-actions` regenerated; docs were
   already right. `AppSyncTest`, `test_home_route_supplier.py`, `HomeRouteSupplierTests`; e2e `/app`, `/shell-cc` updated.
2. ✅ .NET/Python accept mount-absolute routes (`MateuRegistry` under-mount lookup). `test_mount_absolute_routes.py`,
   `MountAbsoluteRouteTests`.
3. ✅ Python chrome language follows `Accept-Language`. `test_chrome_locale.py`.
4. ✅ YAML `type: UI` mounts served NEXT TO `@UI` classes on all five adapters (`YamlMounts.notServedByClasses`; a path a
   class serves is left to it; Micronaut/Quarkus/Helidon root index answers YAML deep links via `deepLinkIndex`);
   `define/yaml/app-shell.md` back to the positive claim. `YamlMountsTest` + shared e2e `yaml-mount-next-to-ui.spec.ts`
   (fixture `yaml-mixed.ui.yaml` in sample1; green on MVC + WebFlux locally; Quarkus/Micronaut/Helidon only in CI —
   watch them on the batch PR).
5. ✅ Python `PageBanners.replace/append`; .NET `PageBanners.Replace/Append` too (`PageBannersTests`).
6. ✅ Error toasts sticky (duration 0 + ✕) in Java/.NET/Python and Vaadin (neutral + Vaadin notifiers), Redwood (undo
   toasts; banners already persisted), RN (`toastLifetime`), IntelliJ (sticky "Mateu errors" group). Same texts.
7. ✅ `List/Set<Enum>` with no stereotype → `multiSelect` (Java, .NET, Python; no conformance golden affected).
8. ✅ Editable markdown/html = source + Preview toggle: Vaadin `mateu-markup-editor` (libs), Redwood `mateu-markup-field`.
9. ✅ Vaadin shows the window title as the heading of composed archetypes (`composedHeading.ts`: dashboard/collection/
   detail page types with nothing naming them).
10. ✅ Python fluent `Card` with Java's component slots (`CardMetadata` now mirrors `CardDto`).
- ✅ **Redwood 400 on every shell load**: it was the VB security provider fetching `%{env.userProfileUrl}%` (plus the
  `#{env.catalogJson}#` catalogue parse error). `copy.mjs` empties the catalogue/profile config and points the provider
  at a static anonymous user (`/_redwood/resources/mateu-anonymous-user.json`). Verified in a browser: no 4xx, no console
  errors on `/` and `/arch/smart-search`.
- ✅ Redwood listing URL contract (coordinator): `page` + `sort` now written on every search and restored on navigation
  (filters + searchText already were). Unit-tested; not walked in a browser.
- ✅ Redwood: Separator is a visible rule; an edited Amount keeps its currency (`committedValueOf`).
- ✅ RN calendar: month cells no longer nest event buttons in the day button. ✅ .NET starter honours `--urls`.
- ✅ CLAUDE.md: runOnEnter (doesn't exist), AppContext picker (shared element everywhere), core gate 84 %.

### Verification (local, 2026-10-12 evening)
core `mvn verify` 1790 ✅ (JaCoCo gate ok) · libs/mateu vitest 1506 ✅ · Redwood `npm test` all suites ✅ · .NET net8 722 ✅
· Python 804 ✅ · IntelliJ `MessageGroupsTest` ✅ · shared e2e MVC 483 ✅ (4 failures fixed: tests updated for the new
home, sortable headers, a layout-shift race) · WebFlux 482 ✅ · renderer-vaadin 63 ✅ · renderer-vb 59 ✅ / **1 ❌**
(below) · lint 415/420 · design tokens OK (baseline ratcheted 555→553) · licences OK · bundle freshness OK.

### CI of PR #802 made green locally (2026-10-12, night)
Every failing job reproduced locally first, then fixed at the root (one commit per job): Python mypy (two typed
sets) · bundle-freshness = the **annotation-density ratchet** (23 `@Label`s that only repeated the humanized name
removed from the new lab fixtures; ceiling 5.3 → 5.45 with the reason in `annotation-density.json`: the 43
walkthrough fixtures are catalogues by design, the 331 pre-existing screens are unchanged at 5.18) · backend-tests
(Micronaut: the YAML mount controller's sync catch-all swallowed `POST …/client-log` → 404, excluded; the test that
pinned "not a bean next to generated controllers" now pins the opposite, decision 4) · frontend-lib
(`VaadinNotifier.test` pinned the 3 s error toast and the undo detail before `serverNamed`) · e2e (a renderer spec
re-exported a shared spec, which Playwright refuses; the renderer-vb project lists it instead) · renderer-vb
(Redwood record master: the header took the master's title only when the tab had none — now always, the tab's own
title as subtitle; `withinAppLevels` in poc/core). Verified: the five adapters' suites, mvc-app1 Vaadin shared +
renderer 400+ specs, renderer-vb 60/60 on the rebuilt bundle, lint/tokens/licences/bundle freshness. CI rerun then failed only
`yaml-mount-next-to-ui.spec` on micronaut-app1 (a ROOT `@UI` + YAML mount): two Micronaut-only causes — the YAML
controller stood down entirely with a root `@UI`, so the mount's `POST …/mateu/v3/…` was 405 (split: API always,
shell only without a root `@UI`), and `MicronautBeanProvider` was a lazy singleton, so on a cold start the root
index's `deepLinkIndex` saw the facade uninitialised and served the root UI (now `@Context`). Shared suite on
micronaut-app1 482/482, mvc YAML specs green, micronaut-core 30 tests.

### Batch 2 integration (2026-10-17) — `integration/walkthrough-2`
Merged `walkthrough/authoring`, `walkthrough/native-ports`, `ga/control` onto origin/master (after #811). Real conflicts and
how they went (both sides' tests kept everywhere):
- Adapter `index.ftl` (Micronaut/Quarkus/Helidon): master's YAML-mount deep link (`YamlMounts.deepLinkIndex`) AND authoring's
  Accept guard (a data fetch never gets the index) — guard first, then the deep link. Micronaut: the YAML shell stays in
  master's `MateuYamlMountIndexController`, the Accept guard moved there with its test.
- `ActionInstanceCreator`: both branches fixed the definition-only deep link; master's (`isAuthoredDefinitionOnly` +
  `definesItsOwnPage`) kept, authoring's twin dropped. `RouteInstanceCreator.findApp` was added by both — one kept.
- `StaticSafetyCheck`: master's `isClientFlow` (a flow with a `RunAction` step is not static) over `has("steps")`.
- Shell content load of an app with no home (.NET `SyncHandler`, Python `dispatch.py`): both fixed the loop; native-ports'
  `IsTerminalRoute`/`_is_terminal_route` (`endsWith`, Java's rule) kept, master's exact-match twin dropped.
- .NET `[Range]` validations: master's Bean semantics (absent passes) AND native-ports' invariant literals / open bounds not
  sent; the server-side `Violations` use the same literals.
- **Genuine disagreement**: native-ports pinned `_no_home_route` as the wire home of an app WITH menu items (its tests and
  the new `app-extras` golden predate owner decision 1). Master's rule wins: the .NET/Python shell tests assert the first
  menu item, the golden was regenerated from Java (`-Dconformance.write=true`); the sentinel load still renders a page.
- Page FAB dispatch, `bundleStore` seeds (`state:` + `appState:`), sample1 `routes.yaml`/`types.yaml`, Python
  `_with_declared_page_type(state)`: unions. Generated bundles taken from master and rebuilt once at the end.
- Found by the merged suites: IntelliJ's global-search editor had no accessible name (surfaced by `app-extras` opening on
  its first menu item) — named.
Verification (local): backend `mvn install` ✅ · core `mvn verify` 1821 ✅ (JaCoCo 84 % gate met) · micronaut-core 34 ·
quarkus-core 25 · helidon-mp-core 26 ✅ · libs/mateu vitest 1516 ✅ · Redwood `npm test` ✅ · Python 839 ✅ + mypy clean ·
.NET net8 772 ✅ · RN node tests + parity (116 wire types) + tsc ✅ · IntelliJ 354 ✅ (after the fix) · shared e2e mvc-app1
491 ✅ · micronaut-app1 475 + 15 rerun ✅ (the 15 failed only while the IntelliJ gradle build ran alongside; all pass alone)
· dead-button probe 5/5 routes · bundle freshness, design tokens (553), annotation density 5.38 ≤ 5.45, licences ✅.
Not run locally: WebFlux/Quarkus/Helidon e2e, renderer-vb and static-bundle Playwright projects, VS Code extension tests,
the .NET net10.0 target (no SDK here) — CI covers them.

### Batch 3 integration (2026-10-17) — `integration/batch-3` (local, NOT pushed)
Merged `pending/natives` (IntelliJ canvas heights, one-search listings + `?page` deep links, record page titles in .NET/Python,
.NET `PageBanners`, the Mateu face as plugin/extension icon), `pending/decisions` (the 13 owner decisions below) and
`pending/redwood` (seven VB bugs) onto origin/master (#812). Resolutions:
- **Known overlap — both natives and decisions implemented the record-page title in .NET and Python, and .NET
  `PageBanners.Replace/Append`.** ONE implementation kept, natives' (the more complete one and closer to Java's
  `PageMetadataExtractor.getTitle`: `ReflectionMapper.TitleOf(type, instance)` / `mateu_core.titles.record_title` cover the
  crud view/edit/new pages, the capability forms, plain views and the window title, escape a record's `${` as a template
  literal and recognise a compiler-generated record `ToString` / dataclass repr / pydantic `__str__` as a field dump, not a
  name; `PageBanners(Banners, Appending)` + a routed view inside a list result re-rendering with the rest merged).
  Decisions' twins (`ReflectionMapper.EntityTitle`, `mapper.entity_title`, `PageBanners.AppendToExisting`) dropped; its tests
  kept (`A_record_page_is_titled_by_the_record_as_in_java`, `Page_banners_replace_and_append`,
  `test_a_record_page_is_titled_by_the_record_as_in_java`) and pointed at the kept API (`TitleOf` made public for the direct
  assertion). No duplicate type or method remains (both suites compile and pass).
- Generated bundles (Vaadin ×3 copies, visual editor, Redwood): natives' taken at merge time, then everything rebuilt ONCE from
  the merged sources per the integration practice (Redwood byte-identical to its branch) and committed; the copy scripts empty
  the asset folders, no stale chunk.
- STATUS.md and the walkthrough matrices (`actions`, `listings`, `pages`): unions — natives' rows (its .NET/Python cells were in
  the right columns), decisions' test names, redwood's VB cells.
Natives, what landed: IntelliJ Gantt/Kanban/PlanningBoard/MatrixGrid keep a content-derived minimum height on long pages
(`ContentHeightScrollPane`; `StackedCanvasHeightsRenderTest`); a delete / void row or bulk method answers ONE search (the
`listingChanged` event refreshes the listing in place, no `/list` route reload — `CrudActionResult.listingChanged`), a filtered
deep link runs one search (`standInForOnLoad`) and a `?page=N` deep link answers that page (`DeleteActionHandlerTest`,
`CrudSyncTest` +2, `onLoadTimes.test.ts` +4, shared e2e `listing-searches-once.spec.ts`).
Redwood, what landed (each with poc contract/DOM tests + a renderer-vb spec, verified in a browser on its branch): inline islands
held by form fields (surfaces of their own + the `@SubscribeTo` bus by scope), a dialog over a drawer (per-kind overlay
variables), `Callable<Component>` holders drawn, the `@Toc` index (`poc/toc.mjs`, mateu-page's tri-state rule), the calendar
event click (`preventDefault` on the `href="#"` chip), the map marker as a keyboard button. The oj-gantt negative-width console
errors did not reproduce headless (recorded as such — recheck headed).

#### Decisions applied (batch 3, from `pending/decisions`)
The ❌ items the walkthrough left (authoring §4, native-ports, and the leftovers of the other matrices + the "Known
doc/CLAUDE.md corrections" below), decided with the owner's rules (UI only; everything supported everywhere; the
documented behaviour wins) — one commit each, each with a test that fails without it. Matrices marked 🔧 in place.
1. ✅ **VS Code schema cost** (authoring 6): a per-editor SPELLING of the one generated schema — the extension stages
   `Component`/`Actionable`/`Step`/`Trigger`/`UserTrigger` as `type` dispatches (`scripts/schema-dispatch.mjs`; the
   yaml-language-server validates the 4 KB page in ~50 ms instead of 5 s); IntelliJ keeps the generated `oneOf`
   (it completes a nested `type:` from a dispatch with one value). `specsSchema.test.ts` runs every shipped file on
   both spellings (+3 tests). Doc: `native/ide-tooling.md`.
2. ✅ **Field types from any `type: Types` file** (doc correction): Java/.NET/Python read `specs/ui/types.yaml` then
   every YAML under `specs/ui` with that header, in discovery order, later id wins — the action catalogue's rule;
   a Types file is app-level for live reload. `FieldTypesSyncTest`, `FieldTypesAndSampleSourcesTests`,
   `test_field_types_and_samples.py` (+1 each). Docs: `field-types.md`, building-blocks, visual-editor.
3. ✅ **Ports' YAML builder** (authoring 5 / native-ports 8): the generic builder already covered the fluent catalogue
   (pages #14); the real gaps were `type: Listing` over a REST source and a `Button` with `actionable: RouteLink`
   (the ports' wire had no Button `route`). Both ports now emit the client-side Crud Java's CrudlMapper emits for a
   definition-only listing (`rowsSource` by ref/inline, columns with identifier/sortable/tones, filters, pageSize)
   and `ButtonMetadataDto.Route` / `ButtonMetadata.route` — the yaml starter's pages render on .NET and Python.
   `YamlListingTests` (3), `test_yaml_listing.py` (3); manuals + parity updated. `type: AppShell` definitions and
   `rowRoute` stay Java-only (shells are authored in code there).
4. ✅ **The ports serve the web renderer's page** (authoring 2 / native-ports 1, 9): `add_mateu(ui=…)` /
   `MapMateu(ui:)` / `MATEU_UI` pointing at the `mateu-vaadin` (or `mateu-redwood`) jar or its `static/` folder,
   read in place — Java's `IndexPage` + `SpaRedirectFilter` + `StaticAssetCaching` rules (index at the mount and
   its deep links when the GET accepts HTML and names no file; assets at the origin root; the app's routes and the
   API always win; Python = a pure ASGI middleware stepping in on a 404 so SSE streams pass through; .NET =
   `app.Use` after the pipeline). `test_ui_serving.py` (9), `UiServingTests` (7, in-process Kestrel); the Python
   starter with `MATEU_UI` verified in a browser (`/products` renders on the checked-in Vaadin bundle). Manuals,
   READMEs, starters' AGENTS/README/Program/main updated. **Left for the owner**: packaging the renderer into
   PyPI/NuGet and publishing `mateu-vaadin` to npm per release (external accounts / release artifacts).
5. ✅ **.NET `PageBanners.Replace/Append`** (actions leftover): wire `appendBanners`, also inside a mixed result.
   `Page_banners_replace_and_append`; parity row closed.
6. ✅ **Record page titled by the record in the ports** (listings leftover): Java's rule (`@Title` on the entity, an
   own `toString`/`__str__`, else the class name) in `ReflectionMapper.TitleOf` / `mateu_core.titles.record_title`, page
   header + `SetWindowTitle`. Tests in both suites.
7. ✅ **`Callable<String>` as an empty editable box** (doc correction): a Callable of a basic value renders its result
   as read-only text (a Component/adapted/orchestrator result keeps its island). `HolderFieldsSyncTest` (+1);
   `viewmodel-lifecycle.md`.
8. ✅ **Number fields storing strings** (doc correction): `mateu-field.convert` commits a number (null for blank) for
   `dataType: number`, as it already did for integers. `mateu-field.branches.test.ts` (+1).
9. ✅ **Offline canvas placeholders** (authoring 1): the client-side canvas and the board miniatures inline
   `Partial`/`ComponentRef` and translate `${i18n.…}` from the mount's files; the inlined roots keep the
   REFERENCE's `ve-` id (`inlineReferences` `keepReferenceId`), so a partial is one selectable node and
   click-to-select keeps working. `canvasReferences.test.ts` (4); `visual-editor.md`.
10. ✅ **Structural divergences of the ports' create forms / CollectionDetail / wizard `*` / `""` vs `_empty`**
    (native-ports 7): deliberate port idioms, documented in `parity.md` "Port idioms" (same screen, same ids; not
    conformance cases) — consistent with the pre-beta API decision not to converge idioms.
11. ✅ **IntelliJ shell with no home** (native-ports 5): already covered by decision 1 of batch 1 (first menu item on
    the wire as `homeRoute`; `AppRenderer` follows it) — marked, no plugin change.
12. ✅ **`@AppContext` preselection** (doc correction): the contract is "nothing selected until the user picks"
    (`appContext()` null; a preselected first option would scope every search and save to a choice the user never
    made) — written into `ux-patterns/app-context.md`. Redwood's first-option preselection is left to the Redwood
    area to align (`apps/redwood`, not touched here).
13. ✅ `e2e/renderer/layout-sizing.spec.ts` detects the shared layout in the DOM (`mateu-ux`), not by project name.
14. ✅ CLAUDE.md: Code + YAML is offered on Micronaut/Helidon; tooling gotchas (workspace `npm ci`, RN test on Node 23,
    the ports' `MATEU_UI`). Authoring 3 (Redwood 400) was already fixed at integration — marked.
Not decided there: authoring 10 (Redwood canvas stray filter select) — still open; the VB/Redwood and IntelliJ-layout bugs
landed in this same batch from `pending/redwood` and `pending/natives` (above).

#### Verification of the integrated branch (local, 2026-10-17, ports 18950–18951)
backend `mvn install` ✅ · core `mvn verify` 1826 ✅ (JaCoCo 84 % gate met) · libs/mateu vitest 1520 ✅ · apps/vaadin
`test:coverage` 89 ✅ (thresholds met; CI's `frontend-lib` runs these too — the last batch's duplicated Lit binding was only
caught there) · visual-editor vitest 436 ✅ · VS Code extension `tsc` + vitest 172 ✅ · Redwood `npm test` all suites ✅ (bundle
rebuilt byte-identical) · Python 866 ✅ + mypy clean · .NET net8 801 ✅ · IntelliJ `gradlew test` 360 ✅ (1 skipped) · shared e2e
on mvc-app1 (Vaadin) 494 ✅ + renderer-vaadin 60 ✅ · renderer-vb on mvc-app1 built with `mateu-redwood` 64 ✅ (1 skipped by design: the shared-layout-only geometry check, decision 13) ·
lint 0 errors (415 warnings ≤ 420) · bundle freshness, design tokens (553), annotation density 5.38 ≤ 5.45, licences, Vaadin
bundle budget ✅. Not run locally: WebFlux/Quarkus/Micronaut/Helidon e2e, the static-bundle and yaml-federation Playwright
projects, the .NET net10.0 target (no SDK here), RN tests — CI covers them.

### Left for the next session (not done — budget)
- Push `integration/walkthrough-2`, open the ONE batch-2 PR, merge when green; then push `integration/batch-3` (merge master
  into it first), open the batch-3 PR, merge when green; cut the phase release (v3.0-alpha.423) with the behaviour notes:
  validation re-checked server-side on `@Button`/`@Toolbar`; an app with no home opens on its first menu item on every backend;
  a data fetch to a missing endpoint answers 404, never the index page; a record page is titled by the record in .NET/Python;
  a delete or a filtered/paged deep link runs one search; the ports can serve the web renderer (`MATEU_UI`).
- Owner-only leftovers of the decisions: publish `mateu-vaadin` to npm per release / package the renderer into PyPI and NuGet.
- Redwood: the `@AppContext` picker preselects the first option — align with the decided contract (nothing selected until the
  user picks, `app-context.md`); the oj-gantt negative-width console errors (not reproduced headless — recheck headed; if seen,
  gate the oj-gantt on a laid-out container); authoring 10 (canvas stray filter select).
- Quarkus/Micronaut/Helidon: decision 4 compiled and adapter tests compile, but no local e2e run (CI will).
- Then phase 3 (coverage) and 4 (refactor) as planned.

## (Superseded) Pending owner decisions — the original list, all applied above
1. **Default home page** — 7 doc pages say an app opens on its first menu item; Redwood does, Vaadin shell + server don't. → implement the documented rule everywhere.
2. **Full paths in .NET/Python apps mounted under a sub-path** (`/shell/probe` → "Route not found" in Python; .NET untested) → ports accept full paths like Java.
3. **Python chrome language** ignores `Accept-Language` (Java follows it) → parity.
4. **YAML apps next to Java apps**: with any `@UI` class present, YAML-defined apps 404 on every Java adapter (doc corrected to say so) → serve both.
5. **Python has no `PageBanners`** (replace/append) → add it.
6. **Error toast duration**: Python never auto-closes, Java closes after 3 s → errors stay until dismissed, in all backends.
7. **`List<Enum>` with no stereotype** renders as a grid of Name/Ordinal/Hash (kept on purpose) → default to a multi-select.
8. **Editable markdown/html fields**: Redwood shows raw source as editable text, Vaadin shows rendered content → decide the contract (proposal: an editor with preview on both).
9. **Vaadin page heading on composed archetypes**: Dashboard, SmartSearchPage and ItemOverview show no heading on Vaadin (Redwood now does; docs assume one) → add it on Vaadin.
10. **Python has no fluent `Card`** (and its card title is a string, Java's a component) → add it with Java's shape.
11. **Redwood bugs to fix** (not decisions) — ✅ all fixed (batch 1: the 400 'invalid catalog JSON', Amount edits, the separator; batch 3 `pending/redwood`: islands held by a form field, drawer under a dialog, `Callable<Component>` holder, `@Toc`, calendar event click, map marker) except the Gantt negative-width console errors (not reproduced headless). RN web: calendar nests buttons — fixed (batch 1).

## Known doc/CLAUDE.md corrections to apply at integration
- ✅ `parity.md` claimed full server+YAML parity for the ports; fixed in walkthrough/pages, and Python now has `Card` (row added).
- ✅ (batch 3, in CLAUDE.md) Tooling: `npm ci` for the Redwood workspace wipes the other workspaces' node_modules and vice versa; RN `MateuViewController.test` needs Node 24 (or `--experimental-test-module-mocks` on 23).
- Behaviour change (walkthrough/forms): `@Button`/`@Toolbar` actions now get "There are validation errors" when the form breaks a bean-validation constraint (server re-checks what the browser enforced). Mention in the release notes.
- ✅ (batch 3) Field types are read from `specs/ui/types.yaml` AND any `type: Types` file under `specs/ui`.
- ✅ (batch 3) `Callable<String>` renders its result as read-only text; number fields commit numbers.
- ✅ (applied) CLAUDE.md says `@Action(runOnEnter=true)` exists — it doesn't; `shortcut = "enter"` is the way.
- ✅ (applied) CLAUDE.md's description of the Vaadin `@AppContext` picker is out of date: the shell uses the shared `mateu-app-context-picker`.
- ✅ (applied) CLAUDE.md says core's JaCoCo floor is 75 %; the pom has 84 %.
- ✅ decided (batch 3): nothing is selected until the user picks (`app-context.md`); Redwood to align (Redwood area).
- ✅ (batch 3) `renderer/layout-sizing.spec.ts` detects the shared layout in the DOM.

## Budget (owner, 2026-10-12)
Weekly usage 33 % at Mon 18:15 (resets Sun 19 Oct 09:00). Cap: ≤ 60 % before Friday. **Thursday 15 Oct: important demo** — Tue/Wed are for securing it. Coverage paused; refactor + pre-beta review the weekend of 17–18 Oct with what's left. Ask Miguel for `/usage` before launching anything big.

## What needs Miguel's machine vs what can run anywhere
- **Anywhere** (a cloud session on claude.ai/code with this repo): the walkthrough, coverage, refactor, docs,
  integration batches, releases (`gh`), anything in this repo.
- **Only the owner's machine**: redeploying the demos (cluster context, Docker Hub push, Netlify DNS), the IntelliJ
  sandbox for manual testing, emails, the `frontend-public-reference` repo.

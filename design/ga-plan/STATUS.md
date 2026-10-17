# Road to beta/GA — status and how to resume

Live progress page (updated by the working session as it advances): https://claude.ai/artifact/UeYCtDuoXftPbvZQRRwLZr — republish it from `scratchpad`-style source or rebuild it from this file.

This file is the hand-off point: any session (local, at work, or a cloud session on claude.ai/code) can
continue the work from here. **Update it at the end of every block of work.** Last update: 2026-10-17 (phase 2 integrated locally on `integration/walkthrough-2`, pending CI).

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

### Left for the next session (not done — budget)
- Push `integration/walkthrough-2`, open the ONE batch-2 PR, merge when green, cut the phase release (v3.0-alpha.423) with the
  behaviour notes: validation re-checked server-side on `@Button`/`@Toolbar`; an app with no home opens on its first menu
  item on every backend; a data fetch to a missing endpoint answers 404, never the index page.
- Open ❌ items of authoring (7, section 4 of its matrix — notably the yaml-language-server cost of the 125-way Component
  `oneOf`) and native-ports (5: the ports serve no web UI / stale `mateu-vaadin` on npm, structural divergences of the
  ports' create forms, …) need owner decisions.
- Then phase 3 (coverage) and 4 (refactor) as planned.
- Redwood: an island held by a form field (needs `runMateuIslandAction` generalised); drawer stays hidden after a dialog
  over it closes; `Callable<Component>` holder not drawn in a plain form; no `@Toc` index; calendar event click runs
  nothing; map marker click unconfirmed; Gantt negative-width console errors (data in `/arch/interactive` is valid —
  likely a gantt laid out while hidden). All need a browser session.
- Quarkus/Micronaut/Helidon: decision 4 compiled and adapter tests compile, but no local e2e run (CI will).

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
11. **Redwood bugs to fix** (not decisions): embedded components held by a form field aren't drawn (needs Redwood island support); the drawer stays hidden after a dialog opened over it is closed; Amount edits send a bare number (verify server side); a `Callable<Component>` holder field isn't drawn in a plain form; no `@Toc` index; separator line invisible; calendar event click runs nothing; map marker click unconfirmed; Gantt negative-width console errors; **every Redwood shell page load returns a 400 'invalid catalog JSON'** (check before any Redwood demo). RN web: calendar nests buttons (warning).

## Known doc/CLAUDE.md corrections to apply at integration
- ✅ `parity.md` claimed full server+YAML parity for the ports; fixed in walkthrough/pages, and Python now has `Card` (row added).
- Tooling: `npm ci` for the Redwood workspace wipes the other workspaces' node_modules and vice versa; RN `MateuViewController.test` fails on the local Node.
- Behaviour change (walkthrough/forms): `@Button`/`@Toolbar` actions now get "There are validation errors" when the form breaks a bean-validation constraint (server re-checks what the browser enforced). Mention in the release notes.
- Field types are read only from `specs/ui/types.yaml`; a Types file created from the IDE wizard under another name is silently ignored → fix or document.
- `Callable<String>` renders as an empty editable text box; number fields store strings like "19.95" in the browser state.
- ✅ (applied) CLAUDE.md says `@Action(runOnEnter=true)` exists — it doesn't; `shortcut = "enter"` is the way.
- ✅ (applied) CLAUDE.md's description of the Vaadin `@AppContext` picker is out of date: the shell uses the shared `mateu-app-context-picker`.
- ✅ (applied) CLAUDE.md says core's JaCoCo floor is 75 %; the pom has 84 %.
- Redwood pre-selects the first option of each context picker; Vaadin leaves it empty (decide which is right).
- `renderer/layout-sizing.spec.ts` only skips geometry checks when the project is named `renderer-vb` (test issue).

## Budget (owner, 2026-10-12)
Weekly usage 33 % at Mon 18:15 (resets Sun 19 Oct 09:00). Cap: ≤ 60 % before Friday. **Thursday 15 Oct: important demo** — Tue/Wed are for securing it. Coverage paused; refactor + pre-beta review the weekend of 17–18 Oct with what's left. Ask Miguel for `/usage` before launching anything big.

## What needs Miguel's machine vs what can run anywhere
- **Anywhere** (a cloud session on claude.ai/code with this repo): the walkthrough, coverage, refactor, docs,
  integration batches, releases (`gh`), anything in this repo.
- **Only the owner's machine**: redeploying the demos (cluster context, Docker Hub push, Netlify DNS), the IntelliJ
  sandbox for manual testing, emails, the `frontend-public-reference` repo.

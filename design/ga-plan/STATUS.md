# Road to beta/GA — status and how to resume

Live progress page (updated by the working session as it advances): https://claude.ai/artifact/UeYCtDuoXftPbvZQRRwLZr — republish it from `scratchpad`-style source or rebuild it from this file.

This file is the hand-off point: any session (local, at work, or a cloud session on claude.ai/code) can
continue the work from here. **Update it at the end of every block of work.** Last update: 2026-10-12 evening.

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
2. **Exhaustive walkthrough** ← IN PROGRESS. A matrix feature × authoring × renderer × serving, walked with real
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
5. **Pre-beta review with Miguel** (same weekend, after the refactor) (page: https://claude.ai/artifact/LwGdbZQ2QSRVbj71EAJwVE — update it first),
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
- Latest release: **v3.0-alpha.414** (lambda `Button`s advertised again; YAML card menus; demo index page). Demos redeployed on it (image tag 2026.10.12b) and verified in a browser.
- Open PRs: #800 (coverage map, docs only).
- Demos: `swapi.mateu.io` (root → Swagger UI) and `demo.mateu.io` — redeploy of `demo-vaadin-webflux` on alpha.414
  (index page + counter fix) pending; ops in [`../../deploy/demos/README.md`](../../deploy/demos/README.md)
  (needs the owner's machine: kube context, Docker Hub, Netlify).
- Owner-side pending: mobile store accounts (Apple Team ID, App Store app id, Android SHA-256, upload credentials,
  privacy policy URL); GitGuardian incident to mark as test credential.
- Known follow-ups not yet scheduled: flaky .NET `ActionCatalogueTests`; RN module-wide registries should be
  per-session; Java manifest settings only from system properties/env; Redwood federation doesn't know static remotes
  or remote custom elements; console registry (`design/control-plane-and-newsletter.md`) queued.


## Walkthrough results so far (branches pushed, not integrated yet)
| area | branch | matrix | ✅ | 🔧 fixed | ❌ owner | not walked |
|---|---|---|---|---|---|---|
| app shell & navigation | `walkthrough/app-shell` (16 commits) | `design/walkthrough/app-shell.md` | 63 | 33 (11 bugs) | 5 | RN, IntelliJ, static bundles, .NET in a browser, MicroFrontend, breadcrumbs, appState/appData in a browser, visual editor |
| actions, events, overlays | `walkthrough/actions` (10 commits) | `design/walkthrough/actions.md` | 54 | 22 (14 bugs) | 3 | 170 cells ⏳ (mostly RN, IntelliJ, ports beyond unit level, static bundle, editor) |
| forms, fields, layouts, wizards | `walkthrough/forms` (14 commits) | `design/walkthrough/forms.md` | ~45 ✅/🔧 of ~60 | 24 bugs | 6 | ~25 cells: RN, IntelliJ, visual editor, ImportWizard, YAML layout bound to a view model in a browser, Quarkus/Micronaut/Helidon locally (CI covers), static bundle beyond a unit test |
| page archetypes & display | `walkthrough/pages` (29 commits) | `design/walkthrough/pages.md` | ~130 | ~30 (26 bugs) | 7 | ~60: mostly .NET/Python pages in a browser, MicroFrontend |
| listings · authoring · native-ports | `walkthrough/<area>` | — | running, hard stop 03:00 13 Oct | | | |

Each matrix file lists every cell; the ⏳ / "not walked yet" cells are where to resume (same brief).

## Pending owner decisions (with the proposal to apply if Miguel agrees)
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
11. **Redwood bugs to fix** (not decisions): embedded components held by a form field aren't drawn (needs Redwood island support); the drawer stays hidden after a dialog opened over it is closed; Amount edits send a bare number (verify server side); a `Callable<Component>` holder field isn't drawn in a plain form; no `@Toc` index; separator line invisible; calendar event click runs nothing; map marker click unconfirmed; Gantt negative-width console errors; **every Redwood shell page load returns a 400 'invalid catalog JSON'** (check before any Redwood demo). IntelliJ: Gantt/Kanban/PlanningBoard/MatrixGrid squeezed to a few px on long pages. RN web: calendar nests buttons (warning).

## Known doc/CLAUDE.md corrections to apply at integration
- `parity.md` claimed full server+YAML parity for the ports; it wasn't true (fixed in walkthrough/pages) and Python still lacks `Card` — keep parity.md honest.
- Tooling: `npm ci` for the Redwood workspace wipes the other workspaces' node_modules and vice versa; RN `MateuViewController.test` fails on the local Node.
- Behaviour change (walkthrough/forms): `@Button`/`@Toolbar` actions now get "There are validation errors" when the form breaks a bean-validation constraint (server re-checks what the browser enforced). Mention in the release notes.
- Field types are read only from `specs/ui/types.yaml`; a Types file created from the IDE wizard under another name is silently ignored → fix or document.
- `Callable<String>` renders as an empty editable text box; number fields store strings like "19.95" in the browser state.
- CLAUDE.md says `@Action(runOnEnter=true)` exists — it doesn't; `shortcut = "enter"` is the way.
- CLAUDE.md's description of the Vaadin `@AppContext` picker is out of date: the shell uses the shared `mateu-app-context-picker`.
- CLAUDE.md says core's JaCoCo floor is 75 %; the pom has 84 %.
- Redwood pre-selects the first option of each context picker; Vaadin leaves it empty (decide which is right).
- `renderer/layout-sizing.spec.ts` only skips geometry checks when the project is named `renderer-vb` (test issue).

## Budget (owner, 2026-10-12)
Weekly usage 33 % at Mon 18:15 (resets Sun 19 Oct 09:00). Cap: ≤ 60 % before Friday. **Thursday 15 Oct: important demo** — Tue/Wed are for securing it. Coverage paused; refactor + pre-beta review the weekend of 17–18 Oct with what's left. Ask Miguel for `/usage` before launching anything big.

## What needs Miguel's machine vs what can run anywhere
- **Anywhere** (a cloud session on claude.ai/code with this repo): the walkthrough, coverage, refactor, docs,
  integration batches, releases (`gh`), anything in this repo.
- **Only the owner's machine**: redeploying the demos (cluster context, Docker Hub push, Netlify DNS), the IntelliJ
  sandbox for manual testing, emails, the `frontend-public-reference` repo.

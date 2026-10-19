# Road to beta/GA — status and how to resume

Live progress page (updated by the working session as it advances): https://claude.ai/artifact/UeYCtDuoXftPbvZQRRwLZr — republish it from `scratchpad`-style source or rebuild it from this file.

This file is the hand-off point: any session (local, at work, or a cloud session on claude.ai/code) can
continue the work from here. **Update it at the end of every block of work.** **3.0-beta.1 released 2026-10-18** (owner's go; GA after a few weeks of beta with no blocker, japicmp enforcing, a second independent review). Last update: 2026-10-18 (phase 4 — refactor, seven streams R1–R7 — plus the Fable review fixes F1–F8, `fixes/extra` and `fixes/natives2` integrated locally on `integration/beta` on top of origin/master = alpha.425, pending CI; beta candidate = v3.0-alpha.426).

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
3. **Coverage** ✅ written and **integrated, pending CI** (2026-10-17: `integration/coverage`, see "Coverage integration"
   below) — measured in [`../coverage/coverage-map.md`](../coverage/coverage-map.md): 8 streams S1–S8, floors raised.
4. **Refactor/optimization** ✅ seven streams R1–R7 **integrated, pending CI** (2026-10-18: `integration/beta`, see "Beta integration" below).
5. **Deep independent review by Fable** ✅ done 2026-10-17 (see "Fable review" below; fixes F1–F8 integrated on `integration/beta`) (owner, 2026-10-12): at the very END, after the refactor, before GA — a different model with fresh eyes over the whole product (public API + stability, security, wire contract + Java/.NET/Python parity, core architecture, docs-vs-reality, a new developer's first hour). Runs on the separate Fable weekly quota (`model: "fable"` agents). Its report becomes the GA blocker list.
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
- **Beta candidate integrated, pending CI** (2026-10-18): local branch `integration/beta` = origin/master (alpha.425)
  + refactor R1–R7 + review F1–F8 + `fixes/extra` + `fixes/natives2` (contains R6) + three leftover branches
  (`beta/l1`–`l3`), bundles rebuilt once, every gate green locally (see "Beta integration" below). Next: push,
  ONE PR, merge when green, release **v3.0-alpha.426** with `notes-426` (the release notes file written by the
  session; CHANGELOG has the same section), then the pre-beta review with Miguel.
- Latest release: **v3.0-alpha.422**. Demos were last redeployed on alpha.414 (image tag 2026.10.12b) and verified in a browser.
- **Phase 2 (walkthrough) integrated, pending CI**: local branch `integration/walkthrough-2` = origin/master + `walkthrough/authoring`
  + `walkthrough/native-ports` + `ga/control`, conflicts resolved keeping both sides' fixes and tests, bundles rebuilt once, every
  suite green locally (see "Batch 2 integration" below). Next: push, one PR, merge when green, then the phase release.
- **Batch 3 integrated, pending CI**: local branch `integration/batch-3` = origin/master + `pending/natives` + `pending/decisions`
  + `pending/redwood` (see "Batch 3 integration" below). Both batches start from origin/master (#812); push batch 2 first, then
  rebase or merge batch 3 on it — they do not overlap in code (batch 3 touches the ports' titles/banners, listings, Redwood).
- **Batch 3 merged** (PR #813 on master).
- **Phase 3 (coverage) + bug-fix batch integrated, pending CI** (2026-10-17): local branch `integration/coverage` =
  `origin/master` (incl. #813) + `coverage/s1`…`coverage/s8` + `fixes/groups` + `fixes/core` + `fixes/fields` +
  `fixes/web2` (contains `fixes/web`), bundles rebuilt once, every gate green locally (see "Coverage integration" and
  "Bug-fix batch integration" below). Next: push, one PR, merge when green, then the phase release.
- Open PRs: #800 (coverage map, docs only).
- Demos: `swapi.mateu.io` (root → Swagger UI) and `demo.mateu.io` — redeploy of `demo-vaadin-webflux` on alpha.414
  (index page + counter fix) pending; ops in [`../../deploy/demos/README.md`](../../deploy/demos/README.md)
  (needs the owner's machine: kube context, Docker Hub, Netlify).
- Owner-side pending: mobile store accounts (Apple Team ID, App Store app id, Android SHA-256, upload credentials,
  privacy policy URL); GitGuardian incident to mark as test credential.
- Known follow-ups not yet scheduled: flaky .NET `ActionCatalogueTests`; RN module-wide registries should be
  per-session; Java manifest settings only from system properties/env; Redwood federation doesn't know static remotes
  or remote custom elements; console registry (`design/control-plane-and-newsletter.md`) queued.


## GA docs + SBOM (`close/gadoc`, 2026-10-18, on v3.0-beta.2 — local, not pushed)
- **Known issues** page (`reference/known-issues`): the user-facing limitations gathered from this file,
  parity.md (🟡/— rows), CLAUDE.md "KNOWN"/"not yet" notes and the production checklist, each with a
  workaround — servlet context path, Micronaut JDK 21–23 pinning, Helidon SE routes without principal,
  SSE buffering, cosmetic permissions in static bundles/Play, Vaadin foldouts start expanded, Redwood
  light-only + federation (static remotes / remote custom elements), remote `Element` scripts need the
  remote's CORS, multi-value `optionsSource`, RN session-scoped saved views/column choices, touch/desktop
  adaptations, the ports' Java-only list (EditableView family, class `@AutoSave`, `@ViewToolbarButton`,
  `type: AppShell`, bundle exporter, Dialog placement…), .NET 8 end of support, tooling ranges.
  **Keep it current**: an item leaves the page in the release that fixes it.
- **Support policy** page (`reference/support-policy`), linked from SECURITY.md and stability-and-versioning.
  **Owner to confirm the proposed defaults**: bug fixes only on the latest 3.x minor; security fixes
  (critical/high) also on the previous minor for **6 months** after the next minor; the last 3.x minor gets
  security fixes for **12 months** after 4.0; betas fixed only in the next beta. SECURITY.md's table was
  aligned to it. Platform matrix read from the build: Java 21+ (CI 21), Boot 4.x (4.1), Quarkus 3.x (3.38),
  Micronaut 4.x (4.10), Helidon MP 4.x (4.5), net8.0+net10.0, Python ≥ 3.11 (CI 3.11–3.13 + lowest deps),
  Expo SDK 57 / RN 0.86, IntelliJ 252–253.*, VS Code ≥ 1.85, Node 24 only to build from source.
- **SBOMs**: `scripts/release-sboms.sh <tag> <dir>` (CycloneDX 1.6 JSON: maven-plugin 2.9.1 aggregate over
  backend/ minus integration-tests/coverage, test scope out; cyclonedx-npm 6.0.1 from the lockfile for
  workspaces mateu-vaadin + mateu, prod only; cyclonedx-bom 7.5.0 over a venv holding the wheel; dotnet
  CycloneDX 6.3.1 on Mateu.AspNetCore with project references) + a new `sbom` job in
  `buid-and-publish.yml` (needs e2e, its own `contents: write`, uploads `mateu-<v>-{maven,web-renderer,
  python,dotnet}.cdx.json` with `gh release upload`). Verified locally end to end in a throwaway worktree
  (419 / 393 / 12 / 6 components; ~50 s warm); actionlint clean except the pre-existing SC2034 in
  bump-examples' wait loop. Not proven in CI until the next release.
- Beta release-notes template: `design/ga-plan/beta-release-notes-template.md` (links Known issues,
  Support policy, the SBOM assets); `release-notes-3.0.0.md` "Known edges" points at the page.

## Beta integration (phase 4 refactor + Fable review fixes, 2026-10-18 — `integration/beta`, pending CI)
Merged in order r3, r1, r2, r4, r5, `fixes/natives2` (⊃ r6), `fixes/extra`, f8, f4, f3, f5, f6, f2, f1, f7, r7.
Notable conflict resolutions:
- Redwood poc vs R6's comment translation (`fixes/extra`, f1, f5): kept the fixes' code, translated their Spanish
  comments; `rules.mjs` kept R4's evaluator (its regex literals already cover `fixes/extra`'s `@Pattern` case);
  the test script runs both `test-conformance` (R4) and `test-security` (F1).
- `mateu-field.ts`: R5's split kept, F1's markdown-as-data change re-applied in `fields/readOnly.ts`,
  `fields/string/markup.ts` and the lazy registry (`mateu-markdown` instead of `vaadin-markdown`).
- Conformance lists (Java/.NET/Python) and fixtures: union of F5's second-request cases and F6's ported
  components → 52 cases, identical ×3 under F5's normaliser.
- CHANGELOG: F2's entries under F8's new structure; parity.md / wire-specification.md / filters-and-listing.md
  unions of F3+F5 / F5+F7 / F4+F7.
Integration fixes (one commit each): BundleEndpoint → R2's top-level `BundleManifest`; `RunMethodActionRunner`
reads state through `ComponentState` (`ComponentStateHelper.getState` now for removal); request-language lookups
(`ValidationLocale`, `TranslatorContext`) use `getSingletonBean` (RequestBudgetTest); six reviewed edges added to
the CoreLayeringTest allow-list (F2 settings/advertised actions, `fixes/extra` ValidationLocale); wire-schema.json
regenerated for F3's `info` toast; adapters' parity tests expect the manifest's `"3.0"`; info/primary toast
colour as a token; IntelliJ overlays render in place when headless (new drawer/generic-components cases threw
`HeadlessException`); a .NET EntityIds test (Uidl branches had dropped to 89.97 % < 90); CI's Redwood coverage
step now runs `test-conformance` + `test-security` (it ran neither; function coverage was under 95 without them).
Leftovers fixed: SpecsIndex jar scan no longer closes the JVM-cached JarFile (+ concurrency test); the bundle
endpoint's error body goes through the error boundary; the `infra/compiler` exclusions removed; design tokens
locked at 549; exportBundle.ts comment; F1 (port index pages without markers + Mateu favicon, demo sites and
the lib dev page icon, Redwood header-widget links as route hrefs, RN + IntelliJ credential scope); F3's
HAMBURGUER warning test in `ProcessWideStateCollection`; F7 (CRUD import fetch path, demos off
`HAMBURGUER_MENU` / `@KeycloakSecured`, `DashboardLayout`/`ContentLayout` `since=3.0-alpha.348, forRemoval`);
R7 finding 2 = **ours**: seven core registries did their one-time load (I/O + logging) inside `synchronized`
on the request path → virtual-thread pinning deadlock on Micronaut (JDK 21); now a `ReentrantLock`
(+ `RouteRegistryLoadLockTest`); `MicronautBeanProvider.getBean` uses `findBean` (a miss no longer builds a
logged exception); INFO `logback.xml` in micronaut-app1 and the starter; micronaut.md documents JDK 21–23
pinning (`micronaut.executors.blocking.virtual=false` or JDK 24+). Verified: 6/6 cold bursts of 40, 4 workers ×2.
Floors (measured → set): core 89.4 L / 77.9 B (89/77, unchanged); uidl 50.6/30.7 → 50/30 ↑; adapters' BRANCH
floors **lowered by the minimum** — mvc 84.3 → 84, webflux 83.96 → 83, micronaut 80.95 → 80, quarkus 75.0 → 75,
helidon 77.8 → 77 (each exactly one covered branch short after R3 moved MateuBundleController's branches to
core; reason in each pom); .NET Uidl 99.1/90.8 · Core 96.4/85.2 · Dtos 99.9/100 · AspNetCore 98.3/86.0
(unchanged); Python 95.5 L / 88.3 B (unchanged); libs/mateu 93.0 L / 81.3 B → 93/81 ↑; apps/vaadin
86.9/86.1/82.4/75.6 → 86/86/82/75 ↑; visual editor 80.7/78.2/76.7/70.2 (unchanged); Redwood poc 98.2 L /
85.2 B / 95.4 F → 98/85/95 ↑; RN 98.9/89.6/95.9 → branches 89 ↑; IntelliJ Kover 69.3 → 69 ↑; lint ceiling
420 → 376.
Tests (all green): Java 2874 (core 2273, japicmp `-Dmateu.api.enforce=true` on dtos+uidl+core ✅), .NET 988
(net8), Python 1061 (3.12 and 3.14) + mypy clean, libs/mateu 2242, apps/vaadin 305, visual editor 484, VS Code
175 (+ package), RN 559 + tsc + parity, Redwood 17 suites + make-html/nls/amd checks + parity, IntelliJ 459
(1 skipped) + koverVerify, MCP, prompt-to-app, Figma plugin. E2E via `scripts/ci-e2e-leg.sh` (offset 12720 →
ports 20800–20806): core 628 + 1 skipped (mvc-app1, journeys, renderer-vaadin, federations, yaml-federation),
slow-network 10/10, axe 0 violations on 16 routes; webflux-quarkus 992 + 12 skipped; micronaut-helidon 992 + 12
skipped; renderer-vb (one worker): vb-smoke 11/11, vb-a11y 10/10, vb-slow-network 8/8, Playwright 65 + 1 skipped.
Not run locally: the .NET net10.0 leg, the Python wheel / lowest-deps / 3.11 / 3.13 jobs, CI itself (R7's legs
are first proven by the PR run).

## Fable review (2026-10-17) — verdict and what was done
Verdict: **ready for a public beta after the four blockers; not ready for GA** (BLOCKER 4 · MAJOR 27 · MINOR 34;
report kept in the session scratchpad, `review/fable-ga-review.md`). All four blockers fixed: B1 data HTML
allow-list (F1), B2 CSRF auto-exemption + docs (F2), B3 .NET Save/Delete refuse (F3), B4 doc samples (F7).
MAJORs fixed: M-S1 strict default, M-S2 settings from framework config, M-S3 mass assignment, M-S4/S7 HTML/URL
sinks, M-S5 credential scope (web, Redwood, RN, IntelliJ), M-S6 active documents, M-S8 unknown action = 403 ×3,
M-S9 Python gates (F1/F2/F3); M-A1/A2(part)/A3/A4/A6/A7(part)/A8 (F3/F4); M-A5 parity: honest page + ported
toolbar/triggers/help/hints/generic components (F5/F6); M-W1 wire-schema.json, M-W2 absent==default contract +
second-request cases, M-W3 Result/Stepper deprecated + web wire-type gate (F5); M-D1–D4 (F7); M-F1, M-X2 (F8);
M-X1 wording + CoreLayeringTest (F7/R2). MINORs 1–4, 7–18, 21–24, 26, 28, 30–34 fixed. **Still open (bugs, not decisions): MINOR 5** (React Native
opens any URL scheme from data — route through `safeLinkUrl`) **and MINOR 6** (IntelliJ puts html/richText values
raw into `JEditorPane`, browses any scheme) — native-renderer hardening for the next batch; MINOR 25 was N/A.
**Owner decisions — resolved 2026-10-18 (delegated by the owner, alpha.429):**
- M-A2 rest ✅ .NET `Mateu.Core` engine is `internal` (50 → 7 public types + 6 forwards; `InternalsVisibleTo`
  Mateu.AspNetCore + tests; surface pinned by `PublicSurfaceTests`).
- M-A7 rest ✅ Python: one top-level package `mateu_ui.{uidl,dtos,core,fastapi}`; the old four names are
  deprecated aliases of the same modules for the whole 3.x line.
- MINOR 20 ✅ decided: SPI signatures are KEPT for 3.x (changing them breaks implementers); revisit for 4.0.
- MINOR 29 ✅ the Redwood jar no longer ships Oracle's starter `index.html`: `scripts/index-page.mjs` writes
  `_index.html` from build facts only (CDN URLs, runtime settings, bundle map).
- MINOR 27 ✅ renderer jars ship each asset once, under `static/` (Quarkus serves it via `ClasspathAssets`).
- Still the owner's: git history hygiene (an internal hostname in the history of the removed
  `backend/probe-tmp.mjs`) — recommendation: do NOT rewrite (force push breaks clones/forks/tags); and the
  external accounts (PyPI/NuGet/npm secrets, mobile stores).
- MINOR 19 (port string APIs where Java has enums), the Java-only wire types beyond those F6
  ported (listed honestly in parity.md).

## Coverage integration (phase 3, 2026-10-17 — `integration/coverage`, pending CI)
Merged in order s2, s1, s3, s4, s5, s6, s7, s8 on top of `origin/integration/batch-3`. The only textual conflicts were the
§1 rows of `design/coverage/coverage-map.md` (union, each stream's row replacing the old one); `run_tests.yml` (S2/S4/S7/S8)
and `WireConformanceTest.java` (S1+S4) merged cleanly with both sides' steps/cases. Generated bundles rebuilt once.
Integration fixes (one commit each):
- **libs/mateu floors were measured on a stale vitest 3.2.4** left in S5's worktree; the lockfile (= CI) installs 4.1.11,
  which reports 92.8 L / 91.1 S / 88.3 F / 80.9 B on the same sources and the same 2039 tests → floors 92/91/88/80.
- **mvc-core branch floor 86 → 85**: one `YamlMountCondition` outcome is environment-dependent (85.2% here, 86.1% in S3).
- **IntelliJ `ConformanceCorpusRenderTest`** asserted every corpus case paints something; S4's new `crud-search` case is a
  data-only answer → only cases carrying a component must render.

| area | before (coverage map, 2026-10-12) | after (measured on `integration/coverage`) | floor now |
|---|---|---|---|
| Java `shared/core` | 84.7 L / 70.1 B | 89.3 L / 77.7 B (2155 tests) | 89 L / 77 B |
| Java `shared/uidl` cross-module | 84.2 / 70.6, no gate | 88.2 / 73.7 (`backend/coverage`) | 87 / 73 |
| Java `shared/dtos` cross-module | 78.4 / 57.5, no report | 84.6 / 87.4 | 84 / 87 |
| Java AP core / indexer | 73.5 / 53.5 · 67.8 / 65.8 | 95.1 / 82.0 · 97.8 / 94.7 | 95 / 81 · 97 / 94 |
| Java mvc / webflux / micronaut | 70.6 · 79.1 · 85.0 L | 88.5 / 85.2 · 95.0 / 84.9 · 92.4 / 82.2 | 88/85 · 95/84 · 92/82 |
| Java quarkus / helidon-mp | 86.5 · 83.2 L | 92.4 / 76.5 · 91.6 / 78.8 | 92/76 · 91/78 |
| Java bundle plugin | 59.9 / 50.3 | 90.1 / 75.4 | 90 / 75 |
| .NET (net8.0) | 94.0 / 79.5 | Uidl 98.9/90.7 · Core 96.2/84.8 · Dtos 99.9/100 · AspNetCore 98.3/84.9 (898 tests) | 98/90 · 96/84 · 99/95 · 98/84 |
| Python | 93.8 / 83.9 | 95.4 / 88.1 (955 tests; 3.12 and 3.14) | 95 L / 87 B + combined 93 |
| Conformance corpus | 36 cases | 39 (+ crud-search, wizard, rest-source) | exact match ×3 |
| `libs/mateu` | 65.8 L / 51.8 B | 92.8 L / 80.9 B (2039 tests) | 92 / 91 / 88 / 80 |
| `apps/vaadin` | 35.2 / 27.4 | 86.4 L / 75.1 B (246 tests) | 86 / 85 / 80 / 74 |
| `apps/visual-editor` | 66.9 / 59.5 | 80.7 L / 70.2 B (484 tests) | 80 / 78 / 76 / 70 |
| Redwood `poc/` | 95.2 / 79.3 | 98.0 L / 84.3 B / 95.3 F (+ VB chains harness, projections) | 97 / 84 / 95 |
| React Native `.ts` | 95.5 / 85.1 | 98.6 L / 86.3 B / 95.5 F (375 tests) | 98 / 86 / 95 |
| IntelliJ plugin | 48.6 | 66.1 (Kover, 426 tests) | 65 |
| VS Code extension | 96.2 / 79.3 | 97.2 L / 80.5 B | 97 / 92 / 96 / 80 |
| E2E | shared suite only | shared (494/adapter) + `journeys` (30 run, 6 fixme) + slow-network probe + axe audit in CI | green |

Verified locally (JDK 21, node 24, .NET net8 only): backend `mvn verify` over the CI `-pl` list incl. `coverage`; the web
job (licences, design tokens, lint, lib build, three `test:coverage`, vaadin tsc/build/bundle budget); tooling job (Redwood
15 suites + make-html/nls/amd checks + parity, MCP, prompt-to-app, RN tests + parity + tsc, VS Code incl. package, Figma);
IntelliJ `test koverVerify`; .NET tests + line/branch floors; Python pytest + `[tool.mateu.coverage]` + mypy on 3.12 and 3.14;
e2e mvc-app1 shared + journeys + renderer-vaadin (581 passed, 5 fixme skipped), slow-network 10/10, axe 0 violations on 16
routes; renderer-vb: vb-smoke 11/11, vb-a11y 10/10, vb-slow-network 8/8, Playwright 65 (serially, as CI runs it).
Not run locally: the other four adapters' shared suite, federation/YAML-federation projects, `journeys/yaml-proxy.spec.ts`
(its upstream port 19395 is outside this session's port block), the net10.0 leg, `dotnet pack`, the Python wheel and
lowest-deps jobs.

### Bug-fix batch integration (2026-10-17, on `integration/coverage`, pending CI)
Merged in order: `origin/master`, `fixes/groups`, `fixes/core`, `fixes/fields`, `fixes/web2`. Conflicts and their
resolution:
- `react-native/.../CrudRenderer.tsx` (groups vs S7's `crudListing` extraction): kept S7's imports + `flattenColumnGroups`.
- MCP search in `McpService.cs` / `mcp.py` (S4 and fixes/core fixed the same bug): one state seeding per port (.NET
  fixes/core's, Python S4's, which its test pins: no filters → state `None`).
- `MateuViewController.test.ts` and Redwood `core/content.mjs` (S7/S5 vs fixes/web2): union of tests and imports.
Integration fixes (one commit each):
- `WireDiscriminatorsTest` (S2): `GridGroupColumnDto` out of `KNOWN_UNREGISTERED` and `KNOWN_STRANGERS` dropped —
  fixes/core unregistered `BreadcrumbDto`; the Redwood/RN coverage maps lose `Breadcrumb` (parity.md regenerated).
- .NET `McpTests`: two `McpBooks` fixtures (S4 + fixes/core) → S4's is `McpFilteredBooks` at `mcp-filtered-books`.
- Stability page regenerated (fixes/fields added a public type to the crud archetype package).
- libs/mateu S5 poll test followed the fixed `scheduleOnload` contract (fires while connected on the same view).
- **Two web regressions the S8 journeys caught** (fixed in `ComponentElement`, +3 unit tests): "Save and next" in
  the create/edit drawer kept the PREVIOUS record's typed title (the drawer form is now its own component and
  restored local edits over a new server seed); and a listing an action returns in place (a drop, "Add a row")
  kept stale rows — the OnLoad counts were carried over the re-render (the shared `returned-listing-reloads.spec`
  fixes/web2 added failed too). OnLoad counts are now carried only when no user write happened since the last render.
- Journeys: every `test.fixme` un-fixme'd and passing; the drawer's required field is now refused in the browser
  (aria-invalid) instead of by a server banner; `shared/optimistic-lock.spec.ts` (fixes/fields) duplicated the
  journey's lock tests on its own fixtures (both mvc-app1 only) → its one extra case (drawer Reload) moved into
  `journeys/crud.spec.ts`, the spec and its `LockedArticle*` fixtures removed.

Floors after the batch (all met, none lowered): core 89.4 L / 77.7 B; uidl/dtos/AP/adapters/bundle plugin as in the
table above; .NET Uidl 98.9/90.7 · Core 96.2/85.0 · Dtos 99.9/100 · AspNetCore 98.3/84.9; Python 95.4 L / 88.1 B;
libs/mateu 92.9/91.2/88.4/81.0; apps/vaadin 86.5/85.6/80.9/75.2; visual editor 80.7/78.2/76.7/70.2; Redwood poc
98.0 L / 84.3 B / 95.2 F; RN 98.5/86.3/95.4; IntelliJ Kover 66.2. Tests: Java 2782 (core 2208), .NET 910 (net8),
Python 971 (3.12 and 3.14), libs/mateu 2069, apps/vaadin 252, visual editor 484, VS Code 175, RN 382, Redwood 15
suites, IntelliJ 433, MCP 19, prompt-to-app 8. E2E: mvc-app1 shared 501, journeys 37 (0 fixme; serial — with
several workers the files reset each other's fixtures, CI runs one), renderer-vaadin 60, slow-network 10/10, axe 0
violations on 16 routes; renderer-vb: vb-smoke 11/11, vb-a11y 10/10, vb-slow-network 8/8, Playwright 64 + 1 skipped.
Not run locally: the other four adapters' shared suite, federation/YAML-federation projects, the net10.0 leg, the
Python wheel and lowest-deps jobs (`dotnet pack` was run).

### Production bugs found by the coverage streams — fixed
All of S1–S8's list, by `fixes/groups` (grid column groups everywhere), `fixes/core` (MCP: `Crud` projection,
filtered search with rows, screens under an app shell, `@EyesOnly` actions hidden; menu/AppShell routes under a
mount routed once; YAML shell remote deep links; OpenAPI path parameters; `Hydratable` order; `@Composition`;
master/detail selected button; LongTask text English + translatable; `BreadcrumbDto` unregistered; dead Helidon
provider removed), `fixes/fields` (`BigInteger`/`Date`/`java.sql.Date`/`ZonedDateTime`/`File`/`Status`/`Optional`
fields; `@Version` never an input; the optimistic-lock dialog sends the form's state, in English and translatable;
`@SeparatorBefore` in a `@Tab`; Vaadin drawer client validation; bare definition-only Form with a Text pinned),
`fixes/web` + `fixes/web2` (`?.` in validations; polls on fragment-filled elements; button routes with a missing
value; `updateMedata`; read-only password masked (Vaadin, Redwood); REST blank sorting; by-ref REST sources on
pages with no app shell — `UIIncrementDto.restSources`, all servers and renderers) and this integration (Save and
next; a returned listing reloads its rows).

### Still open
- Redwood create/edit drawer client validation; Bean-validation (Hibernate) message locale; window title of a
  definition-only page — another agent is on these (`fixes/extra`, not part of this integration).
- Redwood Gantt issue: not reproduced.
- npm / PyPI / NuGet packaging of the renderers: owner.

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

### Left for the next session
- **Beta candidate**: push `integration/beta`, ONE PR, merge when green (R7's e2e legs and the `e2e` summary
  check run for the first time there; if a leg flakes, rerun only it), then cut **v3.0-alpha.426** with the
  session's `notes-426.md` (same content as the CHANGELOG section) and run `scripts/bump-example-version.sh`
  once Central serves it (the release workflow now does it too, F8).
- Remove the merged local branches' worktrees (`mateu-wt-r1`…`r7`, `-f1`…`-f8`, `-fix-*`, `-beta-l1`…`l3`).
- Pre-beta review with Miguel: the owner list in "Fable review" above, plus the Micronaut SUT choice (virtual
  threads left on so e2e exercises the default; `micronaut.executors.blocking.virtual=false` is the one-line
  hardening).
- Known follow-ups not scheduled: the .NET net10.0 leg and Python 3.11/3.13 + wheel jobs only run in CI;
  Redwood federation (static remotes, remote custom elements); console registry; npm/PyPI/NuGet packaging of
  the renderers (owner).

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

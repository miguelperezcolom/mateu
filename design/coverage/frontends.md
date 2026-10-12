# Test coverage review — frontends and end-to-end (GA plan, phase 2)

Branch `test/coverage-frontends` (2026-10-11/12, merged with master at v3.0-alpha.411). The goal was
not a percentage: every behaviour a user relies on should be pinned by a test that fails when it
breaks. Numbers are the means to find what is not.

## 1. Before / after

| Suite | Tool | Before (lines / branches / functions) | After | Tests before → after | Gate in CI |
|---|---|---|---|---|---|
| `libs/mateu` (shared web lib) | vitest v8 | 58.3 / 45.2 / 44.1 | **65.4 / 51.0 / 52.8** | 1181 → 1333 | thresholds 64/63/51/50 (lines/stmts/funcs/branches), was 56/55/41/42 |
| `apps/vaadin` | vitest v8 | 13.8 / 8.7 / 6.1 | **35.8 / 28.0 / 24.7** | 16 → 81 | 35/35/24/27, was 13/13/6/8 |
| `apps/visual-editor` | vitest v8 | 43.1 / 41.8 / 37.7 (unmeasured in CI) | **60.2 / 53.9 / 49.5** | 320 → 351 | NEW: 59/58/49/53 (`npm run test:coverage`) |
| `apps/redwood/poc` (core + DOM wiring) | node runner (c8-equivalent) | 87.1 / 78.5 / 85.2 | **94.6 / 78.8 / 92.0** | 7 suites in CI (3 never ran) → 10 suites | NEW: lines 94 / functions 91 / branches 78 |
| VS Code extension | vitest v8 | 52.7 / 52.1 / 54.0 (unmeasured) | **96.3 / 79.7 / 94.4** | (not counted) → 152 | NEW: 96/91/94/79 |
| React Native (pure .ts) | node runner | 94.8 / 82.7 / 93.0 *(loaded files only)* | **95.0 / 84.5 / 94.8**, now incl. the 1k-line controller and the evaluator | 162 → 214 | NEW: 93/84/93 |
| IntelliJ plugin | Kover (new) | 31.3 lines | **47.9 lines** | 219 → 292 | NEW: `koverVerify` minBound 47 |
| Node MCP sidecar | node --test | — | — | 14 → 15 | (existing step) |
| Playwright e2e | — | 9 projects | 10 projects (+`yaml-federation`, 7 specs) | | runs in the `e2e` job |

Notes on the measures:
- React Native: node only counts files a test imports, so the "before" figure hid the untested
  `MateuViewController.ts` (1,010 lines) and `expressions.ts`; both are now loaded and covered (95% /
  99.6%). The `.tsx` components remain untested (no RN test renderer in the repo).
- Redwood: c8 treats every file as "external" under a path containing `.claude` (worktrees); node's
  own runner does not and agrees with c8 elsewhere, so the gate uses `node --test
  --experimental-test-coverage` running each plain-script suite as a test file.
- IntelliJ: nothing is excluded; the IDE glue that cannot run headless (dialogs, wizards, tool-window
  factories, `MateuProjectService`, `RenderProbe`) still counts and is most of the remaining gap.

## 2. Risk map (renderer × feature)

✅ pinned by unit + e2e/probe · 🟡 partly (unit only, or happy path only) · ❌ not pinned · — n/a

| Feature (CLAUDE.md inventory) | Vaadin / web | Redwood (VB) | React Native | IntelliJ |
|---|---|---|---|---|
| Forms, field kinds, validation (incl. focus-first-invalid) | ✅ (mateu-field branches, a11y e2e) | ✅ (contract + a11y probe) | 🟡 (controller refusal + announce) | ✅ (FormFieldRenderTest, corpus) |
| Listings: filters / smart search bar / chips | ✅ (filter-bar suite, listing-url-filters e2e) | 🟡 (contract) | 🟡 (restListing) | 🟡 (CrudListingRenderTest) |
| Saved views / column chooser | ✅ unit | 🟡 | ✅ unit | — |
| CRUD lifecycle (create/edit/delete), drawer CRUD, optimistic-lock dialog | 🟡 (API specs + full-crud/new; no full browser journey) | 🟡 | 🟡 | 🟡 |
| Wizards (incl. branching, cross-step state) | 🟡 (core sync tests; no browser journey) | 🟡 | ❌ | ❌ |
| Archetypes (dashboard, collection detail, item overview…) | ✅ (layout-sizing e2e) | ✅ (test-patterns, now in CI) | 🟡 (patternGaps) | 🟡 |
| Drawers / dialogs / focus trap | ✅ (mateu-dialog suite + a11y e2e) | ✅ (a11y probe) | 🟡 | 🟡 |
| App shells, menus, card menus | ✅ | ✅ | ✅ (menuCards) | ✅ (AppShellRenderTest) |
| Command center / app context / header actions | ✅ unit (command-center, stores, bell, header actions) | 🟡 | 🟡 | ✅ (AppContext selector) |
| Documents download / print | ✅ unit (documents.ts 91%) | 🟡 | ✅ (controller DownloadFile/Print) | 🟡 |
| Live reload client | ✅ unit; `live-reload-probe.mjs` by hand | ✅ (test-live-reload, now in CI) | — | ❌ |
| Slow-network resilience | ✅ unit; `slow-network-probe.mjs` by hand | ✅ (vb-slow-network-probe in CI) | 🟡 | ❌ |
| a11y behaviours | ✅ (accessibility.spec, 8 axe routes) | ✅ (vb-a11y-probe) | 🟡 (`rn-a11y-probe` by hand) | ✅ (names on every input/button over the corpus) |
| i18n chrome texts | ✅ (lint widened — it now catches attributes and longer sentences) | ✅ (make-nls --check) | 🟡 | 🟡 |
| Expression evaluator sandbox / RunJS opt-in | ✅ (expression + strict-csp e2e) | ✅ | ✅ (sandbox fixed, see §4) | ✅ (ExpressionsTest) |
| safeNavigate / safeHref | ✅ | ✅ (elements sanitising) | 🟡 | — |
| Static bundle + specsOnly expander + bundleStore | ✅ (static-vcn e2e + unit) | 🟡 | — | — |
| REST source catalogue client resolution | ✅ (+ remote layers) | ✅ (test-sources, now in CI) | ✅ (restFetch ref + proxy) | 🟡 |
| Federation (RemoteMenu) | ✅ (federation + yaml-federation e2e) | 🟡 (navTree port, no static remotes) | ❌ | ❌ |
| Security: UI hidden by role | 🟡 (core sync tests; no browser spec) | ❌ | ❌ | ❌ |

## 3. End-to-end inventory and what was added

Projects (`e2e/playwright.config.ts`): `mvc-app1`, `webflux-app1`, `quarkus-app1`,
`micronaut-app1`, `helidon-app1` (the same 21 `shared/` spec files, 300+ tests — many of them
wire-level API tests), `fed-shell-app` (5 files), `fed-sections-app` (1), `renderer-vaadin` and
`renderer-vb` (4 renderer-agnostic files), `static-vcn-java`/`static-vcn-yaml` (1), and now
**`yaml-federation`** (1 file, 7 tests). Plus the probes: `vb-smoke`, `vb-a11y-probe`,
`vb-slow-network-probe` (CI job `renderer-vb`), and hand-run `slow-network-probe`,
`live-reload-probe`, `rn-a11y-probe`, `a11y-audit`.

User journeys with NO browser e2e before this review: documents/print, role-based hiding (the new
security model has no browser-reachable identity in the SUTs: they register no `PrincipalResolver`),
live reload (probe only), editor-generated YAML apps served by a backend, a YAML-only federation,
full CRUD and wizard journeys through the UI (covered at the wire level only).

Added: **the YAML-only federation** (below), which also covers "a YAML app served by a backend"
(two of them, one at a nested mount) and "a YAML app shipped static" under federation. The rest are
listed in §6 with the reason they were not done here.

## 4. Bugs found and fixed (each with a test)

Web / shared lib
1. **A nested YAML mount did not work at all** (`basePath: orders`): its page injected a relative
   `baseUrl="orders"`, so from `/orders/list` the client posted to `/orders/orders/mateu/…` (404);
   once that was fixed, every route answered "Page not found" (the client sends routes relative to
   its baseUrl, the registry keys them with the mount on them); at its root the shell was aimed at
   itself and the content slot reloaded it forever. `YamlMounts.uiPath/mountRequest` (applied by the
   5 adapters), `AppHomeRouteResolver.isMountRoot`. Tests: `YamlMountsTest` (+2), e2e.
2. **A federated shell could not mount a static domain**; deep links into one were a 500 (the server
   POSTed to the file host and failed parsing its HTML). `RemoteMenuHandler` mounts a static remote
   for the browser; `bundleStore` answers its loads from its manifest. Tests: `StaticRemoteMenuTest`,
   `bundleRemotes.test.ts`, e2e.
3. **A remote's REST sources never reached the shell**: a federated listing naming its domain's
   source fetched nothing (served or static). Per-remote catalogue layers, and a fetch of a name
   nobody knows yet waits for the remotes still being asked (cold deep link). Tests: unit + e2e.
4. **The page's own bundle answered a foreign remote's menu load** with the shell's own app.
5. **A YAML app shell never offered an unclaimed deep link to its RemoteMenus** (a class-declared
   shell did): a bookmarked page of a remote domain was "Not found". A remote root deep link
   (route = consumedRoute = mount root) answered the remote's shell instead of its `home:`.
6. SSE actions answered 401/403/500 with no stream body were reported as **success**.
7. Hard-coded English (and one Spanish) chrome strings in the filter bar, chat, drawer, Vaadin field
   and tree select — the i18n lint missed them; widened.
8. Notification bell: unread count silent to screen readers; tree select: no `aria-expanded`.
9. Visual editor: a second `listImages`/`listFiles` within the timeout window hung the picker.

React Native
10. The expression evaluator was not sandboxed like the web one: identifiers read `Object.prototype`
    (`${constructor}` rendered `function Object()…`), member access reached `constructor`/`__proto__`.

IntelliJ
11. `rows[1]` indexing read key `"1.0"`; numbers printed `3.0` in text; emptying a number field kept
    the old value; unnamed stepper/textarea editors; mouse-only star rating and eleven mouse-only
    display targets; trailing space on a unit-less MetricCard.

VS Code
12. Reload Screen / readiness poll crashed on an `https` base URL.

MCP sidecar (`frontend/mcp-server`)
13. Messages lost their severity: it read `type`, the wire field is `variant` (errors reached the
    agent as "info"), and dropped the title.

Found, NOT fixed (pre-existing on master): `shared/bulk-action-buttons.spec.ts` › "the selection
guard survives adding an @Action to the button" fails locally on mvc-app1 with master's own bundle
too: the toolbar button's `actionId` (`cancel`) does not match the action the crud advertises
(`nested-form-action-target-cancel`, `rowsSelectedRequired: true`), so `needsSelection` finds no
action and the button stays enabled. Belongs to the web UX review's change (W-V-DELETE).

## 5. The YAML-only federation — verdict

*Question: is a YAML-only console with RemoteMenu over two YAML-only domains, one served and one
static bundle, feasible?*

**Verdict: yes — now.** On master it was not: none of the three legs worked (bugs 1–5 above). With
this branch, the SUT `e2e/sut/yaml-federation` (console :18480, Orders served at `/orders` :18481,
Catalog static + JSON API :18482; no line of UI code anywhere) passes 7/7 Playwright tests:

- the console's menu merges both domains (neither shown unavailable);
- the served domain renders inside the console, its rows read with its own REST source;
- the static domain renders inside the console, its manifest read once with GET and nothing ever
  POSTed to the file host;
- deep links by the console's menu path open the named page in either domain
  (`/orders/list/o2`, `/catalog/products`), and each domain's root opens its home once;
- a URL reached through a served domain's entry survives a reload;
- each domain also stands on its own.

How it is authored: a static domain is a `RemoteMenu` whose `baseUrl` names the bundle's manifest
(`http://host/catalog/manifest.json`); the static host must send CORS headers (a CDN rule).

Limits that remain (documented, not bugs of this branch):
- after clicking an entry the URL is the remote's own route (`/list`, `/products`), as with the
  Java federation; a **reload** of such a URL works for a served domain (the console asks it) but
  not for a static one — the server cannot ask a file host what it claims. Deep links by the menu
  path (`/catalog/products`) work.
- a static domain can only do what a static bundle can: actions with no server behind them fail
  with a clear message (no POST is attempted).
- the Redwood renderer's port of the federation (`navTree` in poc) does not know static remotes;
  React Native and IntelliJ do not federate.

## 6. Remaining gaps (with reasons)

- **Browser journeys for full CRUD (create → edit → delete with the optimistic-lock dialog) and
  wizards**: pinned at the wire level (core sync tests, `shared/` API specs) and in unit suites;
  a browser journey per adapter would add ~5× runtime to the shared suite. Proposed: a single
  `journeys` project against mvc-app1 only.
- **Role-based hiding in the browser**: needs a SUT `PrincipalResolver` that trusts a test header
  (the security model forbids that in real apps) — worth a dedicated SUT, not mvc-app1.
- **Documents/print** e2e: needs a fixture returning `Document`; unit-pinned on web and RN.
- **Live reload**, **slow network** web probes and the **RN a11y** probe run by hand, not in CI
  (they need a dev-mode backend / expo web).
- RN `.tsx` components (no test renderer in the repo) and IntelliJ IDE glue (dialogs, wizards,
  tool windows) are the bulk of the uncovered code on the natives.
- Vaadin overlay widgets (date/time pickers, combo-box), the real `vaadin-grid` and form layout do
  not run under jsdom; covered only by e2e.

## 7. CI changes

All in `.github/workflows/run_tests.yml`, no new job (so `ci-ok`'s `needs:` is unchanged):
visual editor and VS Code run `test:coverage`; Redwood runs its ten suites through node's runner
with a coverage gate (test-live-reload, test-patterns and test-sources never ran before); React
Native runs with a coverage gate; IntelliJ runs `koverVerify`; the `e2e` job builds and starts the
YAML-only federation and runs its project (`YAML_FEDERATION=1`).

## 8. Verification on the merged branch

libs/mateu 1333 ✓, apps/vaadin 81 ✓, visual editor 351 ✓ (all with thresholds), lint 418 warnings
(cap 420), Redwood 10 suites ✓ + make-amd/html/nls/parity checks ✓, React Native 214 ✓, VS Code
152 ✓, IntelliJ 292 ✓ + koverVerify, MCP sidecar 15 ✓, core 1631 ✓; bundles regenerated and
`check-bundle-freshness.sh` OK; shared e2e suite + renderer specs on mvc-app1: 334 passed, 1
failing (the pre-existing bulk-actions one above); yaml-federation 7/7 (×3 repeats); VB probes
(smoke 11/11, a11y 10/10, slow network 8/8).

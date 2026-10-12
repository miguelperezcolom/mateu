# Exhaustive walkthrough — shared brief (read fully before starting)

## Why
Mateu = define the UI once, agnostically (Java / C# / Python code, or YAML, or the visual editor), render it anywhere
(Vaadin web, Redwood/VB, React Native, IntelliJ), served by any backend (Spring MVC, WebFlux, Quarkus, Micronaut,
Helidon MP, ASP.NET, FastAPI) or as a static bundle, federated. Today the owner found, just by USING it, bugs
nobody had seen — each worked in the combination that had been tested and failed in another:
- a fluent `Button` with a lambda did nothing since alpha.411 (never advertised to the browser);
- card menus authored in YAML routed to `null/...` and static bundles dropped them;
- the YAML JSON schema never applied in IntelliJ (extension registered on a non-existent point);
- .NET/Python listings rendered empty cells in Vaadin (missing `pageSize`).
Your job: walk YOUR AREA exhaustively, as a real user/developer would, across EVERY combination that applies, fix
what's broken, and leave a permanent automated test for each cell so it can't regress.

## The matrix (for each feature of your area)
- **Authoring**: Java annotations/fluent · YAML (definition/routes/sources/app shell…) · visual editor (can it author
  it? does Play/canvas render it?) · .NET · Python. Only the channels where the feature is supposed to exist
  (CLAUDE.md + docs say which; when docs claim support, that's a claim to verify).
- **Rendering**: Vaadin (web) · Redwood/VB · React Native (expo web is OK) · IntelliJ renderer (`./gradlew renderProbe`
  over captured wire JSON is OK).
- **Serving**: served by a backend (at least MVC + one of WebFlux/Quarkus/Micronaut/Helidon for Java; the ports run
  their own) · static bundle (`mateu:bundle`, incl. `specsOnly`) where the feature can work without a server.
- **Interaction**: not just "it renders" — click it, type in it, submit, navigate, reload/deep-link, back/forward,
  error paths, empty states, keyboard. Check the browser console for errors and warnings (e.g.
  `[mateu] action "x" was requested but no component on the page handles it`).
Mark a cell N/A only when the feature is documented as not applying there; a gap that SHOULD work is a bug.

## What to deliver (branch `walkthrough/<area>`, from origin/master; commit locally, NEVER push or touch GitHub)
1. `design/walkthrough/<area>.md`: the matrix — rows = features, columns = combinations, each cell ✅ verified (how) /
   🔧 was broken → fixed (commit) / ❌ broken, not fixed (why, owner decision needed) / N/A (why). Plus a list of
   doc claims found wrong and fixed.
2. Fixes at the ROOT (framework, renderer, port, editor, docs), smallest correct change, each with a test that fails
   without it.
3. Permanent tests for the walked cells: shared Playwright specs (`e2e/tests/shared/**`, fixtures in
   `e2e/sut/modules/sample1` or YAML fixtures — they run on all 5 Java adapters in CI), core `*SyncTest`s,
   conformance cases for wire parity (Java/.NET/Python exact), port tests, libs/mateu / redwood poc / editor vitest,
   RN/IntelliJ tests. Prefer extending existing fixtures/specs over new ones.
4. Final report: counts per cell state, the bugs fixed (one line each), the ❌ list, and anything another area should know.

## Shared-machine rules (several agents run at once — respect them)
- **Maven**: use your OWN local repo so `0.0.1-MATEU` installs don't clobber other agents:
  `M2=<your scratchpad>/m2; rsync -a --link-dest=$HOME/.m2/repository/ $HOME/.m2/repository/ $M2/` (hard links:
  instant, no extra disk), then always pass `-Dmaven.repo.local=$M2`. Delete it at the end.
- **Ports**: only use the port block assigned to you (override with `--server.port=…`, `-Dquarkus.http.port=…`,
  `MICRONAUT_SERVER_PORT`, `server.port` for Helidon, `--port` for uvicorn, `--urls` for dotnet, vite `--port`).
  Never kill a process you didn't start; if a port is taken, pick another in your block.
- **Load**: at most 2 app servers + 1 browser at a time; run heavy builds sequentially.
- **Generated bundles**: if you change libs/mateu, apps/vaadin, apps/visual-editor or apps/redwood, regenerate them
  (from frontend/web/monorepo: `npx -y npm@11 ci --workspace mateu --workspace mateu-visual-editor --workspace mateu-vaadin --include-workspace-root --ignore-scripts`,
  then `npm run copy` in apps/visual-editor and apps/vaadin; Redwood: `npx -y npm@11 ci --workspace mateu-redwood --ignore-scripts`,
  then in apps/redwood `npm run bridge && npm test && npm run build && npm run copy` — build's exit code is unreliable,
  check the artifact) and run `bash scripts/check-bundle-freshness.sh`. Lint cap 420; `node scripts/check-design-tokens.mjs`
  must pass (use tokens, never baseline bumps); licence check must pass.
- No secrets/IPs/account ids in the repo or docs; never quote Oracle documentation; don't touch other repos.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Xuv4Zgbdj59rJiu41m2xVu
  ```
- Keep going until your area's matrix is complete; it's a long task. If a cell needs an owner decision, mark it ❌ with
  the question and continue.

# Client conformance corpus

`conformance/cases` holds the servers to one wire. This directory does the same for the logic the
**renderers** run on the client, which exists in four copies that share no code:

| Renderer | Expressions | Route params (static bundle) |
|---|---|---|
| Web (libs/mateu) — the reference | `infra/ui/expression.ts` | `infra/http/bundleStore.ts` |
| Redwood (VB) | `apps/redwood/poc/rules.mjs` | `apps/redwood/poc/bundle.mjs` |
| React Native | `src/core/expressions.ts` | — (no static bundle mode) |
| IntelliJ | `state/Expressions.kt` | — (no static bundle mode) |

Copies drift silently: before this corpus, Redwood had no `??` / `?.`, neither native renderer had
`?.` or regex literals (so the server's `@Pattern` condition never ran on them), IntelliJ compared
two strings as numbers and treated `===` as `==`, and the Redwood bundle dropped a route's
`state:` / `appState:` seeds. Each fix landed with its corpus case.

## Files

- `expressions.json` — `{ context, cases: [{ name, expr, context?, expected, overrides? }] }`.
  Run by `expression.conformance.test.ts` (libs/mateu vitest), `poc/test-conformance.mjs`
  (Redwood `npm test`), `src/core/expressions.conformance.test.ts` (RN `node --test`) and
  `ExpressionsConformanceTest.kt` (IntelliJ `gradlew test`).
- `route-params.json` — registry entries + a pre-rendered increment + a sync path → the state,
  data, appState and initialData a statically served load must carry. Run by the web and Redwood
  suites (the only renderers with a static bundle mode).
- `app-compat.json` — can a hub app (phone or desktop) render a UI: the UI's manifest
  (`wireVersion`, `minAppVersion`, `mateuVersion`) against what the app knows of itself →
  compatible | recommended | required, with the reason. Run by `src/hub/compat.conformance.test.ts`
  (React Native, the reference) and `AppCompatConformanceTest.kt` (IntelliJ).
- `agent-events.json` — which event names an AGENT (chat stream, live push) may dispatch: the
  built-in ones, else only one a view on screen subscribes to and never a framework/DOM event name.
  Run by `agentEventPolicy.test.ts` (libs/mateu) and `poc/test-chat-events.mjs` (Redwood); React
  Native and IntelliJ deliver agent events only to their session bus of `@SubscribeTo` views.
- `kanban-order.json` — a live Kanban board with an `orderField`: how a column's cards are sorted
  and the order value a moved card takes (`_toOrder`). Run by `kanbanOrder.conformance.test.ts`
  (libs/mateu), `poc/test-conformance.mjs` (Redwood), `src/core/kanbanOrder.conformance.test.ts`
  (React Native) and `KanbanOrderConformanceTest.kt` (IntelliJ).
- `live-reload.json` — what a development server's live-reload event (`hello`, `specs-changed`,
  `reload`, `ping`) means for the screen on display: nothing, re-render the page or the app, and the
  boot id to remember (a new one = a restarted server). Run by `liveReload.conformance.test.ts`
  (libs/mateu, the reference), `src/core/liveReload.test.ts` (React Native) and `LiveReloadTest.kt`
  (IntelliJ).

## Expected values

- A plain JSON value is compared deeply (numbers numerically: IntelliJ computes in doubles).
- `{ "$undefined": true }` is JavaScript `undefined` (IntelliJ: `null` — Kotlin has one null).
- `{ "$error": true }` means the evaluator refuses the expression: it throws. Redwood's
  evaluator never throws (a broken rule must not break the screen), so there an error reads as
  `undefined`.

`expected` is what the **web** evaluator answers: it is the reference, and the web runner refuses
an override for itself. A renderer that deliberately differs carries
`"overrides": { "<redwood|rn|intellij>": { "expected": …, "why": "…" } }` — the divergence is
stated, reasoned and still pinned, never skipped. Today's overrides are the subset the native
renderers do not implement (method calls, array literals, arrow functions, globals, `typeof`),
their null-safe member access, and Kotlin's single null.

## Route parameter precedence

Every server (Java `RouteSegmentUtils.addParameterValues`, .NET `RouteMatch.Params`, Python
`Match.params`) applies `fixed > client state > path > query > defaults`, where a `null` in the
client state is no value at all (the path, the query and the defaults still fill it), and a route's
`state:` seeds sit at the defaults level, above `defaultParams`. A statically served load has no
client state yet and its increment is what the server rendered for the route — so the bundle applies
`fixed > path > query > increment > state seeds > defaultParams` (the query on the answer:
`withQueryParams` / `applyQueryParams`; a case's optional `query` exercises it), where a `null` in
the increment is no value at all (the server's `putIfAbsent` fills a key mapped to null). For a
pre-rendered increment the orders give the same answer; `route-params.json` pins that, and each
server pins its own order in its route-registry tests.

## Adding a case

Write it from the documented contract, run the web suite to confirm the reference answer, then run
the other three. A failure is either a corpus correction (the case was wrong) or a renderer fix
whose test is that case.

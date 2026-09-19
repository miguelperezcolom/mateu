# R2 — App ≠ its Home Screen: the refactor (slice b) design

**Status:** design for review — **go/no-go needed before touching routing.**
**Depends on:** R2 slice (a) — characterization tests (`AppSyncTest.r2_*`) + the conceptual
statement, merged in #539. This note is the plan for the *behavioral* change those tripwires guard.

## The conflation (what R2 removes)

A `@UI` class is today **both the app shell and its home content provider**. Concretely, on the
wire (pinned by `AppSyncTest.r2_conflation_*`):

- an app served at `/supplier` (declaring `homeRoute()` → `/supplier/catalog`) reports
  `homeServerSideType = SupplierHomeApp` — **the App class**, not the `/supplier/catalog` Screen's
  class (`CatalogPage`);
- an app with only `@Menu` items reports `homeRoute = "_no_home_route"` (a sentinel), and the
  "home = first menu item" resolution happens later, in `AppHomeRouteResolver.getHomeRoute`.

On the frontend, initial load fetches the home content with
`chooseAppServerSideType() → metadata.homeServerSideType` (appRenderer.ts) — so the app class is
re-synced to produce the home content. The App is fused with a Screen.

## Target

- **App = shell** (menu/title/subtitle/logo/widgets) **+ a reference to a Home (a Route).**
- **`homeServerSideType` = the class the home ROUTE resolves to** (the home Screen), not the app class.
- The `_no_home_route` / `_page` sentinels collapse into one uniform rule: *the home is the Screen at
  the home route; the home route defaults to the first menu item.* Same for a class app and a YAML app.

## The nuance that shapes the scope (surface this)

For a **single-`@UI`-class app** (a form or CRUD with no menu), the class genuinely IS both the shell
and the content — there is no separate home Screen to point at. So R2 cannot mean "the app is never
its own content." The clean split only bites when the home is a **distinct route** (a menu item / an
explicit `homeRoute` at another path). Proposed rule:

> If the home route resolves to a **different** routed class/definition than the app itself, the home
> is that Screen (`homeServerSideType` = its class). If the home route IS the app's own base path
> (single-screen app), the app remains its own content — unchanged.

This keeps every single-screen app working untouched and only de-conflates the multi-screen case,
which is where the messy sentinels live.

## Blast radius (change points)

| Layer | Site | Change |
|---|---|---|
| Backend | `AppHomeRouteResolver.getHomeServerSideType` | resolve the home route to its class when it differs from the app; else keep the app class |
| Backend | `AppHomeRouteResolver.getHomeRoute` | collapse `_no_home_route`/`_page` into "first menu item's route"; keep embedded-mediator + RemoteMenu + record-in-listing branches |
| Backend | callers checking `endsWith("_no_home_route")` / `"_page"` (10+) | audit each; the sentinel should stop leaking to the wire |
| Frontend | `appRenderer.chooseAppServerSideType`, `mateu-app.ts:786` | no change if the wire keeps the same *shape* (just a different value) — verify |
| Ports | .NET `ReflectionMapper`, Python `mapper` | mirror the resolver rule so `homeServerSideType` matches Java byte-for-byte |
| Tests | `AppSyncTest.r2_*` | **flip deliberately**: `homeServerSideType` becomes the home Screen's class; `_no_home_route` disappears from the wire |
| Tests | `RemoteMenu*DeepLinkSyncTest`, `CrudSyncTest`, `WireConformanceTest`, conformance corpus | must stay green (the guard that the special-cases still work) |

## Risks / open questions

1. **Embedded mediators** set `homeServerSideType` explicitly — must be left verbatim (early return already does).
2. **RemoteMenu / federated apps** — the home may live in another mount; resolving "its class" cross-mount may not be possible. Likely keep the current behavior for RemoteMenu homes.
3. **YAML apps** have no class; the home Screen's "serverSideType" may be a definition, not a class — the wire field is a string either way, but the resolution path differs.
4. **The `_no_home_route` sentinel is load-bearing** in 10+ places; collapsing it is the riskiest part. Do it last, behind the characterization + deep-link tests.
5. **Conformance corpus** freezes wire goldens — `homeServerSideType` changing will move goldens; regenerate deliberately and diff.

## Rollout (if approved)

1. Backend resolver change for the **class-app, distinct-home** case only (smallest blast radius); update the `r2_*` tripwires; keep sentinels for the rest. Browser-verify a real multi-screen app's home load.
2. Port parity (.NET/Python) + conformance goldens regenerated + diffed.
3. Separately, collapse the `_no_home_route`/`_page` sentinels (audit every caller) behind the deep-link tests.
4. Update `yaml-app-shell.md` from "concept" to "this is how it resolves."

## Recommendation

**Proceed with step 1 only** (class-app distinct-home → home Screen's `homeServerSideType`), behind
the `r2_*` tripwires + a browser check, as its own reviewed PR — it is the contained, verifiable core
of R2. **Defer the sentinel collapse (step 3)** until step 1 is proven, because that is where the
regression risk concentrates. Hold for maintainer go/no-go on step 1's wire change (it moves
conformance goldens and a frontend-visible value).

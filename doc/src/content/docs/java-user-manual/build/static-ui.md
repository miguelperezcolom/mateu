---
title: A 100 % static UI — no backend of your own
description: Serve a Mateu UI as plain files — definitions read by the browser, data straight from a REST API — the way a cloud console like OCI's is built. How to author it, build it, host it, and what cannot be static yet.
---

**Status:** ✅ Works today for listings, record pages, linked child listings and REST writes (Vaadin
renderer). Proven end to end by `demo/demo-static-vcn` and its e2e. Gaps are listed
[at the end](#what-is-not-possible-statically-yet).

A Mateu UI does not need a Mateu server. The model can travel to the browser as data, and every
call the screens make can go **straight from the browser to your REST API** — so the whole UI is a
folder of files on a CDN. This is how OCI's console (MAUI) works: page definitions the browser reads,
data from the cloud APIs, no backend-for-frontend.

```
 static host (CDN, S3, nginx…)                 your REST API (CORS on)
 ┌───────────────────────────┐                 ┌──────────────────────┐
 │ index.html  assets/       │   GET /vcns     │                      │
 │ manifest.json ────────────┼───────────────▶ │  /api/vcns           │
 │  (screens + sources)      │   DELETE /vcns/7│  /api/vcns/:id …     │
 └───────────────────────────┘                 └──────────────────────┘
          no Mateu backend anywhere
```

## What a static screen is made of

Everything a screen does after it is painted has to be **declared on the wire**, because there is no
JVM left to run a method body:

| The screen needs to… | Declare it as | Java | YAML |
|---|---|---|---|
| list rows from the API | a rows source | `@RestListing(source = "vcns")` | `rowsSource: { ref: vcns }` |
| filter, search and page them | — (the renderer does it over the fetched rows) | `Filterable<Filters>`, `Searchable` | `filters:`, `searchable: true` |
| open a record by URL | a row route | `@RestListing(rowRoute = "vcns/${row.id}")` | `rowRoute: vcns/${row.id}` |
| load a record by `:id` | a data source run on load | `@RestData(source = "vcn")` | the route's `data: vcn` |
| show a lifecycle badge | a status column | `@Status` on the row field | `dataType: status` |
| navigate | a button whose actionable is a `RouteLink` | `Button…actionable(new RouteLink(…))` | `actionable: { type: RouteLink, route: … }` |
| write (delete, save…) | a REST action | `@RestAction(source = "vcn-delete", successRoute = "vcns")` | `actions: [{ id: delete, restAction: { … } }]` |
| confirm first | the action's confirmation | `@Action(confirmationRequired = true, …)` | `confirmationRequired: true` |

The endpoints themselves are named **once**, in the REST source catalogue — `@RestSource` on the app
class or `specs/ui/sources.yaml` — and every surface references them by name. The catalogue travels
in `manifest.json`, so pointing a deployed site at another environment is an edit of that table, not a
rebuild. A status column over a plain lifecycle word (`"AVAILABLE"`) is painted as a badge with the
usual meaning of the word (available/active → success, provisioning/updating → warning,
failed/terminated → error).

Inner routes are data: `@UI("")` declares the mount (the app shell); `specs/ui/routes.yaml` binds the
routes inside it — to a Java view model (`viewModel:`) or to a definition only (`definition:`).

## Two ways to build it

**From Java** — `mateu:bundle` boots your classes at build time and **pre-renders** every route into
`manifest.json` (`:id` routes as templates, filled in the browser):

```xml
<plugin>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-bundle-maven-plugin</artifactId>
  <configuration>
    <skipParamRoutes>false</skipParamRoutes>   <!-- bundle vcns/:id as a template -->
    <staticOnly>true</staticOnly>              <!-- fail the build if anything needs a server -->
  </configuration>
  <executions><execution><goals><goal>bundle</goal></goals></execution></executions>
</plugin>
```

If your `@UI` classes live in the app module itself, add `annotation-processor-indexer` next to your
framework's annotation processor: it writes the class index the build-time catalogue
(`@RestSource`) and exporter read.

**From YAML** — add `<specsOnly>true</specsOnly>`: every definition-only route whose type the
browser can expand (`AppShell`, `Listing`/`Crudl`, `Form`, the layouts, `Card`) ships as its **raw
definition**, and the client-side expander turns it into the wire at runtime. Nothing is
pre-rendered; edit a definition in `manifest.json`, refresh, see it.

Either way the output is `target/mateu-bundle/`: `index.html`, `manifest.json`, `assets/` and a
`_redirects` SPA fallback.

## The static-safety report

A pre-rendered page is a snapshot, and nothing used to tell you which of your screens still needed a
server — the build passed and the first click on the CDN said "request failed". With `staticOnly`
(`-Dmateu.bundle.static=true`) the goal checks every route and **fails the build**, naming the route
and the reason, if it finds:

- a route that could not be bundled at all (it would be backend-served, and there is no backend);
- `@EyesOnly` — a screen that depends on who asks cannot be one file for everyone;
- a Java action method (`@Button`, `@Toolbar`, `@ListToolbarButton`, …) without `@RestAction`, or an
  `ActionHandler`;
- rows from `Listing.search()` (a `Listing` with no `@RestListing`) or from a `CrudStore`;
- a trigger (on load, on success…) that runs an action the browser cannot complete;
- a source fetched through the server proxy (`proxy: true`), or a **direct** source that uses
  `${secret.…}` — the browser has no secret scope, and a secret in a static file is not a secret;
- in a definition, a button with neither a route nor a declared `restAction`.

```
mateu-bundle: the bundle is declared static (staticOnly) but 1 thing(s) still need a server:
  /vcns/:id — VcnDetail.archive() is a Java action method (add @RestAction to run it in the browser)
```

Without `staticOnly` the bundle is a **hybrid**: whatever it cannot answer falls through to the
backend at `baseUrl`. That is a legitimate deployment too.

## Hosting

- **Any static host.** Serve the folder with an **SPA fallback** — every path that is not a file gets
  `index.html` (Netlify reads the shipped `_redirects`; S3/CloudFront: an error document; nginx:
  `try_files $uri /index.html`). Deep links (`/vcns/7`) then boot the app, which resolves the route
  from the manifest.
- **CORS.** Direct calls come from the browser, so every API must allow the site's origin
  (`Access-Control-Allow-Origin`, and `-Methods`/`-Headers` for writes and custom headers). The
  zero-code alternative is a **same-origin reverse proxy** at the CDN (route `/api/*` to the API) —
  then the sources use relative URLs and there is no CORS at all.
- **Re-pointing** an environment is an edit of `sources` in `manifest.json`.

## Auth, and what it can and cannot do

- **Who the user is** comes from your identity provider in the browser. Register a provider with
  `registerExternalAuthProvider` (libs/mateu) to add an `Authorization` header to every direct call;
  the API validates the token.
- **Authorization lives in the API.** UI gating in a static bundle is advisory — the files are
  public, and a hidden button is not a permission. `@EyesOnly` screens are refused by the static
  check on purpose (a bundle also reveals structure).
- **No secrets in the bundle.** An API key belongs on a server: use the proxy (a hybrid deploy) or a
  token the user's session obtains.

## Run the reference demo

```bash
cd demo/demo-static-vcn
./run-static.sh                   # external API :8790, Java site :8791, YAML site :8792
cd ../../e2e && npx playwright test --project static-vcn-java --project static-vcn-yaml --workers=1
```

The e2e fails if anything calls `/mateu/v3/**`: there is no Mateu backend in the picture.

## What is not possible statically yet

The demo covers the read-navigate-delete loop of a console. What MAUI does beyond it, and Mateu does
not yet do without a server, is on the roadmap:

- **Expressions** (S1) — `${…}` is JavaScript evaluated with `new Function` (needs CSP
  `unsafe-eval`), with no `route`/`flags`/`t()` scopes; a safe, symmetric expression language is S1.
- **Named data slots and `bind`** (S1) — a source's result goes into the page state; there is no
  `data.<name>` with loading/error status, and nothing re-fetches when a dependency changes.
- **Server-side paging and sorting of REST rows** (S1) — client paging works over the whole fetched
  collection; offset paging / prefetch-all and client sorting of REST rows are missing.
- **A declared status mapping** (S1) — `@Status(mappings)` is applied on the server only; REST rows
  use the built-in word table above.
- **Action chains** (S2) — `onSuccess`/`onError` steps, `If`/`Set`/`Refresh(target)`, overlays
  opened with arguments, polling (`OnTimer`).
- **Editable forms in the expander** (S3) — the YAML path expands read-only record pages; editable
  forms with validators (and `layoutDelta`) are pre-rendered from Java only. Routed tabs (P1) and
  client i18n (`t()`, catalogues) too.
- **Redwood** (S4) — its bundle mode reads pre-rendered entries only: no `contentJson`, raw
  definitions, source catalogue or `restAction` yet.
- **Auth** (S4) — no built-in OIDC/PKCE client; bring your own provider.

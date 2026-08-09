---
title: Static bundle — serve the UI from a CDN, backend-optional
description: Export your declared screens to a static site the renderer boots from — served from any static host with no (or optional) Mateu backend.
---

**Status:** ✅ Implemented (Vaadin renderer, static routes)

Mateu can export your declared screens to a **static bundle** — a folder of pre-rendered JSON plus
the renderer assets — that any static host (Netlify, S3, GitHub Pages, a CDN) serves with **no Mateu
backend running**. The renderer boots, reads the bundle, and paints each screen from it; live data
still flows from [external endpoints](../../java-ui-definition/annotations/rest-options), and screens
that need server logic keep working when a backend is present.

## Runnable demo

`demo/demo-static-bundle` is a minimal, self-contained example (two static `@UI` screens, one with a
live `@RestOptions` select). Two ways to see the bundle:

```bash
cd demo/demo-static-bundle
mvn spring-boot:run            # then GET http://localhost:8097/mateu/v3/bundle  (runtime, no build)
mvn -Pbundle package           # then serve target/mateu-bundle/ from any static host (no backend)
```

## How it works

Two halves, both shipped:

1. **Build-time export** — the `mateu:bundle` Maven goal renders every static `@UI`/`@Route` route's
   initial load (the exact JSON the server returns for a page load) into a `manifest.json`, copies the
   renderer assets, and stamps a static `index.html`.
2. **Client bundle mode** — `<mateu-ui bundleUrl="…">` fetches that `manifest.json` once at boot and
   answers route loads from it instead of calling the backend. It reuses the same render pipeline and
   [client structure cache](../../ux-patterns/client-side-caching), so the screen looks identical to a
   server-rendered one.

## Exporting

Add the plugin to the app that declares your `@UI` classes and run `mvn package` (or the goal
directly):

```xml
<plugin>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-bundle-maven-plugin</artifactId>
  <version><!-- the Mateu version you use --></version>
  <configuration>
    <!-- Optional: the base URL stamped into the page; "" = same-origin static host -->
    <baseUrl></baseUrl>
    <!-- Optional: where the renderer assets (_index.html + assets/) live; defaults to the
         vaadin-lit resources on the classpath when they are an exploded directory -->
    <assetsFrom>${project.basedir}/../../backend/shared/frontend/vaadin-lit/src/main/resources/static</assetsFrom>
  </configuration>
  <executions>
    <execution><goals><goal>bundle</goal></goals></execution>
  </executions>
</plugin>
```

Output lands in `target/mateu-bundle/`:

```
target/mateu-bundle/
├── index.html        # boots <mateu-ui bundleUrl="/manifest.json">
├── manifest.json     # one pre-rendered increment per static route
├── assets/           # the renderer bundle (mateu-vaadin.js, vendors, css)
└── _redirects        # SPA fallback (/* → /index.html) for static hosts
```

Deploy that folder to any static host. The goal prints a `rendered/total` summary; a route it could
not render (see the boundaries below) is logged and skipped — it stays backend-served.

### Goal parameters

| Parameter (`-Dmateu.bundle.*`) | Default | Meaning |
|---|---|---|
| `outputDirectory` | `target/mateu-bundle` | where the bundle is written |
| `baseUrl` | `""` | stamped into `<mateu-ui baseUrl>` + the manifest URL |
| `basePackages` | inferred from the `@UI` classes | app packages to component-scan for the `@Service`/`@Component` beans your ViewModels inject |
| `routes` | all discovered static routes | optional allowlist |
| `skipParamRoutes` | `true` | `true` skips `:param` routes; `false` bundles them as [templates](#param-route-templates) |
| `assetsFrom` | vaadin-lit resources | directory holding `_index.html` + `assets/` |
| `pageTitle` | `Mateu` | `<title>` of the static page |
| `failOnEmpty` | `false` | fail the build if zero routes rendered |

## Serving the bundle at runtime (no build step)

You don't have to run the Maven goal: a running Mateu app exposes the same bundle live at

```
GET /mateu/v3/bundle
```

which returns the identical `manifest.json`, rendered from the app's real bean graph — so it has
**full fidelity** (services/DB available, no skipped service-backed loads) and needs no build. Add
`?params=true` to also include [`:param` route templates](#param-route-templates). Two uses:

- **Point a static shell at it** — host a small `index.html` + the renderer assets on a CDN and set
  `<mateu-ui bundleUrl="https://your-app/mateu/v3/bundle">`. The shell fetches the bundle over CORS
  (the endpoint sends the header) and answers loads from it — instant first paint, backend still there
  for actions. (Same-origin `bundleUrl="/mateu/v3/bundle"` works too.)
- **Snapshot it** — `curl https://your-app/mateu/v3/bundle > manifest.json` to produce the bundle in
  CI without the Maven goal.

The result is computed once and cached (structure is stable within a deployment). The endpoint ships
in **every server adapter** — Spring MVC, Spring WebFlux, Micronaut, Quarkus and Helidon MP — and
discovers routes from the live `RouteResolver` beans, so it works whether your `@UI` classes live in
the app module or in a separate UI module.

**Cross-origin note:** the Spring adapters (MVC/WebFlux) send `Access-Control-Allow-Origin` via
`@CrossOrigin`. On the other adapters the endpoint relies on the app's own CORS configuration
(`micronaut.server.cors`, `quarkus.http.cors`, Helidon's CORS feature) — the same requirement as the
main `/mateu/v3/sync` endpoint. Same-origin serving needs no CORS at all.

## `:param` route templates

A parameterised route (`/orders/:id`) can't be pre-rendered for one specific id, but if its
**structure is param-independent** (a detail screen whose data is fetched client-side), it can be
bundled once as a **template**:

- Enable it: `mvn -Pbundle package -Dmateu.bundle.skipParamRoutes=false`, or hit the runtime endpoint
  with `GET /mateu/v3/bundle?params=true`.
- The exporter renders the route once with a placeholder param and stores the entry with a regex
  (`^orders/([^/]+)$`) and the param names.
- At runtime the client matches a concrete path (`/orders/42`) against the template, extracts the
  params and **injects them into the screen's state** (`state.id = "42"`). Any `${state.id}` in a
  client-side data URL (`@RestOptions`/`@RestData`) then resolves to the real value — so a per-id
  detail screen works served from a static host with **no backend**.

```java
@UI("/item/:id")
@Title("Item ${state.id}")
public class Item {
  private String id;                 // receives the real id from the path at runtime
  @RestOptions(url = "https://api.example.com/posts?userId=${state.id}", valuePath = "id", labelPath = "title")
  private String relatedPost;        // options fetched client-side for id=42
}
```

A view whose load *hard-fails* on the placeholder (e.g. parses it as a number and reads a DB) is
skipped, exactly like a static view that needs a live backend. See `demo/demo-static-bundle` (`/item/:id`).

## What works without a backend

- **Presentational and form screens** — any declared `@UI`/`@Route` whose initial render is
  structural (fields, sections, tabs, layouts).
- **Live data via external endpoints** — `@RestOptions`/`@RestListing`/`@RestData`/`@RestAction`
  fetch directly from your REST APIs client-side, so a bundled screen shows real data with no Mateu
  backend (use `proxy = true` needs a backend; the direct mode is what works statically).

## What still needs a backend

- **Actions** — a button/toolbar/save (`actionId ≠ ""`) posts to the server. Without one it degrades
  with a clear "request failed" message. Bundle mode is for *viewing*; mutations need a backend.
- **Parameterised routes** (`/orders/:id`) — skipped by default; can be bundled as
  [templates](#param-route-templates) when the structure is param-independent (data fetched
  client-side). A view that loads its entity server-side by id still needs a backend.
- **Service-backed loads** — a ViewModel whose initial load needs a live DB / a bean the build can't
  construct is skipped at export time (logged) and stays backend-served.

A **hybrid** deploy is the sweet spot: ship the bundle for instant, backend-free first paint, and
point `baseUrl` at a real backend so actions and unbundled/param routes still work — the client uses
the bundle for the loads it has and falls through to the backend for everything else.

## Notes

- First pass targets the **Vaadin** renderer.
- The manifest carries only screen **structure** (never business data), so nothing stale is baked in;
  data is always fetched live.

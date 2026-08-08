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
| `skipParamRoutes` | `true` | skip routes with a `:param` segment |
| `assetsFrom` | vaadin-lit resources | directory holding `_index.html` + `assets/` |
| `pageTitle` | `Mateu` | `<title>` of the static page |
| `failOnEmpty` | `false` | fail the build if zero routes rendered |

## Serving the bundle at runtime (no build step)

You don't have to run the Maven goal: a running Mateu app exposes the same bundle live at

```
GET /mateu/v3/bundle
```

which returns the identical `manifest.json`, rendered from the app's real bean graph — so it has
**full fidelity** (services/DB available, no skipped service-backed loads) and needs no build. Two uses:

- **Point a static shell at it** — host a small `index.html` + the renderer assets on a CDN and set
  `<mateu-ui bundleUrl="https://your-app/mateu/v3/bundle">`. The shell fetches the bundle over CORS
  (the endpoint sends the header) and answers loads from it — instant first paint, backend still there
  for actions. (Same-origin `bundleUrl="/mateu/v3/bundle"` works too.)
- **Snapshot it** — `curl https://your-app/mateu/v3/bundle > manifest.json` to produce the bundle in
  CI without the Maven goal.

The result is computed once and cached (structure is stable within a deployment). The endpoint is
provided by the MVC adapter today.

## What works without a backend

- **Presentational and form screens** — any declared `@UI`/`@Route` whose initial render is
  structural (fields, sections, tabs, layouts).
- **Live data via external endpoints** — `@RestOptions`/`@RestListing`/`@RestData`/`@RestAction`
  fetch directly from your REST APIs client-side, so a bundled screen shows real data with no Mateu
  backend (use `proxy = true` needs a backend; the direct mode is what works statically).

## What still needs a backend

- **Actions** — a button/toolbar/save (`actionId ≠ ""`) posts to the server. Without one it degrades
  with a clear "request failed" message. Bundle mode is for *viewing*; mutations need a backend.
- **Parameterised routes** (`/orders/:id`) — can't be pre-rendered for a specific id; skipped.
- **Service-backed loads** — a ViewModel whose initial load needs a live DB / a bean the build can't
  construct is skipped at export time (logged) and stays backend-served.

A **hybrid** deploy is the sweet spot: ship the bundle for instant, backend-free first paint, and
point `baseUrl` at a real backend so actions and unbundled/param routes still work — the client uses
the bundle for the loads it has and falls through to the backend for everything else.

## Notes

- First pass targets the **Vaadin** renderer.
- The manifest carries only screen **structure** (never business data), so nothing stale is baked in;
  data is always fetched live.

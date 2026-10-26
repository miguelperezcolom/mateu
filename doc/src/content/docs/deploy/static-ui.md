---
title: A 100 % static UI — no backend of your own
description: Serve a Mateu UI as plain files — definitions read by the browser, data straight from a REST API — the way a cloud console like OCI's is built. How to author it, build it, host it, and what cannot be static yet.
---

**Status:** ✅ Works today for listings, record pages, linked child listings and REST writes, on the
Vaadin and the Redwood renderer (Redwood bundles are always pre-rendered — see below). Proven end to end by `demo/demo-static-vcn` and its e2e. Gaps are listed
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
routes inside it — to a Java view model (`viewModel:`) or to a definition only (`layout:`; the older
key `definition:` is a deprecated alias).

## Two ways to build it

**From Java** — the `bundle` goal (`mvn mateu-bundle:bundle`) boots your classes at build time and **pre-renders** every route into
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

If your `@UI` classes live in the app module itself, add `mateu-annotation-processor-indexer` next to your
framework's annotation processor: it writes the class index the build-time catalogue
(`@RestSource`) and exporter read.

**From YAML** — add `<specsOnly>true</specsOnly>`: every definition-only route whose type the
browser can expand (`AppShell`, `Listing`/`Crudl`, `Form`, the layouts, `Card`) ships as its **raw
definition**, and the client-side expander turns it into the wire at runtime. Nothing is
pre-rendered; edit a definition in `manifest.json`, refresh, see it.

Either way the output is `target/mateu-bundle/`: `index.html`, `manifest.json`, the renderer's
static app (`assets/` for Vaadin, `_redwood/` for Redwood) and a `_redirects` SPA fallback.

## Develop with live reload

While you work on the screens, run the `dev` goal instead of rebuilding by hand:

```bash
mvn mateu-bundle:dev                                # http://localhost:3000
mvn mateu-bundle:dev -Dmateu.dev.liveReload=false   # same, but you refresh the page yourself
```

It builds exactly what `mvn package` builds — the plugin's `<configuration>`, the
`-Dmateu.bundle.*` properties and `.mvn/maven.config` (sample data included) — into
`target/mateu-bundle/`, serves it with the SPA fallback, and rebuilds it whenever a file under the
resource directories changes (`specs/ui/**`: definitions, sources and their samples, translations).
Each rebuild logs one line; with live reload on (the default) the open pages reload after it. The
reload script is added as the page is served, never written to the bundle.

A change that breaks the build — a YAML error, a screen that would need a server under `staticOnly`
— is logged (and shown in the browser console) and **the last good bundle keeps being served**; the
next good save picks up from there. Nothing but a JDK is needed (no Node). `-Dmateu.dev.port`
chooses the port (a busy one moves to the next free one, and says so), `-Dmateu.dev.host=0.0.0.0`
opens it to your network; Ctrl+C stops it. The `mateu-bundle:` prefix resolves because the pom
declares the plugin; elsewhere use `mvn io.mateu:mateu-bundle-maven-plugin:dev`.

To look at the finished bundle as a static host will serve it, build it and serve the folder:
`mvn package && npx serve -s target/mateu-bundle`.

## Same project on web and phone

The bundle is also a UI the **Mateu app** (the React Native renderer) opens natively — the same
YAML, no backend, no second project. The build writes, next to `manifest.json`, the UI manifest the
app reads (`mateu/v3/manifest`: name, icon and colour from the app shell, plus
`"bundle": "manifest.json"`); the app then answers every screen on the device from the bundle — the
same resolver and expander the web renderers use, whatever renderer `project.yaml` picks — and calls
your `sources` from the phone (their `sample:` data in a mock build). Filters, search, sorting and
paging of a `rowsSource` listing, and `restAction` writes, run on the device as in the browser.

```bash
mvn mateu-bundle:dev                              # simulators: the URLs are printed
mvn mateu-bundle:dev -Dmateu.dev.host=0.0.0.0     # a phone on your Wi-Fi: URL + a QR code
```

- **iOS simulator**: add `http://localhost:3000` in the app (or open
  `exp://localhost:8081/--/add?u=http%3A%2F%2Flocalhost%3A3000` when you run the app from source).
- **Android emulator**: the host is `http://10.0.2.2:3000`.
- **A real phone**: with `-Dmateu.dev.host=0.0.0.0` the goal prints your LAN address and a terminal
  QR code of `https://mateu.io/add?u=http://<lan ip>:3000` — scan it with the camera. Plain `http` is
  accepted by **development builds** of the app only; with the React Native renderer running from
  source in Expo Go, pass `-Dmateu.dev.expoUrl=exp://<lan ip>:8081` and the QR opens Expo Go
  instead. `-Dmateu.dev.qr=false` prints the link without the code.

Deployed, it is the same: add `https://your-cdn.example.com/app` in the app (a bundle built before
the UI manifest file existed is recognised by its `manifest.json` and named from its app shell). The
APIs are called from the phone — a native app needs no CORS, the app's web build does. Live reload
does not reach the phone: reopen the UI after a change.

## Choosing the renderer

The bundle ships the **project's renderer**, the one `specs/ui/project.yaml` names (see
[project settings](/define/yaml/project-settings)). The goal chooses it in this order:

1. `<renderer>vaadin|redwood</renderer>` (`-Dmateu.bundle.renderer`), when set;
2. otherwise `renderer:` in `project.yaml`;
3. otherwise the renderer jar on the app's classpath; otherwise Vaadin.

The renderer's static app is copied straight out of its jar on the app's classpath
(`io.mateu:mateu-vaadin` or `io.mateu:mateu-redwood`; `<assetsFrom>` still overrides it with a folder). When
both jars are present, the one that matches is used. When the chosen one is missing, the build fails
and names the artifact to add.

**A Redwood bundle** is the Oracle Visual Builder app of `io.mateu:mateu-redwood` (its `_redwood/` folder)
booting from `manifest.json` with no backend. The menu, routes and deep links work through the
`_redirects` fallback, and a route under an app shell paints its own screen inside the shell. Things to
know:

- **Everything is pre-rendered.** The Redwood renderer has no client-side expander, so
  `<specsOnly>` is ignored for it, with a warning, and every route is rendered at build time.
- **Oracle's CDN.** JET, the Spectra components and the Visual Builder runtime load from
  `static.oracle.com` at run time, as in every Redwood app.
- **Serve it at the root of its host.** Its assets are addressed from `/_redwood/`.

**From the visual editor**, **Export** writes a `manifest.json` for the project's renderer. For a
Redwood project it adds the pre-rendered entries the Redwood renderer reads. They are expanded in the
browser with the same runtime as Play. Put the manifest next to the Redwood static app, and name it from its `index.html` with an
**absolute** path — `<mateu-ui bundleUrl="/manifest.json">` (or `<base path>/manifest.json`): a deep
link reached through the SPA fallback keeps the document base at that deep path, so a relative
`./manifest.json` would 404 there. Letting `mateu-bundle:bundle` write the whole site does that for
you.

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

## Install as a desktop or phone app

The bundle is an installable **Progressive Web App**: Chrome and Edge offer **Install app** on the
desktop (its own window and icon), phones add it to the home screen, and it opens **offline**,
screens included, because the definitions travel in `manifest.json`. The build writes
`pwa/manifest.webmanifest` (named and coloured from the app shell), default icons and a
network-first service worker, `mateu-sw.js`, at the bundle's root; data from REST sources is never
cached. On by default; `-Dmateu.bundle.pwa=false` turns it off, and the `dev` goal never registers
the worker. See [Install as a desktop or phone app](/deploy/install-as-app/).

## Auth, and what it can and cannot do

- **Who the user is** comes from your identity provider in the browser. Register a provider with
  `registerExternalAuthProvider` (libs/mateu) to add an `Authorization` header to the direct calls;
  the API validates the token. The provider is asked for every direct call, so it must decide by
  `url` and answer `{}` for an endpoint the token is not for (see
  [client-side auth](/java-ui-definition/annotations/rest-options/#client-side-auth-for-the-direct-path-registerexternalauthprovider)).
- **Authorization lives in the API.** UI gating in a static bundle is advisory — the files are
  public, and a hidden button is not a permission. `@EyesOnly` screens are refused by the static
  check on purpose (a bundle also reveals structure).
- **YAML access rules** (`access:`, `eyesOnly:`, `readOnlyUnless:`, `disabledUnless:`) are refused
  by the static check the same way, and a hybrid bundle keeps those routes backend-served — see
  [Permissions in YAML](/define/yaml/permissions/#static-bundles-and-play).
- **Translations work statically**: the catalogue travels in `manifest.json` and the browser
  resolves `${i18n.…}` for the visitor's language — see [Translations in YAML](/define/yaml/translations/#static-bundles-and-play).
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

- **Expression scopes** (S1) — `${…}` runs in Mateu's own sandboxed evaluator (no `new Function`,
  so a CSP without `unsafe-eval` is fine — see [Security](/java-user-manual/advanced/security/)); it
  sees `state`, `data`, `appState`, `appData` and `component`, but no `route`/`flags` scopes.
- **Named data slots and `bind`** (S1) — a source's result goes into the page state; there is no
  `data.<name>` with loading/error status, and nothing re-fetches when a dependency changes.
- **A declared status mapping** (S1) — `@Status(mappings)` is applied on the server only; REST rows
  use the built-in word table above.
- **Action chains** (S2) — `onSuccess`/`onError` steps, `If`/`Set`/`Refresh(target)`, overlays
  opened with arguments, polling (`OnTimer`).
- **Validators beyond `required` in the expander** (S3) — the client-side expander gives editable
  fields their required check (the same condition and message the server emits), but `min`/`max`/
  `pattern` validators and `layoutDelta` are pre-rendered from Java only. Routed tabs (P1) too.
- **Redwood raw definitions** (S4) — Redwood's bundle mode reads pre-rendered entries only (with
  `contentJson` under an app shell), so `specsOnly` does not apply to it. It does read the source
  catalogue and translations from the manifest and runs `restAction`s in the browser.
- **Auth** (S4) — no built-in OIDC/PKCE client; bring your own provider.

# Static bundles (no backend)

`io.mateu:mateu-bundle-maven-plugin` turns `specs/ui` into a folder of plain files —
`target/mateu-bundle/` (`index.html`, `manifest.json` with the screens + route table + source
catalogue + translations, the renderer's assets, a `_redirects` SPA fallback) — for any static host
or CDN. The browser reads the definitions and calls the APIs in `sources.yaml` itself.

## The pom of a YAML-only static project (the `static` starter)

```xml
<properties><mateu.version><!-- latest io.mateu release --></mateu.version></properties>
<dependencies>
  <!-- the renderer: the bundle copies its static app out of this jar -->
  <dependency><groupId>io.mateu</groupId><artifactId>mateu-vaadin</artifactId><version>${mateu.version}</version></dependency>
</dependencies>
<build><plugins>
  <plugin>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-bundle-maven-plugin</artifactId>
    <version>${mateu.version}</version>
    <configuration>
      <pageTitle>My app</pageTitle>
      <skipParamRoutes>false</skipParamRoutes>   <!-- ship orders/:id as a template -->
      <staticOnly>true</staticOnly>              <!-- fail the build if a screen needs a server -->
      <specsOnly>true</specsOnly>                <!-- ship definitions raw; the browser expands them -->
    </configuration>
    <executions><execution><id>bundle</id><goals><goal>bundle</goal></goals></execution></executions>
  </plugin>
</plugins></build>
```

`mvn package` → `target/mateu-bundle/`. Preview: `npx serve -s target/mateu-bundle` (the `-s` SPA
fallback is what makes deep links like `/orders/1001` work).

While editing: `mvn mateu-bundle:dev` builds the same bundle, serves it on http://localhost:3000 (SPA
fallback, JDK only) and rebuilds on every change under `src/main/resources`, reloading the open
pages; `-Dmateu.dev.liveReload=false` keeps the rebuilds but not the reload. A failing rebuild (YAML
error, `staticOnly` violation) is logged as `mateu-dev: build failed — …` and the last good bundle
stays served. `-Dmateu.dev.port` (busy → next free, logged), `-Dmateu.dev.host`. The prefix resolves
because the pom declares the plugin; otherwise `mvn io.mateu:mateu-bundle-maven-plugin:dev`.

## Goal parameters (`-Dmateu.bundle.<name>` or `<configuration>`)

| Parameter | Default | Meaning |
|---|---|---|
| `outputDirectory` | `target/mateu-bundle` | where it is written |
| `baseUrl` | `""` | backend for anything not bundled (hybrid); `""` = same origin |
| `static` (`<staticOnly>`) | false | run the static-safety report and **fail** on anything needing a server |
| `specsOnly` | false | ship expandable definitions raw (roots `AppShell`, `Listing`/`Crud`/`Crudl`, `Form`, `VerticalLayout`, `HorizontalLayout`, `Div`, `Card`, `CustomComponent`); others are pre-rendered. Ignored for Redwood (always pre-rendered) |
| `skipParamRoutes` | true | false = bundle `:param` routes as templates (the param lands in `state`) |
| `renderer` | `project.yaml` → classpath → vaadin | `vaadin` or `redwood` (needs `io.mateu:mateu-redwood`) |
| `environment` | — | apply `environments/<name>.yaml` to the shipped sources |
| `routes` | all | allowlist |
| `pageTitle` | `Mateu` | `<title>` |
| `failOnEmpty` / `failOnSkipped` | false | fail on zero bundled routes / on any skipped route |
| `assetsFrom` | renderer jar | folder holding `_index.html` + `assets/` |
| `pwa` | true | installable app: `pwa/manifest.webmanifest` (name/colour/icon from the `AppShell`: `title`, `accentColor`, `logo`; Mateu icons otherwise), `pwa/register.js`, icons and the network-first worker `mateu-sw.js` at the root (never caches REST-source data). `false` → a worker that unregisters itself |

`-Dmateu.bundle.mock=true` (system property; the starter puts it in `.mvn/maven.config`) ships the
sources' `sample:` data and turns sample mode on — remove it to call the real APIs.

## What `staticOnly` refuses (with the route and the reason)

A button with neither a `RouteLink` nor a declared `restAction`; a trigger running an action the
browser cannot complete; a `proxy: true` source or a direct source using `${secret.…}`; YAML access
rules (`access:`, `eyesOnly:`…); a route that could not be bundled; any Java view-model action.
Example: `/orders/:id — button 'archive' has neither a route nor a restAction in actions:, so it
would be dispatched to a server`.

## Installable app (PWA)

The bundle is a Progressive Web App by default: Chrome/Edge offer "Install app" (own window +
icon), phones add it to the home screen, and it opens offline with its screens (the definitions are
in `manifest.json`; REST-source data still needs the network and is never cached). Name, short name,
theme colour and icon come from the `type: AppShell` (`title`, `accentColor`, `logo`) or the
`mateu.mobile.*` settings — the same derivation as the mobile app's manifest. Icons: a square PNG
≥ 512 px or an SVG `logo`; the favicon is never used; Mateu's default icons always follow. The `dev`
goal answers `mateu-sw.js` with a worker that unregisters itself. Docs:
https://mateu.io/deploy/install-as-app/

## Hosting

- Any static host with an SPA fallback (Netlify reads `_redirects`; nginx `try_files $uri
  /index.html`; S3/CloudFront an error document). Redwood bundles must be served at the host root.
- Direct calls come from the browser: each API needs CORS for the site's origin — or route `/api/*`
  to the API at the CDN and use relative URLs.
- Re-point an environment by editing `sources` in `manifest.json`, or rebuild with
  `-Dmateu.bundle.environment=<name>`.
- Auth: register an identity provider in the browser (`registerExternalAuthProvider`) to add an
  `Authorization` header; authorisation lives in the API. No secrets in a bundle.

## Not static (yet)

Server view-model actions, proxied sources/secrets, identity-dependent screens, validators beyond
`required` in the browser expander, action chains with `onSuccess`/`onError`, polling.

## Other goals

- `mateu-bundle:openapi` — derives the OpenAPI contract the UI needs from the catalogue (+ classes
  and/or a bundle `manifest.json`): `-Dmateu.openapi.from=classes|bundle|both`,
  `-Dmateu.openapi.outputFile` (default `target/mateu-openapi.json`).
- `mateu-bundle:server` — generates a Spring Boot module (controllers + ports, never adapters) from
  that OpenAPI file for the `provenance: generate` sources (`-Dmateu.server.outputDirectory`,
  `-Dmateu.server.basePackage`).
- A running Mateu app also serves its bundle live at `GET /mateu/v3/bundle`.

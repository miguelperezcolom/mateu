# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) UI **with no backend**. Mateu is a model-driven UI system: the UI is
declared once, as data, and Mateu renders it. Here the declaration (YAML under `specs/ui`) is
bundled at build time into a folder of plain files — `target/mateu-bundle/` — that any static host
or CDN serves. There is no server, no Spring and no Java code: the browser reads the definitions
and calls the REST APIs named in `sources.yaml` itself.

## Layout

```
pom.xml                      the renderer jar + mateu-bundle-maven-plugin (staticOnly, specsOnly)
.mvn/maven.config            -Dmateu.bundle.mock=true: ship the sources' sample data (remove to go live)
src/main/resources/specs/ui/ THE UI
  app.ui.yaml      type: UI — the mount ("/"), its route files and its home route (`home: home`)
  routes.yaml      type: Routes — each route bound to a `layout:` (a definition file here)
  app.yaml         type: AppShell — title and menu (Home, Products)
  home.yaml        the home page — a hero with a call to action to the products
  products.yaml    type: Listing — a page; every other page is another file like it
  sources.yaml     the REST source catalogue: every endpoint, named once, with `sample:` data
  project.yaml     type: Project — the renderer
```

## Develop, build and preview

```bash
mvn mateu-bundle:dev                 # http://localhost:3000 — rebuilt on every save, the page reloads
mvn mateu-bundle:dev -Dmateu.dev.liveReload=false   # rebuilt on every save; refresh by hand
mvn package                          # → target/mateu-bundle/ (index.html, manifest.json, assets/)
npx serve -s target/mateu-bundle     # preview the finished bundle (-s = SPA fallback)
```

`mateu-bundle:dev` builds exactly what `mvn package` builds (same configuration, same sample data),
serves it with the SPA fallback and watches `src/main/resources`. A change that breaks the build (a
YAML error, a screen that needs a server) is logged and the last good bundle keeps being served. A
busy port moves to the next free one (`-Dmateu.dev.port=…` to choose); Ctrl+C stops it.

**Same project on a phone**: the bundle also opens natively in the Mateu app (React Native) — no
second project. `mvn mateu-bundle:dev` prints the iOS simulator (`localhost`) and Android emulator
(`10.0.2.2`) addresses; with `-Dmateu.dev.host=0.0.0.0` it prints your LAN URL and a QR code that
adds the UI on a phone (a development build of the app accepts plain http).

Deploy `target/mateu-bundle/` to any static host with an SPA fallback (every non-file path serves
`index.html`; Netlify reads the shipped `_redirects`, nginx `try_files $uri /index.html`).

The bundle is an installable app (PWA): Chrome/Edge offer "Install app" (own window and icon) and
phones add it to the home screen. Its name, colour and icon come from `app.yaml` (`title`,
`accentColor`, `logo`); `-Dmateu.bundle.pwa=false` turns it off. https://mateu.io/deploy/install-as-app/

## Rules to respect

- **Edit `specs/ui` only.** No Java, no server code, no frontend code: there is nothing to run them.
- Everything a screen does must be declarable for the browser: data from **named sources**
  (`rowsSource: {ref: products}`), navigation with `RouteLink`s, writes as `actions:` with a
  `restAction`. The build's static-safety check (`staticOnly`) FAILS on anything that needs a server
  — a button with neither a route nor a `restAction`, a `proxy: true` source, a `${secret.…}`.
- Sources are called **from the browser**: the APIs must allow this site's origin (CORS), or sit
  behind the same host as a reverse proxy (then use relative URLs). Never put secrets in a source.
- Every file carries a `$schema` line; keep it. `dataType` values: integer, string, number, date,
  time, dateTime, bool, array, file, status, money… (there is no `decimal`).
- Re-pointing a deployment at another API is an edit of `sources` in `manifest.json`, no rebuild.
- An **unknown key is ignored silently** (by the schema and by the loader): a misspelt key looks
  like a feature that does not work, not like an error — check spellings against the schema.

## References

- **Claude Code plugin `mateu`** (the skills that know this API): `/plugin marketplace add
  miguelperezcolom/mateu`, then `/plugin install mateu@mateu`. A project made by the New Project
  wizards already enables it in `.claude/settings.json` — trust the folder and install it once.
  Skills for this project: `mateu-yaml` (the YAML file kinds, sources, app shell, static bundles), `mateu-run` (preview + screenshot). Guide: https://mateu.io/build-uis-with-ai/
- Static UIs: https://mateu.io/deploy/static-ui/
- REST sources and sample data: https://mateu.io/concepts/data-sources/
- The authoring schema (every component and its keys):
  https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md.
- A static example with a real API: `demo/demo-static-vcn` in https://github.com/miguelperezcolom/mateu

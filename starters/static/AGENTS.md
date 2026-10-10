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
  app.ui.yaml      type: UI — the mount ("/"), its route files and its home route
  routes.yaml      type: Routes — each route bound to a `layout:` (a definition file here)
  app.yaml         type: AppShell — title and menu
  products.yaml    type: Listing — a page; every other page is another file like it
  sources.yaml     the REST source catalogue: every endpoint, named once, with `sample:` data
  project.yaml     type: Project — the renderer
```

## Build and preview

```bash
mvn package                          # → target/mateu-bundle/ (index.html, manifest.json, assets/)
npx serve -s target/mateu-bundle     # preview at http://localhost:3000 (-s = SPA fallback)
```

Deploy `target/mateu-bundle/` to any static host with an SPA fallback (every non-file path serves
`index.html`; Netlify reads the shipped `_redirects`, nginx `try_files $uri /index.html`).

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

## References

- Static UIs: https://mateu.io/java-user-manual/build/static-ui/
- REST sources and sample data: https://mateu.io/java-ui-definition/rest-source-catalogue/
- The authoring schema (every component and its keys):
  https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md.
- A static example with a real API: `demo/demo-static-vcn` in https://github.com/miguelperezcolom/mateu

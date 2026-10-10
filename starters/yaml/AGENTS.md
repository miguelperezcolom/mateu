# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) app **authored entirely in YAML**. Mateu is a model-driven UI system:
the UI is declared once, as data, and Mateu renders it — listings, forms, navigation, the app
shell. This project has **no UI code**: the only Java is the Spring Boot main class that boots the
server, and the web renderer is a prebuilt jar (`mateu-vaadin` or `mateu-redwood`).

Runtime: **Spring Boot 4 (MVC), Java 21, Maven** — it only serves the UI.

## Layout

```
pom.xml                                    Spring Boot + mateu-mvc + the renderer (no annotation processor)
src/main/java/com/example/app/Application.java   boots the server; nothing else
src/main/resources/specs/ui/               THE UI
  app.ui.yaml      type: UI — the mount ("/"), its route files and its home route
  routes.yaml      type: Routes — each route bound to a `layout:` (a definition file here)
  app.yaml         type: AppShell — title and menu
  products.yaml    type: Listing — a page; every other page is another file like it
  sources.yaml     the REST source catalogue: every endpoint, named once, with `sample:` data
  project.yaml     type: Project — the renderer the visual editor and Play use
```

## Run

```bash
mvn spring-boot:run          # http://localhost:8080
```

Sources answer with their `sample:` data (Application.java turns sample mode on until your API
exists); run with `-Dmateu.sources.mock=false` to call the real endpoints.

## Rules to respect

- **Edit `specs/ui`, do not write Java UI.** A new screen is a new definition file plus a
  `routes.yaml` entry (and a menu entry in `app.yaml`). Do not add `@UI` classes, controllers or
  frontend code; if a screen ever needs server-side behaviour, that is a deliberate switch to the
  code or code + YAML flavour, not something to slip in.
- Data comes from **named sources** in `sources.yaml`, referenced by `ref:` (`rowsSource: {ref:
  products}`) — never repeat a URL in a page. Writes are `actions:` with a `restAction` on the page.
- Every file carries a `$schema` line; keep it. Validate against it: an unparseable definition does
  not report itself, the route just answers "Not found". `dataType` values: integer, string, number,
  date, time, dateTime, bool, array, file, status, money… (there is no `decimal`).
- Routes are relative to the mount; a literal route (`products/new`) goes before a parameterised
  sibling (`products/:id`).
- Open the files in the Mateu visual editor (IntelliJ or VS Code plugin) to edit them on a canvas.

## References

- Docs: https://mateu.io — route registry https://mateu.io/java-ui-definition/route-registry/,
  REST sources https://mateu.io/java-ui-definition/rest-source-catalogue/, the YAML app shell
  https://mateu.io/java-ui-definition/yaml-app-shell/.
- The authoring schema (every component and its keys):
  https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md.
- A complete YAML-only CRUD to copy from: `demo/demo-starwars` in https://github.com/miguelperezcolom/mateu
- MCP: set `mateu.mcp.enabled=true` and the running app serves `POST /mateu/mcp`, so an agent can
  discover and operate its screens (https://mateu.io/reference/agent-operability/).

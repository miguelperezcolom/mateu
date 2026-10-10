# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) app. Mateu is a **model-driven UI system**: you declare the model once —
as Java code (`@UI` classes) or as data (YAML under `specs/ui/`) — and Mateu derives the forms,
CRUD screens, navigation and app shell. **There is no frontend code to write**: the web renderer is
a prebuilt jar (`mateu-vaadin` or `mateu-redwood`) served as static assets.

Runtime: **Quarkus 3, Java 21, Maven.**

## Layout

```
pom.xml                                   Mateu deps + the annotation processor (see below)
src/main/java/com/example/app/
  *.java                                  view models (@UI classes), records, CrudStores
src/main/resources/
  application.properties                  server.port, mateu.* settings
  specs/ui/*.yaml                         UI declared as data (mounts, routes.yaml, pages) — optional
```

## Run

```bash
mvn quarkus:dev              # http://localhost:8080 (live reload)
mvn package && java -jar target/quarkus-app/quarkus-run.jar
```

## Where the UI is declared

- **Code**: a class annotated `@UI("<path>")` is a routed screen (`@UI("")` = the app root). Fields
  become form fields / columns, `@Button`/`@Toolbar` methods become actions, bean-validation
  annotations become validation. `AutoCrud<T>` gives a full CRUD.
- **Data**: `specs/ui/**/*.yaml` — a `type: UI` file is a mount (the YAML twin of `@UI`),
  `routes.yaml` binds routes to a `layout:` (definition file) and/or a `viewModel:` (Java class),
  `type: AppShell` is the chrome + menu. `@UI` is the ONLY routing annotation: every inner route
  lives in `routes.yaml` (there is no `@Route`).
- Both styles feed the same wire model and can be mixed in one app.

## Rules to respect

- **View models are per request.** A routed view model is instantiated fresh on every request
  (field `@Inject` still works). Never make one an `@ApplicationScoped`/`@Singleton` bean: if
  it must be a CDI bean, make it `@Dependent` or users will see each other's form state. Keep shared data in a store/service, not in view-model fields.
- **`AutoCrud<T>` must override `store()`** returning a `CrudStore<T>` (`findById`, `save`,
  `findAll`, `deleteAllById`; override `find(searchText, filters, pageable)` to page in the
  database). The entity implements `Identifiable`.
- **The annotation processor is mandatory.** `mateu-annotation-processor-quarkus` must stay in
  `maven-compiler-plugin` → `annotationProcessorPaths` (next to Lombok). Without it no controller
  is generated and every route answers 404.
- Keep `quarkus-rest-jackson` (Mateu's wire is Jackson-serialised).
- Do not hand-write controllers, REST endpoints for the UI, or frontend code — declare the model.
- Prefer annotations and capability interfaces over custom components; check the docs before
  inventing an API.

## References

- Docs: https://mateu.io — quickstart, annotation and interface references, UX patterns.
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md (short) and
  https://mateu.io/mateu-ai-full.md (complete).
- Claude Code skills (`mateu`, `mateu-scaffold`, `mateu-run`, `mateu-screen`, `mateu-federation`):
  copy `.claude/skills/` from https://github.com/miguelperezcolom/mateu into this repo or
  `~/.claude/skills/`.
- MCP: set `mateu.mcp.enabled=true` and the running app serves `POST /mateu/mcp`, so an agent can
  discover and operate its screens (https://mateu.io/reference/agent-operability/).

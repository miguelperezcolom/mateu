# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) app. Mateu is a **model-driven UI system**: you declare the model once —
as Java code (`@UI` classes) or as data (YAML under `specs/ui/`) — and Mateu derives the forms,
CRUD screens, navigation and app shell. **There is no frontend code to write**: the web renderer is
a prebuilt jar (`mateu-vaadin` or `mateu-redwood`) served as static assets.

Runtime: **Spring Boot 4 (WebFlux), Java 21, Maven.**

## Layout

```
pom.xml                                   Mateu deps + the annotation processor (see below)
src/main/java/com/example/app/
  Application.java                        Spring Boot main; scans this package only (Mateu is an auto-configuration)
  *.java                                  view models (@UI classes), records, CrudStores
src/main/resources/
  application.properties                  server.port, mateu.* settings
  specs/ui/*.yaml                         UI declared as data (mounts, routes.yaml, pages) — optional
```

## Run

```bash
mvn spring-boot:run          # http://localhost:8080
mvn package                  # target/*.jar
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
  (field `@Autowired` still works). Never make one a singleton bean: if you register it with
  `@Component`/`@Service`, it MUST be `@Scope("prototype")` or users will see each other's form
  state. Keep shared data in a store/service, not in view-model fields.
- **`AutoCrud<T>` must override `store()`** returning a `CrudStore<T>` (`findById`, `save`,
  `findAll`, `deleteAllById`; override `find(searchText, filters, pageable)` to page in the
  database). The entity implements `Identifiable`.
- **The annotation processor is mandatory.** `mateu-annotation-processor-webflux` must stay in
  `maven-compiler-plugin` → `annotationProcessorPaths` (next to Lombok). Without it no controller
  is generated and every route answers 404.
- Do not add `io.mateu` to `scanBasePackages`: Mateu's beans come with its adapter jar as an
  auto-configuration. Keep your `@UI` classes inside the package `Application` scans.
- Do not hand-write controllers, REST endpoints for the UI, or frontend code — declare the model.
- **Actions are declared.** An `actionId` only runs a method marked as an action (`@Action`,
  `@Button`, `@Toolbar`…) or one the view itself names (a fluent button's `actionId`, a trigger, a
  menu rule) — strict action mode, the default. A method only an undo toast, a test or another
  backend dispatches needs `@Action`; a plain public helper is not reachable from the browser.
- **Security is Spring Security's.** Mateu does not authenticate: add Spring Security (e.g.
  `spring-boot-starter-oauth2-resource-server`) and Mateu reads the principal it authenticated
  (https://mateu.io/java-user-manual/advanced/security/). Mateu's adapter exempts its own JSON
  calls (`<baseUrl>/mateu/v3/**`) from Spring Security's CSRF check automatically: do not disable
  CSRF for it. Only if you set `mateu.security.csrf-exemption.enabled=false`, add
  `csrf.ignoringRequestMatchers(MateuCsrfAutoConfiguration.MATEU_JSON_CALLS)` (`io.mateu.security`)
  yourself (WebFlux:
  `requireCsrfProtectionMatcher(MateuCsrfWebFluxAutoConfiguration.CSRF_PROTECTED)`), or every
  action answers 403.
- `mateu.*` settings (`mateu.actions.strict`, `mateu.errors.detailed`…) go in
  `application.properties` like any other.
- Prefer annotations and capability interfaces over custom components; check the docs before
  inventing an API.

## References

- **Claude Code plugin `mateu`** (the skills that know this API): `/plugin marketplace add
  miguelperezcolom/mateu`, then `/plugin install mateu@mateu`. A project made by the New Project
  wizards already enables it in `.claude/settings.json` — trust the folder and install it once.
  Skills for this project: `mateu` (Java screens), `mateu-screen` (pick the page archetype), `mateu-yaml` (screens as data under `specs/ui`), `mateu-scaffold`, `mateu-run` (run + screenshot), `mateu-federation`. Guide: https://mateu.io/build-uis-with-ai/
- Docs: https://mateu.io — quickstart, annotation and interface references, UX patterns.
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md (short) and
  https://mateu.io/mateu-ai-full.md (complete).
- MCP: set `mateu.mcp.enabled=true` and the running app serves `POST /mateu/mcp`, so an agent can
  discover and operate its screens (https://mateu.io/reference/agent-operability/).

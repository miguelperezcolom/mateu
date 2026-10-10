# Developer journey — UX review findings (pre-beta, v3.0-alpha.410)

Method: [How Mateu's UX is evaluated](../../doc/src/content/docs/ux-patterns/how-ux-is-evaluated.md)
§6 *The developer journey*, run as a cognitive walkthrough (the four questions per step) by a
developer who follows **only** the docs site and the new-project tooling, plus deliberate common
mistakes to judge the error experience. Priorities as defined there (P1 blocks/misleads, P2 slows
down / recoverable errors, P3 polish).

References cited: Nielsen's heuristics (H1 visibility of system status, H2 match with the real
world, H5 error prevention, H9 help users recognise, diagnose and recover from errors, H10 help and
documentation); NN/g *Error-Message Guidelines* (say what happened, where, and how to fix it — in the
user's vocabulary, not the implementation's); Krug, *Don't Make Me Think* (every question mark adds
cognitive load); Norman, *The Design of Everyday Things* (gulf of evaluation: the system must show
what state it is in).

## Journey run

| Step | How | Result |
|---|---|---|
| New project — code / Spring MVC / Vaadin | `node frontend/app/vscode-extension/scripts/new-project.mjs --authoring code` (same engine as VS Code) | ✅ builds, boots, Products CRUD renders (`code-root.png`) |
| New project — YAML only, served | CLI `--authoring yaml --pages form,dashboard`; archetype `-Dauthoring=yaml` (JDK 21) | ✅ (`yaml-products.png`) |
| New project — static | CLI `--authoring static`; `mvn package && npx serve -s target/mateu-bundle` | ✅ (`static-products.png`) |
| New project — archetype on the default JDK (26) | `mvn archetype:generate … -Dauthoring=code` | ❌ DX-07 |
| First screen | `first-app.md` into the generated project | ❌ DX-02, DX-11 |
| First CRUD | the generated `Products` (quickstart) | ✅ |
| Add a YAML screen | quickstart-yaml §3 (definition + route + menu), live | ✅ (`yaml-orders.png`), appears without restart |
| Live reload | `live-reload.md` | ❌ DX-06 as documented; ✅ with the corrected command: an edit re-renders the open page in 614 ms, no page load |
| Production / static bundle | `deploy-to-production.md`, quickstart-yaml | ❌ DX-08, DX-09, DX-10 |
| Mistakes | missing `store()`, entity without `Identifiable`, missing AP, two `@UI("")`, `dataType: decimal`, unknown `type:`, YAML syntax error, `routes.yaml` layout typo, menu link to an undeclared route | see DX-01…05, DX-16, DX-18 |

## Findings

| Id | Step / screen | Steps to reproduce | Evidence | Method | Reference | P | Status |
|---|---|---|---|---|---|---|---|
| DX-01 | Missing annotation processor | Remove `mateu-annotation-processor-mvc` from `annotationProcessorPaths`, build, run | App boots cleanly; `/` and `/mateu/v3/sync` answer Spring's JSON 404; **nothing** in the log | Mistake run | H9; NN/g error messages (an error must be visible) | P2 | **Fixed** (Spring MVC/WebFlux): `NothingToServeCheck` logs at startup *"Mateu found no UI to serve … add io.mateu:mateu-annotation-processor-mvc to `<annotationProcessorPaths>` …"*. Quarkus/Micronaut/Helidon not wired (their bean lookup of `RoutedClassProvider` was not verified here) |
| DX-02 | First screen in a generated project | Follow `first-app.md` step 1 (`@UI("")`) in the generated project (root already `Products`) | Compiles; startup dies with `Ambiguous mapping. Cannot map 'ProductsController' method` deep in a Spring stack — names a generated class, not the `@UI` to change | Walkthrough + mistake | H9, H5 | P2 | **Fixed**: the AP fails the compilation: *"@UI("") on com.acme.codeapp.Products uses the same path as com.acme.codeapp.Home: each @UI mount needs its own path. Give one of them another path (e.g. @UI("/home")), or … an inner route in src/main/resources/specs/ui/routes.yaml."* (`UIAnnotationProcessorTest`). Doc note added to `first-app.md` |
| DX-03 | YAML definition with a wrong value | `dataType: decimal` in `form.yaml` (or `type: GridColum`, or `pageSize: ten`) | Browser: *"Page not found — It may have been deleted, or the link is wrong."* (`yaml-form-decimal.png`) — false and misleading. Log: WARN in Jackson's words, `at [Source: UNKNOWN; byte offset: #UNKNOWN]`, no line | Mistake run | H9, H2 (vocabulary), Norman (gulf of evaluation) | P2 | **Fixed**: `YamlSpecProblems` — log *"Could not read the definition specs/ui/form.yaml, line 11 (content[0].content[2].dataType): "decimal" is not a valid value — use one of: integer, string, number, … The definition is ignored until this is fixed, so its route answers "Page not found"."*; unknown types say *unknown type "GridColum" — known here: [GridColumn, GridGroupColumn] (type names are case-sensitive)*; in **development mode** the not-found page shows the route's own problem instead of the generic text (`after-decimal.png`). Never outside dev mode (would describe server files). `YamlSpecProblemsTest` (7) |
| DX-04 | `routes.yaml` names a layout file that does not exist | `layout: dashbord.yaml` | Completely silent (DEBUG only) in Java, .NET and Python; page "not found" | Mistake run | H9 | P2 | **Fixed** in all three: WARN *routes.yaml: route "dashboard" names layout "dashbord.yaml", but specs/ui/dashbord.yaml does not exist. Check the file name (it is relative to specs/ui/) or create the file.* (+ dev-mode page). Tests: `YamlSpecProblemsTest`, `YamlDefinitionProblemsTests.cs`, `test_yaml_definition_problems.py` |
| DX-05 | Python port, YAML syntax error | Unclosed `{` in a definition | `yaml_spec_loader._parse` swallowed `yaml.YAMLError` with no log at all (Java already logged the parser's line) | Code review of the mirror | H9 | P2 | **Fixed**: WARN with `file, line N: <problem>`. .NET already logged YamlDotNet's message (which carries line/col) |
| DX-06 | Live reload | `live-reload.md`: "`-Dmateu.dev=true`"; natural reading: `mvn spring-boot:run -Dmateu.dev=true` | No banner, no watcher: dev mode silently OFF (`spring-boot:run` forks the app JVM) | Walkthrough | H10, H1 | P2 | **Fixed (doc)**: caution box with three verified commands (`MATEU_DEV=true mvn spring-boot:run`, `-Dspring-boot.run.arguments=--mateu.dev=true`, `-Dspring-boot.run.jvmArguments=-Dmateu.dev=true`) and "if the banner is not in the log, it is off" |
| DX-07 | Maven archetype on JDK 26 | `mvn archetype:generate …` with the machine's default JDK 26 | `BUG! exception in phase 'semantic analysis' … Unsupported class file major version 70`, and a half-generated folder (`variants/`, `generator/`) left behind that looks like a project | Walkthrough | H9, H5 | P2 | **Mitigated (doc)**: the limit was only a parenthesis in *Create your project*; now a caution with the exact symptom and the recovery (delete the folder, `JAVA_HOME` on 21–25) in both quickstarts and the index. **Left**: the real fix is a Groovy-free archetype or a pinned archetype-plugin/Groovy that reads class-file 70 |
| DX-08 | Deploy | Generated YAML app's `Application.java` forces `mateu.sources.mock=true`; static project ships `-Dmateu.bundle.mock=true` | `deploy-to-production.md` never mentions it: a jar deployed as generated serves the **sample data** in production | Walkthrough | H5 (error prevention) | P2 | **Fixed (doc)**: "Sample mode is off" check + go-live checklist item; dev mode off item too |
| DX-09 | Deploy — authorization | `deploy-to-production.md` §4 | Said `@EyesOnly`… "read roles … from the JWT in the `Authorization` header" — contradicts the security model (Mateu never decodes a token; roles come only from the principal the framework authenticated) and the next bullet. A reader could ship without a resource server | Doc review | H10; misleading security guidance | **P1** | **Fixed** |
| DX-10 | Deploy — static bundle | §5 said `mvn -Pbundle package` | No `bundle` profile in a generated project (it exists in the demos) | Walkthrough | H10 | P3 | **Fixed** |
| DX-11 | First screen | `first-app.md` | Snippets with no imports; `@Button` resolves in IDEs to both the annotation and the `io.mateu.uidl.data.Button` record | Walkthrough | Krug (question marks) | P3 | **Fixed**: full class with imports + the ambiguity named |
| DX-12 | Generated `AGENTS.md` (code, MVC/WebFlux) | Read it next to `Application.java` | Said "scans io.mateu + this package … Keep `scanBasePackages` including `io.mateu`", while the generated main says there is no reason to scan `io.mateu` | Doc review | Consistency (H4) | P3 | **Fixed** in `starters/spring-mvc|spring-webflux/AGENTS.md` |
| DX-13 | First boot of any starter | `mvn spring-boot:run` | Every fresh app prints a WARN *"Mateu does not authenticate … restricted UI stays hidden for everyone"* although nothing is restricted — trains developers to ignore Mateu's warnings | Walkthrough | H8 (signal/noise) | P3 | **Fixed**: INFO, phrased conditionally ("only matters if your UI restricts something …") |
| DX-14 | CLI generator | `node scripts/new-project.mjs --help` | Node stack trace `ERR_PARSE_ARGS_UNKNOWN_OPTION` | Walkthrough | H9 | P3 | **Fixed**: `--help`/`-h`, usage on unknown option or missing `--out` |
| DX-15 | YAML starter, *Form* page template | Generate with `--pages form`, open Form, press **Save** | Nothing happens: no request, no message (`yaml-form-save.png`). The template's comment says to bind it, but the end user of the generated app sees a dead button | Walkthrough (Q4: will they understand the response?) | H1; Norman (feedback) | P2 | **Open** — template lives in `frontend/app/intellij-plugin/src/main/resources/fileTemplates/internal/Mateu Page Form.yaml.ft` (shared by both IDE generators; outside this part's files). Options: ship the template with a working `actions:` flow (e.g. a `message` step), and/or have the web client tell a developer in dev mode that an action was not claimed by anyone |
| DX-16 | Menu entry to an undeclared route | `RouteLink route: invoices` with no route | Silent; clicking answers "Page not found". `MenuRouteConformance` exists in all three backends but only runs in tests | Mistake run | H5 | P3 | **Open**: run it at boot/dev mode and WARN dangling leaves |
| DX-17 | YAML syntax error in a page | Unclosed `{` | Two WARNs; `MountRegistry` calls the page a "route file" (`Failed to read route file specs/ui/products.yaml`) | Mistake run | H2 | P3 | Open |
| DX-18 | Quickstart troubleshooting | Common compile errors | `type argument Product is not within bounds of type-variable T` (entity without `Identifiable`) and the `store()` error were not in "Not seeing it?" | Mistake run | H10 | P3 | **Fixed**: four rows added (incl. DX-01/DX-02 messages) |
| DX-19 | Archetype vs CLI | Same coordinates | Archetype puts code in `com.acme`, CLI/IDE in `com.acme.<artifact>` | Comparison | Consistency | P3 | Open (cosmetic; Maven's archetype convention) |

Checked and fine (no finding): missing `store()` → clear javac error naming `store()`; a YAML syntax
error in Java already logged the parser's line/column; `MATEU_DEV=true` / `--mateu.dev=true`
work; adding a YAML screen with dev mode appears without restart; the static bundle builds and
serves with `npx serve -s`.

## For the web-renderer review (not edited here)

- **W-a** (P2): an action no component claims (YAML Save without `actions:`) is dropped silently —
  no feedback at all (DX-15). A dev-mode console warning / toast would close the gulf.
- **W-b** (P3): a YAML listing's `dataType: status` column shows the raw constant (`OUT_OF_STOCK`)
  even when the same values carry labels in the filter options — Java enums are humanized.
- **W-c** (P3): the generated CRUD renders edge-to-edge with no side gutter at 1280 px
  (`code-root.png`); the YAML shell's pages have one.

## Totals

P1: 1 (fixed) · P2: 9 (7 fixed, 1 mitigated in docs, 1 open) · P3: 9 (6 fixed, 3 open).

Evidence (screenshots, logs, generated projects):
`/private/tmp/claude-501/-Users-mguel-IdeaProjects-mateu/e5e6bb22-fdb5-44ff-95b8-b8117e101445/scratchpad/ux-native/dx/`.

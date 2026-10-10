# Mateu demos

Runnable demo apps. The **progressive Star Wars suite** is the guided tour; the rest are focused or
kitchen-sink showcases. For the smallest possible app on each runtime, see [`../starters`](../starters).

## Which Mateu version a demo uses

Every demo takes the Mateu version from its `mateu.version` property:

- **"Start here" demos** (the Star Wars suite and the `demo-vaadin-*` portability set) default to the
  **latest release on Maven Central** — clone, `cd`, run. Nothing to build first.
- **Showcase demos** (admin panel, front office, Redwood/VB, static bundles, explorer) track
  `master` and use features newer than the last release, so they default to the snapshot version
  `0.0.1-MATEU`, which only exists once you have **built the backend yourself**:

```bash
cd backend && mvn install -DskipTests      # once, and again after pulling backend changes
```

Any demo can be switched either way from the command line:

```bash
mvn spring-boot:run -Dmateu.version=0.0.1-MATEU     # a "start here" demo against your checkout
```

CI compiles every module of this folder against the backend of each commit
(`.github/workflows/examples.yml`), so they do not rot.

## The progressive suite — one ladder, six rungs

The same idea (*declare information, Mateu renders the UX*) shown from one end of the authoring
spectrum to the other. Each example adds exactly one capability on top of the previous, using a
shared Star Wars theme. Read them in order.

| # | Module | Port | What it adds | Run |
|---|---|---|---|---|
| **1** | [`demo-starwars`](demo-starwars) | 8600 | **100% YAML over an external API** — mount, shell, routes, sources and CRUD authored as data (`specs/ui/**`), live from [swapi](https://swapi.ec1.mateu.io); reference combos. No Java UI. | `mvn spring-boot:run` |
| **2** | [`demo-starwars-2-code-first`](demo-starwars-2-code-first) | 8601 | **The first line of Java** — one `@UI` + `AutoCrud<T>` over an in-memory store gives a full CRUD, inferred from a record. | idem |
| **3** | [`demo-starwars-3-forms`](demo-starwars-3-forms) | 8602 | **Rich forms** — a multi-step `Wizard` (zoned step, STEPS progress) and a tabbed form (textarea, stars, toggle, date, money, radios). | idem |
| **4** | [`demo-starwars-4-app`](demo-starwars-4-app) | 8603 | **Archetypes + app shell** — a `Dashboard` (metric scoreboard + chart panels) and a CRUD behind an `@App(commandCenter=true)` shell. | idem |
| **5** | [`demo-starwars-5-federation`](demo-starwars-5-federation) | 8604 | **Build-time federation** — two independent `@UI` modules composed by one shell app (two-step annotation processing). | `mvn install` in the folder, then `mvn spring-boot:run` in `shell-app` |
| **6** | [`demo-starwars-6-static-bundle`](demo-starwars-6-static-bundle) | 8605 | **A static bundle** — `mvn -Pbundle package` compiles the screen into a static SPA served with **no backend**; live data from swapi. | `mvn -Pbundle package` → serve `target/mateu-bundle/` |

Declared once — served by a backend (1–4), federated (5), and shipped as a static bundle (6): the
full spectrum. Each module has its own README with the details.

```bash
# e.g. run Example 2
cd demo/demo-starwars-2-code-first
mvn spring-boot:run     # → http://localhost:8601
```

## The same app on every Java runtime

Portability across the wire: the same kind of screens on each supported framework. Start-here
version (latest release).

| Module | Runtime | Port | Run |
|---|---|---|---|
| `demo-vaadin-mvc` | Spring Boot 4 MVC, Java 21 | 8091 | `mvn spring-boot:run` |
| `demo-vaadin-webflux` | Spring Boot 4 WebFlux, Java 21 | 8092 | `mvn spring-boot:run` |
| `demo-vaadin-micronaut` | Micronaut 4 | 8093 | `mvn mn:run` |
| `demo-vaadin-quarkus` | Quarkus 3 | 8094 | `mvn quarkus:dev` |
| `demo-vaadin-helidon-mp` | Helidon MP 4 | 8095 | `mvn package && java -jar target/demo-vaadin-helidon-mp.jar` |
| `demo-vaadin-kotlin-mvc` | Spring Boot 4 MVC, Kotlin | 8096 | `mvn spring-boot:run` |

## Focused & kitchen-sink demos (track master — build the backend first)

| Module | Port | What it shows |
|---|---|---|
| `demo-admin-panel` | 8595 | Kitchen sink: most archetypes, components and UX patterns (dashboards, gantt, foldout, wizards, inline CRUD, drawers…). |
| `demo-front-office` | 8594 | Hotel front-office UX (check-in queue + wizard, folio/payment, `@AppContext` Staff/Cliente audiences). |
| `demo-front-office-evolution` | 8596 | The same front office, evolved (foldout reservation overview, operations panels). |
| `demo-app-definition` | 8099 | A mount defined entirely in YAML (`type: UI` + app block + routes). |
| `demo-static-bundle` | 8097 | Static bundle that also derives an OpenAPI + a server for its OWN endpoints (the full `mateu-bundle` path). |
| [`demo-static-vcn`](demo-static-vcn) | — (static) | A 100% static UI over an external REST API, authored twice (Java and YAML): no Mateu backend at runtime. `run-static.sh` builds and serves it. |
| `demo-redwood-showcase` | 8597 | The Redwood renderer line. |
| `explorer` | 8598 | Explorer app on the Redwood renderer. |
| [`demo-vb`](demo-vb) | 9005 | Reference app for the Redwood / Oracle Visual Builder renderer. |
| [`demo-vb-pms`](demo-vb-pms) | 9010 | An OPERA Cloud-like property management system, written once, rendered by both Redwood and Vaadin. |

## Notes

- Ports above are the defaults in each module's `application.properties` (or the framework's
  equivalent); every demo has its own, so several can run at once.
- `demo-starwars` (1) and `demo-starwars-6-static-bundle` read live data from
  `https://swapi.ec1.mateu.io`; when that service is down they start but show no rows.
- The repository-root `settings.xml` is only needed if your Maven setup cannot reach Maven Central
  directly: `mvn -s ../../settings.xml …`.

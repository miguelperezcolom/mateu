# Mateu demos

Runnable demo apps. The **progressive Star Wars suite** is the guided tour; the rest are focused or
kitchen-sink showcases.

## The progressive suite — one ladder, six rungs

The same idea (*declare information, Mateu renders the UX*) shown from one end of the authoring
spectrum to the other. Each example adds exactly one capability on top of the previous, using a
shared Star Wars theme. Read them in order.

| # | Module | Port | What it adds | Run |
|---|---|---|---|---|
| **1** | [`demo-starwars`](demo-starwars) | 8600 | **100% YAML over an external API** — mount, shell, routes, sources and CRUD authored as data (`specs/ui/**`), live from [swapi](https://swapi.ec1.mateu.io); reference combos. No Java UI. | `mvn -s ../../settings.xml spring-boot:run` |
| **2** | [`demo-starwars-2-code-first`](demo-starwars-2-code-first) | 8601 | **The first line of Java** — one `@UI` + `AutoCrud<T>` over an in-memory store gives a full CRUD, inferred from a record. | idem |
| **3** | [`demo-starwars-3-forms`](demo-starwars-3-forms) | 8602 | **Rich forms** — a multi-step `Wizard` (zoned step, STEPS progress) and a tabbed form (textarea, stars, toggle, date, money, radios). | idem |
| **4** | [`demo-starwars-4-app`](demo-starwars-4-app) | 8603 | **Archetypes + app shell** — a `Dashboard` (metric scoreboard + chart panels) and a CRUD behind an `@App(commandCenter=true)` shell. | idem |
| **5** | [`demo-starwars-5-federation`](demo-starwars-5-federation) | 8604 | **Build-time federation** — two independent `@UI` modules composed by one shell app (two-step annotation processing). | build the reactor, then run `shell-app` |
| **6** | [`demo-starwars-6-static-bundle`](demo-starwars-6-static-bundle) | 8605 | **A static bundle** — `mvn -Pbundle package` compiles the screen into a static SPA served with **no backend**; live data from swapi. | `mvn -Pbundle package` → serve `target/mateu-bundle/` |

Declared once — served by a backend (1–4), federated (5), and shipped as a static bundle (6): the
full spectrum. Each module has its own README with the details.

```bash
# e.g. run Example 2
cd demo/demo-starwars-2-code-first
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8601
```

## Focused & kitchen-sink demos

| Module | Port | What it shows |
|---|---|---|
| `demo-admin-panel` | 8595 | Kitchen sink: most archetypes, components and UX patterns (dashboards, gantt, foldout, wizards, inline CRUD, drawers…). |
| `demo-front-office` / `-evolution` | 8594 / 8595 | Hotel front-office UX (check-in queue + wizard, folio/payment, `@AppContext` Staff/Cliente audiences). |
| `demo-app-definition` | 8099 | A mount defined entirely in YAML (`type: UI` + app block + routes). |
| `demo-static-bundle` | 8097 | Static bundle that also derives an OpenAPI + a server for its OWN endpoints (the full `mateu-bundle` path). |
| `demo-redwood-showcase` · `explorer` · `demo-vb` | 8595 · 8595 · 9005 | The Redwood/VB renderer line. |
| `demo-vaadin-{mvc,webflux,micronaut,quarkus,helidon-mp,kotlin-mvc}` | 8091 · … | The same app on each supported Java framework — portability across the wire. |

## Notes

- Most modules use the repo-root `settings.xml` for the Maven repo: `mvn -s ../../settings.xml …`.
- Ports above are the defaults in each module's `application.properties`.

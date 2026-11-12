---
title: "Create your project"
description: "Create a new Mateu project — code, code + YAML, YAML served by a backend, or YAML static with no backend — from the IDE wizards, the Maven archetype or a starter."
---

Start a new Mateu project from one of the three front doors below, or add Mateu to an existing
project by hand. Either way there is no separate frontend project.

## Start a new project

All three front doors generate the same project, from the same templates: the
[official starters](https://github.com/miguelperezcolom/mateu/tree/master/starters), which CI
compiles and boots on every change. The Mateu version is the latest release on Maven Central.

| Front door | How |
|---|---|
| **IntelliJ IDEA** (Mateu plugin) | **File › New › Project… › Mateu** — choose the options, the project opens when it is created. |
| **VS Code** (Mateu extension) | Command palette › **Mateu: New Project…** — quick picks, then a folder; the project opens when it is created. |
| **Maven** | `mvn archetype:generate -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype -DarchetypeVersion=MATEU_VERSION -DgroupId=com.acme -DartifactId=my-app -Dauthoring=code` |

The first choice is **how you author the UI**:

| Authoring | What you get | Runtimes |
|---|---|---|
| **Code** | Screens are classes: `@UI` (Java), `[UI]` (C#) or `@ui` (Python). An app shell with a menu and the screens of the [template](#start-from-a-template) you pick — a Product CRUD by default. | Spring Boot MVC/WebFlux, Quarkus, Micronaut, Helidon MP, .NET, Python |
| **YAML only, served by a backend** | **No UI code at all**: the Spring Boot main class plus `src/main/resources/specs/ui/` — a `type: UI` mount (with its `home:`), `routes.yaml`, an app shell, a home page, a listing and `sources.yaml` with sample data. See the [YAML quickstart](/define/yaml/quickstart/). | Spring Boot MVC |
| **YAML only, static** | **No backend**: the same YAML, bundled at build time into a folder of static files for any CDN. | none — `mvn package` writes `target/mateu-bundle/` |
| **Code + YAML** | App shell, routes and the home page as YAML; the Product CRUD as a Java view model bound in `routes.yaml`. | Spring Boot MVC/WebFlux, Quarkus |

Whatever you pick, the project runs out of the box and opens on its **home page** (the dashboard,
for the *Dashboard + listings* template).

### Start from a template

The **template** is the app the new project starts from — a small, idiomatic business starting point
that shows one family of Mateu screens. Each one is generated from the same starters (an overlay of a
few files on top of them), compiles, starts and is kept by the generator's tests.

| Template | Authoring | What it starts you with |
|---|---|---|
| **Back office: Product CRUD** (`crud`, the default) | Code | A home page and a **Products** CRUD: listing with search, create, detail, edit and delete, all derived from one record and its `CrudStore`. |
| **Dashboard + listings** (`dashboard`) | Code (Java) | A [dashboard](/ux-patterns/dashboard/) the app opens on — a KPI band of `MetricCard`s (clickable: they open the listings) and charts computed from the data —, a read-only, searchable **Orders** [listing](/java-user-manual/build/capability-listings/) and the Products CRUD. |
| **Wizard-driven intake** (`intake`) | Code (Java) | A multi-step request **wizard** with a branching step (the company details only for companies), a read-only review before it is submitted and a result step; the submitted requests in a searchable listing. |
| **Operations: board + calendar** (`operations`) | Code (Java) | A **kanban board** whose cards move between stages on the server (drop a card: an action records the move), and the same tasks on a [calendar page](/ux-patterns/calendar/) by due date, with month, week and list views. |
| **Home only** (`empty`) | Code | The shell and the home page alone, to add your own screens to. |
| **Home + Product listing** (`listing`, the default) | YAML (served or static) | A searchable, filterable listing over a REST source, with sample data until the API exists. |
| **Star Wars over a public REST API** (`swapi`) | YAML (served or static) | People and planets listings with search, a filter and server-side paging, and a record page for each row — read live from the public `swapi.mateu.io` API, no UI code and no sample data. |

The IDE wizards show the templates the chosen flavour and runtime offer, each with a one-line
description; the .NET and Python starters offer the CRUD. Every template keeps the same project
layout, so moving on from one is editing it: the stores are in-memory classes to replace with your
database or API.


Then, where they apply: the **runtime**, the **renderer** (Vaadin, or Oracle Redwood for Spring
Boot), the **template** to start from, **sample pages from the page templates** (for the YAML flavours, in
the IDEs) and the Maven coordinates. The archetype takes `-Dauthoring=code|yaml|static`,
`-Drenderer=vaadin|redwood` and `-Dtemplate=crud|dashboard|intake|operations|empty` (code) or
`-Dtemplate=listing|swapi` (YAML) — the older `-Dsample=crud|empty` still works —, on Spring Boot
(MVC), with any JDK from 21 on. The build tool is Maven. From a clone of the repository the same
generator runs on the command line: `node frontend/app/vscode-extension/scripts/new-project.mjs
--authoring code --template dashboard --out my-app` (after `npm run compile` in that folder).

Every generated project carries an **`AGENTS.md`** — what the project is, its layout, how to run it,
where the UI is declared and the rules an AI assistant must respect (view models are per request,
`store()` on `AutoCrud`, `routes.yaml`…, or for a YAML-only project: edit `specs/ui`, add no Java
UI) — and a **`CLAUDE.md`** that imports it, so Claude Code and the tools that read `AGENTS.md`
(Codex, Cursor, Copilot…) get the same guidance. See [Use Mateu with AI assistants](/ai-assistant-reference/).

## Add Mateu by hand

The setup is a Maven dependency plus an annotation processor.

## Choose your framework

| Framework | Module |
|---|---|
| [Spring Boot MVC](/java-create-your-project/springboot-mvc/) | `mateu-mvc` |
| [Spring Boot WebFlux](/java-create-your-project/springboot-webflux/) | `mateu-webflux` |
| [Quarkus](/java-create-your-project/quarkus/) | `mateu-quarkus` |
| [Micronaut](/java-create-your-project/micronaut/) | `mateu-micronaut` |
| [Helidon MP](/java-create-your-project/helidon/) | `mateu-helidon-mp` |

## Common setup pattern

All integrations follow the same steps:

1. Import `io.mateu:mateu-bom` (so no Mateu artifact needs its own version)
2. Add the framework-specific Mateu core dependency
3. Add the annotation processor to the compiler's **processor path** (never as a regular dependency)
4. Add a renderer dependency (choose your design system)

The annotation processor generates the framework-specific controllers and routes from your `@UI` classes at compile time. You do not write controllers by hand.

All five adapters serve the same HTTP contract — the UI endpoints, streamed actions (Server-Sent
Events, e.g. a `LongTask`), the SPA deep-link fallback, the renderers' error log, asset caching,
YAML-defined mounts and the optional MCP endpoint — and read the same
[configuration properties](/java-create-your-project/configuration/). Cross-origin access and MCP
are **off** until you turn them on.

## Choose a renderer

All integrations support the same set of frontends — change renderer by swapping one dependency:

| Artifact | Design system |
|---|---|
| `mateu-vaadin` | Vaadin (default, recommended) |
| `mateu-redwood` | Oracle Redwood, on Visual Builder — loads Oracle's components from its CDN under **your** Oracle terms ([licensing](/design-systems/oracle-redwood/)) |

## Before you start

See [Prerequisites](/java-create-your-project/prerequisites/) for Java version and build tool requirements.

## Next

- [Spring Boot MVC setup](/java-create-your-project/springboot-mvc/)
- [Quickstart](/java-user-manual/start-here/quickstart/)

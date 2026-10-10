---
title: "Create your project"
description: "Set up a new Mateu project with your Java backend framework of choice."
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
| **Maven** | `mvn archetype:generate -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype -DarchetypeVersion=<release> -DgroupId=com.acme -DartifactId=my-app -Dauthoring=code` |

The first choice is **how you author the UI**:

| Authoring | What you get | Runtimes |
|---|---|---|
| **Code** | Screens are classes: `@UI` (Java), `[UI]` (C#) or `@ui` (Python). A Product CRUD, or an empty home screen. | Spring Boot MVC/WebFlux, Quarkus, Micronaut, Helidon MP, .NET, Python |
| **YAML only, served by a backend** | **No UI code at all**: the Spring Boot main class plus `src/main/resources/specs/ui/` — a `type: UI` mount, `routes.yaml`, an app shell, a listing and `sources.yaml` with sample data. See the [YAML quickstart](/java-user-manual/start-here/quickstart-yaml/). | Spring Boot MVC |
| **YAML only, static** | **No backend**: the same YAML, bundled at build time into a folder of static files for any CDN. | none — `mvn package` writes `target/mateu-bundle/` |
| **Code + YAML** | App shell, routes and pages as YAML; the Product CRUD as a Java view model bound in `routes.yaml`. | Spring Boot MVC/WebFlux, Quarkus |

Then, where they apply: the **runtime**, the **renderer** (Vaadin, or Oracle Redwood for Spring
Boot), the sample to start from, **sample pages from the page templates** (for the YAML flavours, in
the IDEs) and the Maven coordinates. The archetype takes `-Dauthoring=code|yaml|static`,
`-Drenderer=vaadin|redwood` and `-Dsample=crud|empty`, on Spring Boot (MVC); run it with a JDK 21–25
(the archetype plugin's Groovy cannot read newer class files yet). The build tool is Maven.

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

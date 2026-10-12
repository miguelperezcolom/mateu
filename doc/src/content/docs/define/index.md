---
title: "Define the UI"
description: "Three ways to author a Mateu UI — YAML with the visual editor, code in Java, C# or Python, or both — producing the same model."
---

There are three ways to author a Mateu UI. They sit at the same level: none is the "real" one and
the others a shortcut, because all of them produce the same [model](/mateu-about/the-model/).

| Path | You write | Good for |
|---|---|---|
| [**YAML + visual editor**](/define/yaml/quickstart/) | YAML files under `specs/ui/`, by hand or with the [visual editor](/define/yaml/visual-editor/) | screens over APIs that already exist; teams without a backend of their own; static deployments |
| **Code** — [Java](/java-user-manual/start-here/quickstart/), [C#](/csharp-user-manual/), [Python](/python-user-manual/) | annotated classes (and a fluent API for full control) | screens with server-side logic, validation and data access; teams that want the UI next to the domain code |
| [**Both**](/define/mixing/) | layout in YAML, behaviour in code | screens designed visually but backed by real logic |

## YAML + visual editor (no code)

A UI made only of data: a mount, a route registry, an app shell, pages and a catalogue of the REST
endpoints they use. Every file has a published JSON Schema, so your editor validates and completes
it; the visual editor in IntelliJ and VS Code edits the same files on a canvas.

- [Quickstart](/define/yaml/quickstart/) — a running app with no UI code.
- [Pages in YAML](/define/yaml/pages/), [App shell as data](/define/yaml/app-shell/),
  [Partials](/define/yaml/partials/).
- [The visual editor](/define/yaml/visual-editor/) and [IDE tooling](/native/ide-tooling/).
- [Permissions](/define/yaml/permissions/), [Translations](/define/yaml/translations/),
  [Project settings](/define/yaml/project-settings/).
- Shared with code: [routes](/concepts/routes-and-mounts/),
  [data sources](/concepts/data-sources/), [actions](/concepts/action-catalogue/).

## Code: Java, C#, Python

Annotate a class and Mateu derives the screen from its fields and methods: a record becomes a form
and a listing, a method becomes a button, bean validation becomes client- and server-side
validation. When the defaults are not enough, a fluent component API gives full control.

- **Java** — the most complete implementation; runs on Spring Boot MVC and WebFlux, Quarkus,
  Micronaut and Helidon MP. Start at the [Java quickstart](/java-user-manual/start-here/quickstart/).
  [Kotlin](/kotlin-user-manual/) uses the same annotations.
- **C#** — ASP.NET Core. See [C#](/csharp-user-manual/).
- **Python** — FastAPI and Pydantic. See [Python](/python-user-manual/).

The [Language Rosetta](/reference/language-rosetta/) maps each idiom across the three, and the
[parity matrix](/reference/parity/) shows what each server supports today.

## Both

A route can bind a YAML layout to a code view model: the file decides what the screen looks like,
the class supplies state, actions and validation. See [Mixing YAML and code](/define/mixing/).

## With design tools and AI

- [From Figma](/design-systems/figma/) — design with the Mateu component library, generate the
  implementation.
- [AI assistants](/ai-assistant-reference/) and [prompt-to-app](/reference/prompt-to-app/) — an AI
  writes the model as data and the schemas check it mechanically.

---
title: "Native image (GraalVM)"
description: "Build a Mateu app as a GraalVM native executable on Spring Boot, Micronaut or Quarkus: no reflection configuration to write, the app starts in tens of milliseconds."
---

A Mateu app builds as a **GraalVM native executable** the way its framework builds any app — and you
write no reflection configuration for it.

| Runtime | How | What provides Mateu's native support |
|---|---|---|
| **Spring Boot** | `mvn -Pnative native:compile` (or `spring-boot:build-image -Pnative`) | `mateu-core` (since 3.0.3) |
| **Micronaut** | `mvn package -Dpackaging=native-image` (or `docker-native`) | `mateu-core` (since 3.0.3) |
| **Quarkus** | `quarkus build --native` / `mvn package -Dnative` | the [quarkus-mateu](https://docs.quarkiverse.io/quarkus-mateu/dev/) extension |

## Why it needs support at all

Mateu maps your view models **reflectively** at run time: it instantiates the class a request names,
walks its fields, methods and record components, fills its state from the form and invokes its
actions. It also reaches classes by name (a `routes.yaml` view model), through generic arguments
(`AutoCrud<Product>`) and through `@Menu` fields. A native image keeps only what the build can prove
reachable, so all of that has to be registered.

## What is registered

Mateu does not try to walk that graph — it would always miss some class. It registers the whole
surface instead:

- every class of Mateu's own artifacts;
- every class of each **application entry** of the classpath: a directory or jar one of whose
  classes refers to Mateu, or that carries `specs/ui` (third-party libraries never do) — and arrays
  of them;
- the renderer's assets, `specs/`, `META-INF/mateu` and the PWA files, the validation message
  bundle and the request proxy Mateu uses.

On Spring Boot, Micronaut and Helidon this is `MateuNativeImageFeature`, which `mateu-core` activates
through `META-INF/native-image/io.mateu/mateu-core/` as soon as it is on the classpath. On Quarkus
the extension does the same through Quarkus' build steps (and the feature stands aside).

The cost is a somewhat larger executable than a hand-tuned configuration would give. A class whose
members need a dependency your app does not have (OpenTelemetry, for example) is left out — it
could not run anyway.

## What has been verified

Built native and exercised in a browser: Java screens (forms, actions calling injected beans, a CRUD
— listing, create, edit — and validation messages) with the Vaadin and the Redwood renderers,
screens declared in YAML, on Spring Boot, Micronaut and Quarkus. CI builds the Spring Boot and
Micronaut starters native and smoke-tests them on every backend change.

Not verified in native yet: server-sent events (`LongTask`), federated menus, Excel/PDF exporters
(they are your beans), the MCP endpoint, and Helidon. If you build one of those native and something
is missing, please [open an issue](https://github.com/miguelperezcolom/mateu/issues).

## Requirements

What your framework requires for a native build: GraalVM (or Mandrel) for Java 21+ — 25 for
Micronaut 5 — or a container build. Nothing Mateu-specific.

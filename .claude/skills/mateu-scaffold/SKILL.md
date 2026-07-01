---
name: mateu-scaffold
description: Scaffold a new Mateu project or module and wire the Maven build correctly — the two-step annotation processing (indexer + framework AP), the renderer dependency, and the Spring Boot main class. Use when starting a new Mateu app, adding a framework-agnostic @UI module, or fixing "my @UI class compiles but no controller is generated / the route 404s / nothing renders". Triggers on new Mateu project, pom.xml, annotationProcessorPaths, annotation-processor-indexer, annotation-processor-mvc, mvc-core, vaadin-lit.
---

# Scaffolding a Mateu project

The code (`@UI` classes) is the easy part — the fiddly part is the **build wiring**.
Mateu generates its controllers at **compile time** via annotation processors, so the
`pom.xml` must be set up exactly right or you get a clean compile that produces **no
UI at all**.

## Pick the layout

| Situation | Layout | Poms |
|---|---|---|
| One app, `@UI` classes live in the app itself | **single-module app** | [app-pom.md](reference/app-pom.md) |
| `@UI` classes in a reusable, framework-agnostic module consumed by one or more apps | **UI module + app** | [ui-module-pom.md](reference/ui-module-pom.md) + [app-pom.md](reference/app-pom.md) |

Choose the UI-module layout when the screens should be publishable/shareable with no
Spring (or Quarkus/…) dependency, or when several apps/services reuse them (see the
`mateu-federation` skill).

## The golden rule (why builds silently render nothing)

Annotation processors only see the **sources of the module being compiled**. So:

1. A **framework-agnostic `@UI` module** must run the **indexer** AP
   (`io.mateu:annotation-processor-indexer`) — it writes `META-INF/mateu/ui-registrations`
   into the jar so downstream apps can discover its screens without the sources.
2. The **app module** must put, on `annotationProcessorPaths`, **both** the framework AP
   (`io.mateu:annotation-processor-mvc`) **and** every `@UI` module it consumes — the
   framework AP reads each module's index off the classpath and generates the controllers
   *in the app*.

> If a `@UI` module is a regular `<dependency>` of the app but **not** also listed under
> `<annotationProcessorPaths>`, its screens are never generated. This is the #1 mistake.

## Runtime + renderer dependencies (app module)

The app needs the runtime (`io.mateu:mvc-core`) and one renderer jar so the UI is served:

```xml
<dependency><groupId>io.mateu</groupId><artifactId>mvc-core</artifactId><version>${mateu.version}</version></dependency>
<dependency><groupId>io.mateu</groupId><artifactId>vaadin-lit</artifactId><version>${mateu.version}</version></dependency>
```

- `mvc-core` = the Spring MVC runtime (the `/mateu/v3/sync` endpoint, `SpaRedirectFilter`).
- `vaadin-lit` = the default renderer, served as static resources by Spring Boot (swap for
  `sapui5-lit`, `redhat-lit`, `redwood-lit`, `slds-lit`). See the `run` step below and the
  standalone/CDN options in `doc/.../mateu-about/standalone-desktop.md`.

Other stacks replace the `mvc` pair: `webflux`, `quarkus`, `micronaut`, `helidon-mp`
(each has its own `*-core` + `annotation-processor-*`).

## Main class

```java
@SpringBootApplication(scanBasePackages = {"io.mateu", "com.yourco.yourapp"})
public class Application {
  public static void main(String[] args) { SpringApplication.run(Application.class, args); }
}
```

`scanBasePackages` **must include `io.mateu`** so the framework's beans/controllers are
picked up, plus your own package(s).

## Versions

Use a `mateu.version` property. When building against a local `mvn install` of this repo
it is `0.0.1-MATEU`; for a published build use the latest release from GitHub
releases / Maven Central. Lombok and `jakarta.validation-api` are the only extra
compile-time helpers the samples use. Java 17+ (samples use 21).

## After scaffolding — verify it actually generated

Don't trust a green build. Confirm the controllers exist and the route responds:
[verify.md](reference/verify.md).

## Related skills

- Build, run and screenshot the result → **mateu-run**.
- Compose several modules/services into one UI → **mateu-federation**.
- Write the actual `@UI` screens → **mateu**.

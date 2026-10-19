---
name: mateu-scaffold
description: Scaffold a new Mateu project or module and wire the Java build correctly — the project generator front doors, the two-step annotation processing (indexer + framework AP), the renderer dependency and the main class. Use when starting a new Mateu app, adding a framework-agnostic @UI module, or fixing "my @UI class compiles but no controller is generated / the route 404s / nothing renders". Triggers on new Mateu project, pom.xml, annotationProcessorPaths, mateu-annotation-processor-indexer, mateu-annotation-processor-mvc, mateu-mvc, mateu-vaadin, mateu-archetype.
---

# Scaffolding a Mateu project

The code (`@UI` classes) is the easy part — the fiddly part is the **build wiring**. Mateu
generates its controllers at **compile time** via annotation processors, so the `pom.xml` must
be set up exactly right or you get a clean compile that produces **no UI at all**.

## Fastest: generate it (don't hand-write a pom)

All three front doors generate from the same verified starters (an app shell + home page + a
Product CRUD, plus `AGENTS.md`/`CLAUDE.md` for AI assistants):

- **IntelliJ**: File › New › Project… › Mateu (Mateu plugin). **VS Code**: "Mateu: New Project…".
- **Maven** (needs JDK 21–25 to run the archetype's Groovy script):
  ```bash
  mvn archetype:generate -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype \
      -DarchetypeVersion=<release> -DgroupId=com.acme -DartifactId=my-app \
      -Dauthoring=code -Drenderer=vaadin -Dsample=crud     # authoring: code|yaml|static; sample: crud|empty
  ```
- **Copy a starter**: https://github.com/miguelperezcolom/mateu/tree/master/starters —
  `spring-mvc`, `spring-webflux`, `quarkus`, `micronaut`, `helidon-mp` (Java), `dotnet`, `python`,
  `yaml` (UI as data, Spring Boot, no UI code), `static` (UI as data, no backend). Each builds on
  its own; CI compiles and boots every one.

YAML-only / static projects need no annotation processor → **mateu-yaml** skill. C# / Python →
**mateu-dotnet** / **mateu-python**.

## Pick the layout (Java)

| Situation | Layout | Poms |
|---|---|---|
| One app, `@UI` classes live in the app itself | **single-module app** | [app-pom.md](reference/app-pom.md) |
| `@UI` classes in a reusable, framework-agnostic module consumed by one or more apps | **UI module + app** | [ui-module-pom.md](reference/ui-module-pom.md) + [app-pom.md](reference/app-pom.md) |

Choose the UI-module layout when the screens should be shareable with no Spring (or
Quarkus/…) dependency, or when several apps reuse them (see **mateu-federation**).

## The golden rule (why builds silently render nothing)

Annotation processors only see the **sources of the module being compiled**. So:

1. A **framework-agnostic `@UI` module** runs the **indexer** AP
   (`io.mateu:mateu-annotation-processor-indexer`) — it writes `META-INF/mateu/ui-registrations`
   into the jar so downstream apps can discover its screens without the sources.
2. The **app module** puts, on `annotationProcessorPaths`, **both** the framework AP
   (`io.mateu:mateu-annotation-processor-mvc`, …) **and** every `@UI` module it consumes — the
   framework AP reads each module's index off the processor path and generates the controllers
   *in the app*.

> If a `@UI` module is a regular `<dependency>` of the app but **not** also listed under
> `<annotationProcessorPaths>`, its screens are never generated. This is the #1 mistake. Once
> `annotationProcessorPaths` is set, nothing else on the classpath runs as a processor — list
> Lombok there too.

## Runtime + renderer dependencies (app module)

| Runtime | Runtime jar | Framework AP | Extra the starter keeps |
|---|---|---|---|
| Spring Boot MVC | `mateu-mvc` | `mateu-annotation-processor-mvc` | `spring-boot-starter-webmvc` |
| Spring Boot WebFlux | `mateu-webflux` | `mateu-annotation-processor-webflux` | `spring-boot-starter-webflux` |
| Quarkus | `mateu-quarkus` | `mateu-annotation-processor-quarkus` | `quarkus-rest-jackson` (Jackson wire) |
| Micronaut | `mateu-micronaut` | `mateu-annotation-processor-micronaut` | static-resources mapping `classpath:static` in `application.properties` |
| Helidon MP | `mateu-helidon-mp` | `mateu-annotation-processor-helidon-mp` | `META-INF/beans.xml` + `jersey-media-json-jackson` |

Plus ONE renderer jar, served as static assets: `io.mateu:mateu-vaadin` (default) or
`io.mateu:mateu-redwood` (Oracle Redwood / Visual Builder). All `io.mateu` artifacts share one
version; `io.mateu:mateu-bom` can import them.

## Main class (Spring Boot)

```java
@SpringBootApplication
public class Application {
  public static void main(String[] args) { SpringApplication.run(Application.class, args); }
}
```

Do **not** add `io.mateu` to `scanBasePackages`: the framework's beans come with the adapter jar
(its `MateuAutoConfiguration`). Keep your `@UI` classes inside the package `Application` scans —
the generated controllers live next to them. A third-party UI jar is mounted by naming its
package: `mateu.ui.modules=com.vendor.ui`.

## Versions

Declare a `mateu.version` property and reference it as `${mateu.version}` — never a literal per
dependency. Default it to the **latest release on Maven Central**
(`https://repo1.maven.org/maven2/io/mateu/mateu-bom/maven-metadata.xml`, `<release>`); use
`0.0.1-MATEU` only to build against a local `mvn install` of the Mateu repo. Java 21+.

## After scaffolding — verify it actually generated

Don't trust a green build. Confirm the controllers exist and the route responds:
[verify.md](reference/verify.md).

## Related skills

- Build, run and screenshot the result → **mateu-run**.
- Compose several modules/services into one UI → **mateu-federation**.
- Write the actual `@UI` screens → **mateu** (or **mateu-screen** to pick the archetype).

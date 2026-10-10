---
title: "Prerequisites"
---

Before adding Mateu to your project, verify the following requirements.

## Java

**Java 21 or later.** Mateu relies on records, sealed interfaces, and pattern matching — Java 21 is the minimum supported version.

Verify with:

```bash
java -version
```

## Build tool

**Maven 3.9+** or **Gradle 8+**.

Mateu's annotation processor generates source files at compile time. Both Maven and Gradle support this out of the box, but you must configure the processor explicitly (see each framework setup page for the exact configuration).

## Framework

Pick one of the supported frameworks:

| Framework | Version |
|---|---|
| Spring Boot MVC | 4.x |
| Spring Boot WebFlux | 4.x |
| Quarkus | 3.x |
| Micronaut | 4.x |
| Helidon MP | 4.x |

**Spring Boot 3 is not supported.** The Spring adapters are built and tested against Spring
Boot 4 (Spring Framework 7) only; nothing builds or tests on Boot 3, and Boot 4 moved packages
the adapters depend on. Upgrade the application to Boot 4 (Java 21) to use Mateu.

## Next

Pick your framework and follow its setup guide:

- [Spring Boot MVC](/java-create-your-project/springboot-mvc/)
- [Spring Boot WebFlux](/java-create-your-project/springboot-webflux/)
- [Quarkus](/java-create-your-project/quarkus/)
- [Micronaut](/java-create-your-project/micronaut/)
- [Helidon MP](/java-create-your-project/helidon/)

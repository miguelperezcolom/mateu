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

**Spring Boot 3 is not supported, by decision.** The whole 3.x line is out of open-source support:
its last generation, 3.5 (with Spring Framework 6.2 and Spring Security 6.5), reached its end of
OSS support on 30 June 2026, and 3.5.16 was its last OSS release — the Spring team recommends
moving to 4.0.x or 4.1.x ([Spring Boot 3.5.16 available now](https://spring.io/blog/2026/06/25/spring-boot-3-5-16-available-now/)).
An application on Boot 3 no longer receives free security fixes from Spring, so Mateu 3.0 does
not carry a second set of adapters and a CI matrix for it: the Spring adapters are built and
tested against Spring Boot 4 (Spring Framework 7) only, and Boot 4 moved packages they depend
on. Upgrade the application to Boot 4 (Java 21) to use Mateu.

## Next

Pick your framework and follow its setup guide:

- [Spring Boot MVC](/java-create-your-project/springboot-mvc/)
- [Spring Boot WebFlux](/java-create-your-project/springboot-webflux/)
- [Quarkus](/java-create-your-project/quarkus/)
- [Micronaut](/java-create-your-project/micronaut/)
- [Helidon MP](/java-create-your-project/helidon/)

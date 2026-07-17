---
title: "Create your project"
description: "Set up a new Mateu project with your Java backend framework of choice."
---

Add Mateu to an existing Java project or start a new one. The setup is a Maven dependency plus an annotation processor — no separate frontend project.

## Choose your framework

| Framework | Module |
|---|---|
| [Spring Boot MVC](/java-create-your-project/springboot-mvc/) | `mvc-core` |
| [Spring Boot WebFlux](/java-create-your-project/springboot-webflux/) | `webflux-core` |
| [Quarkus](/java-create-your-project/quarkus/) | `quarkus-core` |
| [Micronaut](/java-create-your-project/micronaut/) | `micronaut-core` |
| [Helidon MP](/java-create-your-project/helidon/) | `helidon-mp-core` |

## Common setup pattern

All integrations follow the same three steps:

1. Add the framework-specific Mateu core dependency
2. Add the annotation processor for your build tool
3. Add a renderer dependency (choose your design system)

The annotation processor generates the framework-specific controllers and routes from your `@UI` classes at compile time. You do not write controllers by hand.

## Choose a renderer

All integrations support the same set of frontends — change renderer by swapping one dependency:

| Artifact | Design system |
|---|---|
| `vaadin-lit` | Vaadin (default, recommended) |
| `redhat-lit` | Red Hat Patternfly |
| `sapui5-lit` | SAP Fiori / UI5 |
| `redwood-oj-lit` | Oracle Redwood |

## Before you start

See [Prerequisites](/java-create-your-project/prerequisites/) for Java version and build tool requirements.

## Next

- [Spring Boot MVC setup](/java-create-your-project/springboot-mvc/)
- [Quickstart](/java-user-manual/start-here/quickstart/)

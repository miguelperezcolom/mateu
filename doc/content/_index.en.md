---
title: "Mateu"
description: "Build business UIs in Java with one model: fast CRUDs, distributed backoffices, and embeddable modules."
---

# Build business UIs in Java

Mateu is a model-driven UI framework for business applications.

Define your UI once in Java.  
Mateu generates forms, CRUD, navigation and application shells from that model.

[Start with the quickstart →](/java-user-manual/start-here/quickstart/)

---

## Why Mateu

Traditional business apps often mean:

- backend logic
- frontend app
- API layer
- duplicated models
- duplicated validation
- duplicated routing
- more glue code than expected

Mateu takes a different approach:

- one application model
- one source of truth
- less duplication
- fewer moving parts

For the full positioning, see [Why Mateu →](/mateu-about/advantages) and [Mateu vs traditional stack →](/mateu-about/comparison).

---

> **Stateless by design**  
> Mateu does not keep UI state on the server. Each request instantiates the viewmodel, hydrates it, executes the action, and returns the result.  
>  
> This means:
> - no server-side UI sessions
> - no sticky sessions
> - no per-user memory footprint
>  
> Unlike stateful frameworks such as Vaadin, Mateu keeps your backend truly stateless, which makes it a strong fit for microservices, ephemeral pods, and horizontal scaling.

---

## Works with your stack

Mateu does not require a specific backend framework.

If you are using Java, you can integrate Mateu with:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- or any HTTP-based backend

Mateu sits on top of your existing application.

There is no need to:

- rewrite your backend
- change your architecture
- adopt a new runtime

This makes adoption gradual and low-risk.

---

## Bring your own frontend

Mateu separates UI definition from rendering.

Your UI is defined in Java, but it is rendered by a frontend.

This means you are free to use:

- different design systems
- different frontend implementations
- different rendering strategies

Mateu already provides a default renderer, but you are not tied to it.

You can evolve or replace the frontend without changing your backend model.

---

## When to use Mateu

Mateu is designed for business applications.

- best for → admin panels, internal tools, distributed backoffices
- not ideal for → marketing sites or highly custom UIs

👉 [Read when to use Mateu →](/when-to-use-mateu/)

---

## The core idea

In Mateu, you define:

- state with fields
- actions with methods or callables
- rendering and behavior with annotations
- routing and navigation in the same model

Mateu turns that into a working UI.

To understand the mental shift, see:

- [How to think in Mateu →](/mateu-about/how-to-think-in-mateu)
- [The Mateu model →](/mateu-about/mental-model)
- [The basics →](/mateu-about/the-basics)

---

## Three strong use cases

### 1. Admin panels

Build CRUD-heavy backoffice screens directly from your Java model.

This is the fastest way to understand the value of Mateu.

![Admin panel list](/images/docs/admin-panel/products-list.jpeg)

- [Quickstart →](/java-user-manual/start-here/quickstart/)
- [Admin panel use case →](/java-user-manual/use-cases/admin-panel/)

### 2. Distributed backoffices

Let each microservice define its own UI and compose everything in one shell.

This is one of Mateu's most distinctive strengths.

![Distributed backoffice](/images/docs/distributed/distributed-home.jpeg)

- [Distributed backoffice →](/java-user-manual/use-cases/distributed-backoffice/)
- [UI federation →](/mateu-about/ui-federation)
- [Shell and remote menus →](/mateu-about/shell-and-remote-menus)

### 3. Embedded UI

Use Mateu inside React, Vue, Angular or even plain HTML through a web component.

This makes adoption gradual and low-risk.

![Embedded UI](/images/docs/embedded/embedded-counter.png)

- [Embedded UI →](/java-user-manual/use-cases/embedded-ui/)
- [Embed →](/mateu-about/embed)

---

## Architecture

Mateu is intentionally simple at a high level:

1. backend code defines the UI
2. Mateu exposes that through a small API
3. a renderer turns it into a real browser UI

That separation makes Mateu a strong fit for:

- microservices
- stateless systems
- distributed UIs
- pluggable renderers

Read more here:

- [Architecture →](/mateu-about/architecture)
- [Architecture diagram →](/mateu-about/diagram)
- [API →](/mateu-about/api)

---

## Recommended path

If you're new to Mateu, follow this order:

1. [Quickstart](/java-user-manual/start-here/quickstart/)
2. [Admin panel](/java-user-manual/use-cases/admin-panel/)
3. [Distributed backoffice](/java-user-manual/use-cases/distributed-backoffice/) or [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
4. [Java manual](/java-user-manual/)

---

## Java manual

The Java manual is already organized as a guided path:

- [Start here](/java-user-manual/start-here/)
- [Use cases](/java-user-manual/use-cases/)
- [Concepts](/java-user-manual/concepts/)
- [Build](/java-user-manual/build/)
- [Advanced](/java-user-manual/advanced/)

---

## One-sentence summary

Mateu turns backend objects into real business UIs through a simple model, a small API and a renderer.

[Open the Java manual →](/java-user-manual/)

---

## Community

Mateu is evolving. Join the community:

👉 **[Join our Discord](https://discord.gg/2E34heWF)**

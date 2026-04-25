---
title: "Mateu"
description: "Build distributed business UIs in Java with one model: fast CRUDs, distributed backoffices, and embeddable modules."
---

# Build backoffice UIs without building a frontend

Mateu is a **model-driven UI framework** for Java teams building real business applications.

Define your UI once in Java.  
Mateu generates forms, CRUD, navigation and application shells from that model.

[Start with the quickstart →](/java-user-manual/start-here/quickstart/)

---

## What makes Mateu different

Traditional business apps often mean:

- backend logic
- frontend app
- API layer
- duplicated models
- duplicated validation
- duplicated routing
- more glue code than expected

Mateu takes a different approach:

> Backend owns the UI.  
> The UI is generated from the model.

For the full positioning, see [Why Mateu →](/mateu-about/advantages) and [Mateu vs traditional stack →](/mateu-about/comparison).

---

## Built for real architectures

Mateu is designed for systems like:

```text
[ UI ] → [ Mateu API ] → [ Microservices ]
                          ├── Content Service
                          ├── Orders Service
                          ├── Workflow Engine
                          └── External APIs
```

- stateless by design
- no server-side UI sessions
- no sticky sessions
- DTO-based UI
- works with REST, gRPC, databases, services and APIs

---

## Works with your stack

Mateu does not require a specific backend framework.

If you are using Java, you can integrate Mateu with:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- or any HTTP-based backend

There is no need to rewrite your backend, change your architecture or adopt a new runtime.

---

## Bring your own frontend

Mateu separates UI definition from rendering.

Your UI is defined in Java, but rendered by a frontend.

This means you can use:

- different design systems
- different frontend implementations
- different rendering strategies

Mateu defines **what** the UI is, not **how** it must look.

---

## Mental model

In Mateu:

```text
State → Actions → Routes → UI
```

- **State** → fields in your model
- **Actions** → methods, buttons or callables
- **Routes** → navigation and URL structure
- **UI** → generated and rendered automatically

---

## Three strong use cases

### 1. Admin panels

Build CRUD-heavy backoffice screens directly from your Java model.

This is the fastest way to understand the value of Mateu.

![Admin panel list](/images/docs/admin-panel/products-list.jpeg)

- [Quickstart →](/java-user-manual/start-here/quickstart/)
- [Admin panel use case →](/java-user-manual/use-cases/admin-panel/)

---

### 2. Distributed backoffices

Let each microservice define its own UI and compose everything in one shell.

This is one of Mateu's most distinctive strengths.

![Distributed backoffice](/images/docs/distributed/distributed-home.jpeg)

- [Distributed backoffice →](/java-user-manual/use-cases/distributed-backoffice/)
- [UI federation →](/mateu-about/ui-federation)
- [Shell and remote menus →](/mateu-about/shell-and-remote-menus)

---

### 3. Embedded UI

Use Mateu inside React, Vue, Angular or even plain HTML through a web component.

This makes adoption gradual and low-risk.

![Embedded UI](/images/docs/embedded/embedded-counter.png)

- [Embedded UI →](/java-user-manual/use-cases/embedded-ui/)
- [Embed →](/mateu-about/embed)

---

## Real-world usage

Mateu can act as a UI orchestration layer for distributed systems:

- each service owns its UI
- DTOs become UI rows
- row actions trigger backend use cases
- workflows and forms can be launched from the UI
- everything remains stateless

👉 [Read the distributed control plane case study →](/java-user-manual/real-world/distributed-control-plane/)

---

## Comparison

| Approach | Characteristics |
|---|---|
| React / SPA | frontend-heavy, duplicated models |
| Vaadin | server-side UI session, stateful |
| CRUD generators | fast start, limited flexibility |
| Mateu | stateless, backend-driven, distributed UI |

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

The Java manual is organized as a guided path:

- [Start here](/java-user-manual/start-here/)
- [Use cases](/java-user-manual/use-cases/)
- [Concepts](/java-user-manual/concepts/)
- [Build](/java-user-manual/build/)
- [Advanced](/java-user-manual/advanced/)

---

## One-sentence summary

Mateu turns backend models into **real distributed business UIs**, without requiring a frontend stack.

[Open the Java manual →](/java-user-manual/)

---

## Community

Mateu is evolving. Join the community:

👉 **[Join our Discord](https://discord.gg/2E34heWF)**

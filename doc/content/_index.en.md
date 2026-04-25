---
title: "Mateu"
description: "Build backoffice UIs without building a frontend. Backend-driven UI for distributed systems."
---

# Build backoffice UIs without building a frontend

Mateu is a **backend-driven UI layer for distributed systems**.

Define your business UI once in Java.  
Mateu generates forms, CRUD, navigation and application shells from that model.

```java
@UI("/orders")
public class Orders extends AutoCrudOrchestrator<Order> {}
```

- no frontend app to build
- no duplicated models
- stateless by design
- works with your existing Java backend

[Start with the quickstart →](/java-user-manual/start-here/quickstart/)

---

## The problem

Most business applications end up with two applications:

```text
backend → API → frontend → duplicated model → duplicated validation
```

That usually means:

- duplicated business concepts
- duplicated validation
- more glue code
- more moving parts
- harder maintenance

---

## The Mateu approach

```text
backend → Mateu UI → browser
```

> The backend owns the UI.

Mateu lets your backend expose real business UIs directly, without turning every internal tool into a separate frontend project.

[What is Mateu? →](/mateu-about/what-is-mateu/)

---

## Built for real architectures

Mateu fits naturally in systems built with:

- microservices
- DDD
- CQRS
- hexagonal architecture
- workflow-driven applications

```text
User → Mateu UI → Application use cases → Domain
```

Mateu is stateless:

- no server-side UI sessions
- no sticky sessions
- no per-user UI memory
- horizontally scalable

---

## Works with your stack

Mateu does not force a specific backend framework.

You can use it with:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- any HTTP-based Java backend

You keep your architecture. Mateu becomes one more inbound adapter.

---

## Bring your own frontend

Mateu separates **UI definition** from **UI rendering**.

Your UI is defined in Java, but rendered by a frontend.

That means you can use:

- different design systems
- different frontend implementations
- different rendering strategies

Mateu defines **what** the UI is, not **how** it must look.

---

## Mental model

```text
State → Actions → Routes → UI
```

- **State** → fields
- **Actions** → methods, buttons, callables
- **Routes** → navigation
- **UI** → generated and rendered automatically

---

## What you can build

### Admin panels

Fast CRUD-heavy backoffice screens directly from your Java model.

![Admin panel](/images/docs/admin-panel/products-list.jpeg)

- [Admin panel use case →](/java-user-manual/use-cases/admin-panel/)
- [Quickstart →](/java-user-manual/start-here/quickstart/)

---

### Distributed backoffices

Let each microservice define its own UI and compose everything in one shell.

![Distributed backoffice](/images/docs/distributed/distributed-home.jpeg)

- [Distributed backoffice →](/java-user-manual/use-cases/distributed-backoffice/)
- [Distributed control plane case study →](/java-user-manual/real-world/distributed-control-plane/)

---

### Embedded UI

Use Mateu inside React, Vue, Angular or plain HTML through a web component.

![Embedded UI](/images/docs/embedded/embedded-counter.png)

- [Embedded UI →](/java-user-manual/use-cases/embedded-ui/)
- [Embed →](/mateu-about/embed/)

---

## Real-world architecture

Mateu treats UI as an inbound adapter:

```text
Infrastructure / in
  ├─ api
  ├─ async consumers
  └─ ui  ← Mateu
```

This makes Mateu a natural fit for backend teams building business systems.

- [Mateu in hexagonal architecture →](/java-user-manual/real-world/mateu-in-hexagonal-architecture/)
- [System architecture →](/mateu-about/system-architecture/)

---

## Comparison

| Approach | Typical trade-off |
|---|---|
| React / SPA | frontend-heavy, duplicated models |
| Vaadin | stateful server-side UI session |
| CRUD generators | fast start, limited flexibility |
| **Mateu** | stateless, backend-driven, distributed UI |

---

## Recommended path

1. [Quickstart](/java-user-manual/start-here/quickstart/)
2. [Admin panel](/java-user-manual/use-cases/admin-panel/)
3. [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/)
4. [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/)
5. [Real-world architecture](/java-user-manual/real-world/)

---

## One-sentence summary

Mateu turns backend models into **real distributed business UIs**, without requiring a frontend stack.

[Open the Java manual →](/java-user-manual/)

---

## Community

Mateu is evolving. Join the community:

👉 **[Join our Discord](https://discord.gg/2E34heWF)**

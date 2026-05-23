---
title: "Why Mateu"
description: "Why teams adopt Mateu."
---

Most business applications end up with two separate codebases: a backend with the real business logic, and a frontend that duplicates models, validation, and state. Mateu removes that duplication.

## The core trade-off

With a traditional stack:

```text
backend model
  ↓ API
frontend model
  ↓ validation
  ↓ state management
  ↓ UI components
```

Every concept lives twice. A change to the domain model requires coordinated changes on both sides.

With Mateu:

```text
backend model
  ↓ Mateu
  ↓ UI
```

The backend owns the UI. There is no separate frontend application to maintain.

## What this means in practice

**Less code.** A CRUD UI for a domain model is a few lines:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {}
```

**Validation in one place.** Standard Bean Validation annotations on your model enforce constraints in the UI automatically. No frontend validation to write or keep in sync.

**Stateless by design.** Every request instantiates, hydrates, and discards the ViewModel. This means no sticky sessions, no session replication, and no stale state — just horizontal scalability.

**Architecture-friendly.** Mateu is an inbound adapter. It calls your use cases, repositories, and services directly. You do not need to build a REST API just to feed your own UI.

## Who adopts Mateu

Teams building internal tools, admin panels, and distributed backoffices — where the UI is a projection of the backend model, not the product itself.

If your team is spending as much time on the frontend as on the domain logic for a tool that is ultimately CRUD-heavy, Mateu addresses that imbalance.

## What Mateu is not

Mateu is not for marketing websites, highly animated UIs, or products where the UI is the primary value. For those, a traditional frontend framework is the right tool.

## Next

- [What is Mateu?](/mateu-about/what-is-mateu/)
- [Quickstart](/java-user-manual/start-here/quickstart/)
- [Admin panel use case](/java-user-manual/use-cases/admin-panel/)

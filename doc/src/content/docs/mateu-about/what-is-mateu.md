---
title: "What is Mateu?"
description: "Mateu is a backend-driven UI layer for business applications and distributed systems."
---

Mateu is a **backend-driven UI layer** that lets Java teams build real browser UIs directly from backend code, without a separate frontend application.

## The shortest possible example

This is enough to get a working CRUD screen in the browser:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {}
```

That single class produces:

- a searchable list view at `/products`
- a read-only detail view at `/products/:id`
- an edit form at `/products/:id/edit`
- a creation form at `/products/new`
- validation, navigation, and browser interaction

No React. No TypeScript. No REST controller for each screen.

## The core idea

Most business applications define the same concepts twice:

```text
backend model
  -> API contract
  -> frontend model
  -> frontend validation
  -> UI state
```

Mateu removes most of that duplication:

```text
backend model
  -> Mateu UI definition
  -> browser
```

The backend defines what the UI is. The renderer decides how it looks.

## What Mateu is not

Mateu is not:

- a frontend framework or a React alternative
- a stateful server-side rendering framework (like JSF or Wicket)
- a low-code platform detached from your codebase
- a code generator you run once and abandon

Mateu is closer to an **inbound adapter** for your backend — the same way a REST controller exposes your application logic over HTTP, Mateu exposes it as a browser UI.

## The model

A Mateu UI is defined by plain Java:

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

From this model, Mateu can infer fields, forms, list columns, validation, and navigation. You create explicit view models only when the defaults are not enough.

## Two levels of control

**AutoCrud** — use this when the model is straightforward:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {}
```

**CrudOrchestrator** — use this when you need explicit control over filters, rows, view forms, edit forms, and creation forms:

```java
public class ProductsCrudOrchestrator extends CrudOrchestrator<
    ProductView,
    ProductEditor,
    ProductCreationForm,
    ProductFilters,
    ProductRow,
    String> { ... }
```

## Stateless by design

Mateu does not keep UI state on the server. Each request instantiates the view model, hydrates it, executes the action, and returns the result. This makes Mateu a natural fit for Kubernetes, ephemeral pods, and systems with no sticky sessions.

## Frontend-agnostic

Mateu separates UI definition from rendering. The backend produces a UI description. A renderer — the reference implementation uses web components — turns it into a working browser interface. You can swap the renderer or target different design systems without changing the UI definition.

## Backend-agnostic

Mateu can be integrated with:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- Other HTTP-based Java runtimes

## When to reach for Mateu

Mateu is especially useful for:

- admin panels and backoffice tools
- internal tools and control planes
- enterprise workflow UIs
- distributed systems where each service owns its own UI
- any application where building and maintaining a separate SPA is more cost than it is worth

## Next

- [Philosophy](/mateu-about/philosophy) — the accidental complexity problem Mateu solves
- [The Mateu mental model](/mateu-about/mental-model) — how the system thinks about UI definitions
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes)

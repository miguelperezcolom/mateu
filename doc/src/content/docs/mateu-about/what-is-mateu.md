---
title: "What is Mateu?"
description: "Mateu is a backend-driven UI layer for business applications and distributed systems."
---

Mateu is a **backend-driven UI layer** that lets Java teams build real browser UIs directly from backend code, without a separate frontend application.

## The shortest possible example

This is enough to get a working CRUD screen in the browser:

```java
@UI("/products")
public class Products extends AutoCrud<Product> {}
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
- a code generator you run once and abandon

There is a visual editor and screens can be authored as YAML, so the comparison with a low-code
platform comes up — the difference is that a Mateu UI is **files in your repository**, going through
your pull requests, your build and your release, never a project in someone's cloud. See
[Mateu vs visual builders](/mateu-about/comparison-low-code/).

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

### Java is one way to say it

The Java class is an authoring surface, not the model itself. The same screen can be authored as
data — a [YAML page definition](/java-ui-definition/yaml-ui-definition/), a
[route registry](/java-ui-definition/route-registry/) and an
[app shell](/java-ui-definition/yaml-app-shell/) — and a mount authored entirely that way needs no
Mateu Java at all. Both halves meet in the same component model, share the same published schema,
and can be mixed on the same screen: layout from YAML, behaviour from Java.

See [The model](/mateu-about/the-model/) for what is being authored, what consumes it, and the rules
that keep the two halves from drifting.

## Two levels of control

**AutoCrud** — use this when the model is straightforward:

```java
@UI("/products")
public class Products extends AutoCrud<Product> {}
```

**Crud** — use this when you need explicit control over filters, rows, view forms, edit forms, and creation forms:

```java
public class ProductsCrud extends Crud<
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

- [The Mateu Way](/the-mateu-way) — the golden path: six families, one starting class each
- [The model](/mateu-about/the-model) — one model, several ways to author it, several things that consume it
- [Why Mateu](/mateu-about/why-mateu) — the problem it solves and what you gain
- [How Mateu works](/mateu-about/how-mateu-works) — mental model, building blocks, and the stateless cycle
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes)

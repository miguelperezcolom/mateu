---
title: "What is Mateu?"
description: "Mateu is a backend-driven UI layer for business applications and distributed systems."
weight: 1
---

# What is Mateu?

Mateu is a **backend-driven UI layer for business applications**.

It lets Java teams build real backoffice and internal UIs directly from backend models, without creating a separate frontend application.

---

## The short version

Mateu lets you write this:

```java
@UI("/orders")
public class Orders extends AutoCrudOrchestrator<Order> {}
```

and get a real browser UI:

- list
- view
- edit
- create
- validation
- navigation

without building a separate SPA.

---

## The core idea

Most internal business applications duplicate the same concepts several times:

```text
backend model
  ↓
API contract
  ↓
frontend model
  ↓
frontend validation
  ↓
UI state
```

Mateu removes much of that duplication.

With Mateu:

```text
backend model
  ↓
Mateu UI
  ↓
browser
```

The backend defines the UI.

The frontend renders it.

---

## What Mateu is not

Mateu is not:

- a frontend framework
- a React replacement
- a stateful server-side UI framework
- a simple CRUD generator
- a low-code platform detached from your backend

Mateu is closer to:

> a UI adapter for your backend architecture.

---

## UI as an inbound adapter

In hexagonal architecture, inbound adapters include:

- REST controllers
- gRPC endpoints
- event consumers
- scheduled jobs
- UI adapters

Mateu belongs here:

```text
Infrastructure / in
  ├─ api
  ├─ async
  └─ ui  ← Mateu
```

This means the UI can call:

- application use cases
- query services
- repositories through ports
- gateways through ports

without forcing you to build an API only for your own UI.

---

## Stateless by design

Mateu does not keep UI state on the server.

Each request:

1. instantiates the view model
2. hydrates it
3. executes the action
4. returns the result

This makes Mateu a strong fit for:

- Kubernetes
- ephemeral pods
- horizontal scaling
- microservices
- no sticky sessions

---

## Model-driven, not page-driven

In Mateu, you usually start with the model.

For example:

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

Then Mateu can infer:

- fields
- forms
- lists
- validation
- actions
- routes

You create explicit pages only when the model is not enough.

---

## CRUD when you want speed

For standard business data, use:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {}
```

This gives you a full CRUD flow:

- `/products`
- `/products/:id`
- `/products/:id/edit`
- `/products/new`

---

## Full control when you need it

When the generated CRUD is not enough, Mateu lets you take control.

You can use:

```java
CrudOrchestrator<
    View,
    Editor,
    CreationForm,
    Filters,
    Row,
    IdType
>
```

This lets you model:

- filters
- list rows
- readonly views
- edit forms
- creation forms

explicitly.

---

## Query-side friendly

Mateu works especially well with CQRS.

For listings, you can use query services and DTOs:

```text
Query service → DTO → Row → ListingData → UI
```

Rows are UI models.

They can include:

- formatted values
- status badges
- hidden ids
- contextual actions

---

## Actions as backend intents

Mateu actions are backend intents.

For example:

```java
new ColumnAction("compare", "Compare")
```

means:

```text
user click → action id → backend use case
```

The frontend does not own the business logic.

---

## Frontend-agnostic

Mateu separates UI definition from rendering.

The backend defines what the UI is.

A renderer decides how it looks.

This allows different:

- design systems
- frontend implementations
- rendering strategies

---

## Backend-agnostic

Mateu does not require one specific Java backend stack.

It can be integrated with:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- other HTTP-based Java runtimes

---

## Why it matters

Mateu is useful when you want to build:

- admin panels
- internal tools
- distributed backoffices
- workflow control planes
- service-owned UIs
- embedded business modules

without creating and maintaining a separate frontend application for each one.

---

## One sentence

Mateu is a **stateless, backend-driven UI layer** that turns Java backend models into real business UIs.

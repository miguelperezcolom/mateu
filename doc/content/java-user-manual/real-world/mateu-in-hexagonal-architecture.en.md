---
title: "Mateu in hexagonal architecture"
weight: 2
aliases:
  - /java-user-manual/real-world/hexagonal-architecture/
---

# Mateu in hexagonal architecture

Mateu fits naturally in systems designed with:

- DDD tactical patterns
- hexagonal architecture
- CQRS
- event-driven integration
- microservices by bounded context

The key idea is simple:

> The UI is just another inbound adapter.

It belongs next to APIs, event consumers and other inbound ports.

---

## System structure

A typical system can be organized like this:

```text
Application
  ├─ use cases
  ├─ ports / interfaces
  │   ├─ queries
  │   ├─ repositories
  │   └─ gateways

Domain
  ├─ aggregates
  ├─ entities
  ├─ value objects
  └─ domain services

Infrastructure
  ├─ in
  │   ├─ api
  │   ├─ async consumers
  │   └─ ui        ← Mateu
  └─ out
      ├─ persistence
      └─ gateways
```

Mateu lives in `in/ui`.

It adapts user interaction into application use cases and query calls.

---

## Why this matters

In many systems, teams build APIs only because the frontend needs them.

With Mateu, that is not always necessary.

If the UI is an inbound adapter, it can call:

- application use cases
- query services
- repositories through ports
- gateways through ports

directly from the backend.

> If the UI is just another inbound adapter, you do not need to build an API only for your UI.

This reduces duplicated contracts, duplicated models and unnecessary glue code.

---

## CQRS fit

Mateu works very well with CQRS.

### Write side

Use DDD and aggregates for commands:

```text
Button / ColumnAction
        ↓
Application use case
        ↓
Aggregate
        ↓
Repository
        ↓
Events
```

The domain protects invariants.

Business rules stay as close to the domain as possible:

- value object if possible
- aggregate if needed
- domain service only when the logic exceeds one aggregate

---

### Read side

Use queries and DTOs for listings and screens:

```text
Query service
        ↓
DTO / projection
        ↓
Row model
        ↓
ListingData
        ↓
Mateu UI
```

The read side does not need domain entities.

It can use:

- JDBC
- SQL projections
- denormalized read models
- external APIs
- gRPC clients

---

## UI rows are read models

A listing row is a UI read model.

For example:

```java
public record ChangeRow(
        @Hidden String id,
        String page,
        String country,
        String language,
        Status status,
        ColumnAction action
) implements Identifiable {}
```

This row is not a domain entity.

It is a representation optimized for the UI.

It can contain:

- formatted values
- status badges
- hidden ids
- row actions
- derived fields

---

## Actions call use cases

Actions should express intent.

```java
new ColumnAction("compare", "Compare")
```

The action id is a contract between the UI and the backend.

The backend decides what happens:

```text
compare
  ↓
ComparePagesUseCase
  ↓
domain / query / workflow
```

This keeps logic out of the frontend.

---

## Lookups use query services

Lookups are also part of the read side:

```java
@Lookup(search = LabelOptionsSupplier.class, label = LabelLabelSupplier.class)
String labelId;
```

The suppliers can call query services:

```text
LookupOptionsSupplier
        ↓
Query service
        ↓
DTOs
        ↓
Option
```

This keeps the UI decoupled from domain entities.

---

## Microservices

A good default is:

- one microservice per bounded context or subdomain
- not one microservice per technical component

Each microservice can own:

- its domain
- its database
- its use cases
- its read models
- its Mateu UI module

Mateu then allows these UI modules to be composed into a distributed backoffice.

---

## Database strategy

A common pattern is:

```text
Write side
  → DDD aggregates
  → repositories
  → JPA / ORM if useful

Read side
  → query services
  → JDBC / SQL / projections
  → DTOs / rows
```

For cross-service joins, use a read database fed by events from the different services.

---

## Events, outbox and inbox

For reliable event-driven systems:

- use an outbox to publish events atomically with state changes
- use an inbox to avoid processing the same event twice

This keeps integration reliable without coupling services tightly.

Mateu does not replace these patterns.

It fits on top of them as an inbound UI adapter.

---

## Stateless UI

Mateu does not keep UI state on the server.

Each request:

1. instantiates the view model
2. hydrates it
3. executes the action
4. returns the result

This fits naturally with:

- ephemeral pods
- horizontal scaling
- microservices
- no sticky sessions

---

## Value objects

A useful rule:

```text
Value Object
  → never null
  → always valid

Field
  → decides whether the value exists
```

This keeps domain correctness inside the domain model.

The UI can expose optional fields, but once a value object exists, it should be valid.

---

## Mental model

Mateu is not a layer outside the architecture.

It is part of the architecture:

```text
User
  ↓
Mateu UI adapter
  ↓
Application use cases / query services
  ↓
Domain / read model / gateways
```

This is why Mateu works especially well for business UIs.

It does not force you to create a separate frontend application.

It lets your backend architecture expose a UI directly.

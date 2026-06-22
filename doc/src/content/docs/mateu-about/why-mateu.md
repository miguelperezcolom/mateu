---
title: "Why Mateu"
description: "The problem Mateu solves and what you gain from it."
---

Most business applications accumulate complexity that has nothing to do with the domain. The problem starts the moment the team splits into a backend and a frontend.

## The accidental complexity problem

A typical internal tool starts simple. Then the standard approach splits it:

```text
domain model          (Java)
  -> application layer (Java)
  -> REST API          (Java, OpenAPI)
  -> API client        (TypeScript)
  -> frontend model    (TypeScript)
  -> frontend validation (TypeScript / Zod)
  -> UI state          (React / Redux / Zustand)
  -> routing           (React Router / Next.js)
  -> component library (MUI / Tailwind)
```

Every layer has to be built, kept in sync, and maintained. A change to a field in the domain model triggers a cascade through all of them.

For a consumer product, that split is often worth it. For an order management screen, a role editor, or an internal control plane — it rarely is.

## What Mateu changes

Mateu keeps the definition in one place:

```text
domain model          (Java)
  -> Mateu UI definition (Java annotations + methods)
  -> browser rendering
```

The backend defines what the UI is. The renderer decides how it looks. There is no separate frontend application to build, deploy, or maintain.

## Concrete benefits

### One model, not three

In a traditional stack, an `Order` entity typically lives in three places: the backend domain model, the API response DTO, and the frontend TypeScript model. A field added to the domain model has to be propagated to the DTO and then to the TypeScript type. Miss one step and the UI silently shows stale data.

With Mateu, the `Order` appears once. Adding a field to `OrderRow` adds it to the list. Adding it to `OrderEditor` adds it to the edit form. There is no propagation step.

### Fewer moving parts

A Mateu project has a Java backend, a Mateu integration dependency, and a renderer (loaded from CDN or bundled). A traditional equivalent adds a REST API layer, a frontend project with its own build tool, package manager, component library, and state management, plus a separate CI/CD pipeline and deployment target.

That operational difference compounds over time, especially where frontend expertise is limited or where the UI is not the primary product.

### Validation enforced once

Bean Validation annotations on ViewModel fields are enforced in the browser (for user experience) and on the backend (for correctness). You write the constraint once. It applies in both places. No Zod schema. No frontend validation library. No risk of the frontend and backend disagreeing about what is valid.

```java
@NotEmpty
String name;

@DecimalMin("0.01")
BigDecimal price;
```

### Stateless and horizontally scalable

Mateu does not store UI state between requests. No sticky sessions, no session replication, no server affinity in Kubernetes. The ViewModel is created per request and discarded after the response.

### Pluggable renderers

Mateu separates UI definition from rendering. The same ViewModel can be rendered by different design systems — Oracle JET (Redwood), Vaadin, SAP UI5, Red Hat PatternFly — without rewriting any Java code. The definition is stable; the visual layer is pluggable.

### Architecture-friendly

Mateu works alongside DDD and hexagonal architecture, CQRS with separate read and write models, microservices with federated UIs, and event-driven systems. The ViewModel calls the same use cases, query services, and ports that a REST controller would call. See [Mateu and system architecture](/mateu-about/system-architecture) for the full picture.

## Design principles

**The backend is the source of truth.** UI definitions live alongside the application code that powers them. There is no separate UI layer to keep in sync.

**Stateless interaction.** Mateu does not store UI state on the server between requests. This keeps the system horizontally scalable and compatible with modern deployment infrastructure.

**Adapters, not frameworks.** The UI is an inbound adapter — the same architectural concept as a REST controller. It calls the same application use cases, the same query services, the same ports.

**Rendering is pluggable.** The UI definition is a protocol. Different renderers can consume the same definition and produce different visual results. Switching design systems does not require rewriting the definition.

## Who it is for

Teams building internal tools, admin panels, distributed backoffices, and enterprise workflow applications — where the UI is a projection of the backend model, not the product itself.

If your team is spending as much time on the frontend as on the domain logic for a tool that is ultimately CRUD-heavy, Mateu addresses that imbalance.

## What Mateu is not

Mateu is not for marketing websites, highly animated UIs, or products where the UI is the primary value. For those, a traditional frontend framework is the right tool.

## Next

- [How Mateu works](/mateu-about/how-mateu-works) — the mental model and building blocks
- [Comparison with traditional stacks](/mateu-about/comparison) — side-by-side contrast
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes) — see it in practice

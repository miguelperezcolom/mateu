---
title: "Why Mateu"
---

Mateu reduces the cost of building and maintaining business UIs by keeping the definition in one place and removing the accidental complexity that comes from the frontend/backend split.

## One model, not three

In a traditional stack, an `Order` entity typically lives in three places:

1. the backend domain model
2. the API response DTO
3. the frontend TypeScript model

A field added to the domain model has to be propagated to the DTO and then to the TypeScript type. If any step is missed, the UI silently shows stale or incomplete data.

With Mateu, the `Order` appears once. Adding a field to `OrderRow` adds it to the list. Adding it to `OrderEditor` adds it to the edit form. There is no propagation step.

## Fewer moving parts

A Mateu project has:

- a Java backend
- a Mateu integration dependency
- a renderer (loaded from CDN or bundled)

A traditional equivalent might have:

- a Java backend
- a REST API layer
- a frontend project (build tool, package manager, component library, state management)
- a CI/CD pipeline for the frontend
- a deployment target for the frontend

The operational difference compounds over time, especially for teams where frontend expertise is limited or where the UI is not the primary product.

## Validation enforced once

Bean Validation annotations on ViewModel fields are enforced in the browser (for user experience) and on the backend (for correctness). You write the constraint once. It applies in both places.

```java
@NotEmpty
String name;

@DecimalMin("0.01")
BigDecimal price;
```

No Zod schema. No frontend validation library. No risk of the frontend and backend disagreeing about what is valid.

## Stateless and horizontally scalable

Mateu does not store UI state between requests. This means:

- no sticky sessions
- no session replication
- no server affinity in Kubernetes
- clean horizontal scaling

The ViewModel is created per request. The browser holds the current field values between interactions.

## Frontend flexibility

Mateu separates the UI definition from the rendering. The same ViewModel can be rendered by different design systems:

- Oracle JET (Redwood)
- Vaadin
- SAP UI5
- Red Hat PatternFly
- A custom renderer

Switching design systems does not require rewriting ViewModels. The definition is stable; the visual layer is pluggable.

## Fits serious backend architectures

Mateu is not a shortcut that forces you into a simplified architecture. It works alongside:

- DDD and hexagonal architecture
- CQRS with separate read and write models
- microservices with federated UIs
- event-driven systems
- workflow engines

The ViewModel calls the same use cases, query services, and ports that a REST controller would call.

## Delivery speed for the right use cases

For admin tools, backoffice applications, internal portals, and enterprise workflows, the frontend split adds weeks of work that does not benefit the end user. Mateu trades that overhead for a simpler, faster path:

- define the model
- add behavior
- deploy

## Next

- [Comparison with traditional stacks](/mateu-about/comparison) — side-by-side contrast
- [Mateu and system architecture](/mateu-about/system-architecture) — how Mateu fits in DDD and hexagonal designs
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes) — see the advantages in practice

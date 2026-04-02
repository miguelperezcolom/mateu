---
title: "Mateu in microservices"
weight: 8
---

# Mateu in microservices

Mateu fits naturally into microservice architectures, both in how it handles state and in how it composes UIs across services.

## Stateless interactions

Every Mateu interaction is stateless. The frontend sends enough context with each request for the backend to process it independently — no server-side session, no affinity to a specific pod.

This means you can run multiple instances behind a load balancer with no special configuration. The [live demo](https://vaadin.mateu.io/fluent/use-cases/rra) does exactly this: two pods, no session affinity, requests distributed freely between them.

## Per-service UI ownership

In a Mateu microservice architecture, each service owns:

- its domain logic
- its backend UI definition
- its menu tree

This aligns UI ownership with service ownership. The team that owns the `Orders` service also owns the `Orders` UI — no frontend team needed as an intermediary.

```java
// In the orders service
@Menu("Orders")
@Route("orders")
public class OrdersMenu {
    // ...
}
```

## Shell composition

A shell application composes the menus from all services into a single navigation structure using `RemoteMenu`. Users see one application; teams work independently.

See [UI federation →](../ui-federation) for the full pattern.

## Deployment

Because each service exposes its UI through the standard Mateu API, the frontend renderer (deployed as a static site) works with any Mateu backend. You can deploy new versions of individual services without redeploying the frontend.

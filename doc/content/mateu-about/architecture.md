---
title: "Architecture"
weight: 4
---

# Architecture

Mateu has three pieces.

```
Backend UI definition  →  Simple API  →  Frontend renderer
```

That's it. Each piece has a clear responsibility and a clear boundary.

---

## 1. Backend UI definition

You define your UI in backend code — classes, fields, annotations, actions, routing, navigation.

This is the source of truth for the entire application model. There is no equivalent definition anywhere else.

## 2. Simple API

Mateu exposes your UI definition through a small, generic protocol.

This is not a hand-built application-specific API. It is a single protocol that all Mateu backends share and all Mateu renderers understand.

You can explore the full spec here:  
[Mateu API on Swagger Editor](https://editor.swagger.io/?url=https://mateu.io/openapi/mateu.yaml)

## 3. Frontend renderer

A renderer consumes the API and produces a real UI in the browser.

Mateu currently supports several renderers, each using a different design system:

- [Vaadin](https://vaadin.mateu.io/fluent/use-cases/rra)
- [Red Hat Design System](https://redhat.mateu.io/fluent/use-cases/rra)
- [SAPUI5](https://sapui5.mateu.io/fluent/use-cases/rra)
- [Oracle Redwood](https://redwood.mateu.io/fluent/use-cases/rra)

Because the renderer is decoupled from the backend, you can swap it without touching your application code. All demos above run against the same backend.

---

## Stateless by design

Mateu's interaction model is stateless. Every request from the frontend carries enough context to be processed independently.

This makes Mateu a strong fit for:

- microservices and distributed systems
- horizontally scaled deployments
- Kubernetes and cloud-native infrastructure
- serverless-style architectures

The [live demo](https://vaadin.mateu.io/fluent/use-cases/rra) runs on two pods behind a load balancer — requests round-robin between them with no session affinity.

---

## Microfrontends without a frontend

Mateu supports UI federation natively. Each microservice can expose its own UI and menu tree. A shell application composes those modules into a unified application surface.

This gives you the ownership benefits of microfrontends without the complexity of building and coordinating multiple frontend applications.

See [UI federation →](../ui-federation)

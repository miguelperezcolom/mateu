---
title: "Why Mateu"
weight: 6
---

# Why Mateu

## Less code

Mateu eliminates the code that exists only to connect layers: view models, API controllers, frontend service calls, duplicated validation, route definitions.

What remains is business logic — the code that actually matters.

## One source of truth

In a traditional stack, the same concept is often represented in multiple places: a domain entity, a DTO, a frontend model, a form schema. They drift apart over time.

Mateu keeps the UI definition in the backend model. There is no equivalent to keep in sync.

## Backend developers own the full stack

With Mateu, a Java developer can build a complete, working UI without writing any frontend code.

This removes the coordination overhead between frontend and backend teams for applications that don't need custom UI work. Backend developers ship features end-to-end.

## Stateless and cloud-native

Mateu's interaction model is stateless, which means it fits naturally into:

- microservice architectures
- Kubernetes deployments
- horizontally scaled systems
- serverless environments

No session affinity. No shared state between pods.

## Frontend flexibility

The renderer is decoupled from the application model. You can:

- use different design systems (Vaadin, Red Hat, SAPUI5, Redwood)
- swap renderers without changing application code
- embed Mateu UIs in other applications as web components
- compose UIs from multiple backend services

## Faster delivery for the right use cases

For internal tools, CRUDs, portals, and enterprise workflows, Mateu typically means:

- fewer files per feature
- no frontend/backend handoff
- no duplication to maintain
- faster iteration on changes

The constraint is the scope: Mateu is optimized for this class of applications. Outside of it, a traditional stack may be the better choice.

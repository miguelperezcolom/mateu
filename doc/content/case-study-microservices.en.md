---
title: "Case study: Mateu in a microservices system"
weight: 60
---

# Case study: Mateu in a microservices system

## The problem

In a typical microservices architecture, teams often end up with:

- a separate frontend application
- duplicated models between frontend and backend
- custom APIs for every screen
- complex synchronization between layers

This leads to slower development and higher maintenance costs.

---

## The approach

In this project, Mateu is used to define UI directly inside backend services.

Each service:

- owns its domain logic
- exposes its own UI routes
- defines its own screens using Mateu

Example:

```java
@UI("/_users")
@Title("Users")
public class UsersHome {

    @Menu
    UsersMenu users;
}
```

Each service defines its own menus and CRUD flows:

```java
public class UsersMenu {

    @Menu
    UsersCrud users;

    @Menu
    RolesCrud roles;

    @Menu
    PermissionsCrud permissions;
}
```

---

## Architecture

- backend services communicate via gRPC
- each service exposes UI through Mateu
- frontend acts as a renderer, not as an application layer
- UI is composed from multiple services

---

## What changed

Instead of:

- backend + frontend + API

You now have:

- backend + UI definition (in the same place)

---

## Benefits

### Less duplication

No need to redefine models in multiple layers.

### Clear ownership

Each service owns:

- data
- logic
- UI

### Simpler architecture

No need for:

- custom APIs per screen
- frontend state synchronization

### Better fit for microservices

UI aligns with service boundaries.

---

## When this works best

- internal tools
- CRUD-heavy systems
- enterprise apps
- distributed architectures

---

## Summary

Mateu allows you to keep UI definition close to the backend that owns the behavior.

This reduces complexity and makes microservice-based systems easier to build and evolve.

---

👉 Try the demo: https://vaadin.mateu.io/fluent/use-cases/rra

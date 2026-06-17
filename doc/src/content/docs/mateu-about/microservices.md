---
title: "Mateu in microservices"
---

Each service owns its own UI. This is the core principle for using Mateu in a microservices architecture.

## Service-owned UIs

In a microservices system, a common problem is UI ownership. Either:

- a separate frontend team builds one large SPA that depends on all services, or
- each service team builds its own frontend in isolation with no shared navigation

Mateu offers a third option: each service defines its own UI as an inbound adapter, and a shell composes those UIs through federation.

## How it works

Each service exposes a UI root:

```java
// orders-service
@UI("/orders-service")
public class OrdersServiceRoot {

    @Menu
    OrdersCrud orders;

    @Menu
    OrderLinesOrchestrator lines;
}
```

```java
// products-service
@UI("/products-service")
public class ProductsServiceRoot {

    @Menu
    ProductsCrud products;

    @Menu
    CategoriesOrchestrator categories;
}
```

Each service is fully autonomous — it deploys independently, manages its own data, and owns its own UI logic.

## The shell composes them

A shell application aggregates the service UIs through `RemoteMenu`:

```java
@UI("/admin")
@Title("Operations Console")
public class ShellRoot {

    @Menu
    RemoteMenu orders = new RemoteMenu("/_orders-service");

    @Menu
    RemoteMenu products = new RemoteMenu("/_products-service");
}
```

The shell does not know the internal structure of each service's menu tree. It delegates to the remote service's UI definition. The service controls what it exposes and how it is structured.

## Ownership model

| Concern | Owner |
|---|---|
| Domain logic | each service |
| UI definition | each service (its own ViewModels) |
| Data access | each service (its own repositories and query services) |
| Navigation composition | shell |
| Authentication | shell (or shared infrastructure) |
| Branding | shell |

## What this avoids

This model avoids the two common failure modes:

**The monolithic frontend** — a single SPA that must be updated every time any service changes its API. Changes to the orders service require a frontend deployment. Teams are coupled.

**Isolated frontends with no shared shell** — each service has its own UI application with no consistent navigation or branding. Users switch between disconnected applications.

## Independent deployment

Because each service owns its UI and exposes it through a remote menu endpoint, services can be deployed independently. The shell picks up changes at runtime — a new screen in the orders service is immediately visible in the shell without redeploying the shell.

## Related

- [UI federation](/mateu-about/ui-federation) — how federation works in detail
- [Shell and remote menus](/mateu-about/shell-and-remote-menus) — how to configure the shell
- [Mateu and system architecture](/mateu-about/system-architecture) — where Mateu fits in distributed backend designs

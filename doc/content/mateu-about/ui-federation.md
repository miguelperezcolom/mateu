---
title: "UI federation"
weight: 7
---

# UI federation

Mateu supports microfrontends — but without a traditional frontend application.

Instead of building and deploying a separate frontend per service, each backend service exposes its own UI root and menu tree. A shell application composes them into a single unified surface.

## How it works

Each service defines its navigation using `@Menu`:

```java
@Menu("Inventory")
@Route("inventory")
public class InventoryMenu {
    // menu items defined here
}
```

The shell composes remote menus using `RemoteMenu`:

```java
@Menu("Main")
public class AppShell {
    RemoteMenu inventory = new RemoteMenu("https://inventory-service/mateu");
    RemoteMenu orders = new RemoteMenu("https://orders-service/mateu");
    RemoteMenu customers = new RemoteMenu("https://customers-service/mateu");
}
```

The shell renders a single application with navigation drawn from all three services. Each service remains independently deployed and independently owned.

## What you get

- **Decentralized ownership**: each team owns its service and its UI
- **Centralized navigation**: users see one coherent application
- **No frontend integration layer**: no Webpack module federation, no shared component libraries to coordinate
- **Independent deployments**: services deploy independently, the shell picks up changes automatically

## What the shell can centralize

The shell can also own cross-cutting concerns:

- branding and visual consistency
- authentication and SSO
- shared widgets and components
- page metadata

This gives you the organizational benefits of microfrontends — team autonomy, independent deployments, clear ownership — without the frontend infrastructure complexity that usually comes with them.

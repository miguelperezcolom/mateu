---
title: "Route Annotations"
description: "@Route, @Routes and @HomeRoute were removed — how routes are declared now, and how to migrate."
---

:::caution[Removed]
`@Route`, `@Routes` and `@HomeRoute` were removed before the beta (see [Migrating from alpha](/reference/migrating-from-alpha/)). `@UI` is the
only routing annotation left: it declares a **mount** (an app at a base path). The screens inside a
mount are data, declared in a [`routes.yaml` route registry](/java-ui-definition/route-registry/)
(or supplied in code by a `RouteEntrySupplier` bean), and the home is the app's first menu item
unless the app class implements `HomeRouteSupplier`.
:::

## Migrating

| Removed annotation | Current equivalent |
|---|---|
| `@Route("/orders/list")` on a class | a `routes.yaml` entry `route: orders/list` + `viewModel: <the class FQCN>` |
| `@Route(value = "/orders/list", uis = {"/orders"})` | an entry in a route file tagged `basePath: /orders` (or, for a CRUD sub-route of the root mount, the full relative path, e.g. `users/:id/edit`) |
| `@Route(value = "/x", parentRoute = "/home")` | a `children:` entry under the `home` route — the child renders in its parent's slot |
| `@Route("/a")` + `@Route("/b")` (`@Routes`) | two entries with the same `viewModel` (optionally told apart by `fixedParams`) |
| `@HomeRoute("/orders/list")` | the app's first menu item, or `implements HomeRouteSupplier` returning `"/orders/list"` |

### Before / after

```java
// Before (no longer compiles)
@UI("/orders")
@HomeRoute("/orders/list")
public class OrdersApp { ... }

@Route("/orders/list")
public class OrderList { ... }
```

```java
// After
@UI("/orders")
public class OrdersApp implements HomeRouteSupplier {
  @Override public String homeRoute() { return "/orders/list"; }   // optional: the first menu item is the default
}

public class OrderList { ... }
```

```yaml
# src/main/resources/specs/ui/orders-routes.yaml
type: Routes
basePath: /orders
routes:
  - route: list
    viewModel: com.acme.OrderList
```

Routes in a route file are **relative to the mount** (`list` under `basePath: /orders` answers
`/orders/list`). A `specs/ui/routes.yaml` with no `basePath` serves the root mount.

### Several URLs over one class

```yaml
routes:
  - route: invoices
    viewModel: com.acme.InvoicePage
  - route: bills
    viewModel: com.acme.InvoicePage
```

### Nested routes

A route nests under another through `children` (each flattened child carries its parent as
`RouteEntry.parent`):

```yaml
routes:
  - route: orders/list
    viewModel: com.acme.OrderList
    children:
      - route: ":id"              # → orders/list/:id
        viewModel: com.acme.OrderDetail
```

At runtime the request resolves as a route chain: the outermost level not yet on screen renders
first and draws the child in its slot, so a reload or a deep link to the child lands inside its
parent. See [a record master whose tabs are pages](/java-ui-definition/route-registry/#recipe-a-record-master-whose-tabs-are-pages).

**Tip — nest detail routes under the listing route.** Declaring the detail as `orders/:id`
(instead of a sibling like `order/:id`) keeps the app shell's **navigation tab highlighted**
while the user drills into a record: the active tab is derived from the current route by longest
prefix match, so `/orders/42` keeps the *Orders* tab selected. The home route never wins by
prefix.

---

## @BaseRoute

`io.mateu.uidl.annotations.BaseRoute` still exists in `uidl`, but nothing in the runtime or the
annotation processors reads it — annotating a class with it has **no effect**. To give a set of
routes a base path, tag their route file with `basePath:` (see above).

---

See the [route registry](/java-ui-definition/route-registry/) for the full format.

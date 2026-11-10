---
title: "Routes"
description: "How the screens of a Mateu UI are declared: @UI for the mount, routes.yaml for the routes inside it."
---

`@UI` is the only routing annotation: it declares a **mount** (an app at a base path). The screens
inside a mount are data, declared in a [`routes.yaml` route registry](/concepts/routes-and-mounts/)
(or supplied in code by a `RouteEntrySupplier` bean), and the home is the app's first menu item
unless the app class implements `HomeRouteSupplier`.

## Declaring a mount and its routes

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
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

## Several URLs over one class

```yaml
routes:
  - route: invoices
    viewModel: com.acme.InvoicePage
  - route: bills
    viewModel: com.acme.InvoicePage
```

## Nested routes

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
parent. See [a record master whose tabs are pages](/concepts/routes-and-mounts/#recipe-a-record-master-whose-tabs-are-pages).

**Tip — nest detail routes under the listing route.** Declaring the detail as `orders/:id`
(instead of a sibling like `order/:id`) keeps the app shell's **navigation tab highlighted**
while the user drills into a record: the active tab is derived from the current route by longest
prefix match, so `/orders/42` keeps the *Orders* tab selected. The home route never wins by
prefix.

---

See the [route registry](/concepts/routes-and-mounts/) for the full format.

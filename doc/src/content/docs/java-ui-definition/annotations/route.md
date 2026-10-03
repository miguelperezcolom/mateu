---
title: "Route Annotations"
description: "Annotations for registering and linking UI classes to URL routes."
---

:::caution[Removed]
`@Route`, `@Routes` and `@HomeRoute` were removed from the code (commit `c50678e81`): inner routes
are now data, declared in a [`routes.yaml` route registry](/java-ui-definition/route-registry/),
and the home is the app's first menu item. `@UI` is the only routing annotation left, plus
`@BaseRoute`. The sections below describe the old annotations for reference while migrating.
:::

## @Route

`@Route` is repeatable (via `@Routes`). It registers a class as a reachable route within a `@UI` application. A class can handle multiple paths by stacking several `@Route` annotations.

```java
@Repeatable(Routes.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {
    String value();                   // route path
    String[] uis() default {};        // which @UI classes expose this route
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | URL path for this route, e.g. `"/orders/list"` |
| `uis` | `String[]` | `{}` | Limits which `@UI` endpoints expose this route. Empty means all. |

### Basic usage

```java
@Route("/orders/list")
public class OrderList { ... }
```

### Scoped to a specific UI

Use `uis` when multiple `@UI` entries exist and this route should only appear under one of them:

```java
@Route(value = "/orders/list", uis = {"/orders"})
public class OrderList { ... }
```

### Nested routes

There is no `parentRoute` attribute any more. A route nests under another through `children` in
`routes.yaml` (each flattened child carries its parent as `RouteEntry.parent`):

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

**Tip — nest detail routes under the listing route.** Declaring the detail as `/orders/:id`
(instead of a sibling like `/order/:id`) keeps the app shell's **navigation tab highlighted**
while the user drills into a record: the active tab is derived from the current route by longest
prefix match, so `/orders/42` keeps the *Orders* tab selected. The home route never wins by
prefix.

### Repeatable on the same class

```java
@Route("/invoices")
@Route("/bills")
public class InvoicePage { ... }
```

---

## @Routes

Container annotation generated automatically when multiple `@Route` annotations are placed on the same class. You rarely need to use it directly.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Routes {
    Route[] value();
}
```

---

## @BaseRoute

Sets a base path prefix for a configuration class. All routes relative to that class are resolved under this prefix.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface BaseRoute {
    String value();  // base path prefix
}
```

```java
@BaseRoute("/admin")
public class AdminRouteConfig { ... }
```

---

## @HomeRoute

Declares the default route that users land on when accessing the root of the UI. The frontend redirects to this path automatically on first load.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface HomeRoute {
    String value();  // path that serves as the home/default route
}
```

```java
@UI("/orders")
@HomeRoute("/orders/list")
public class OrdersApp { ... }
```

---

## Route hierarchy example

A typical order management module with a shell, a list and a detail page — the shell is a `@UI`,
and the inner routes are data:

```java
@UI("/orders")
public class OrdersShell { ... }   // the home is its first menu item
```

```yaml
# routes.yaml
type: Routes
basePath: /orders
routes:
  - route: list
    viewModel: com.acme.OrderList
  - route: list/:id
    viewModel: com.acme.OrderDetail
```

See the [route registry](/java-ui-definition/route-registry/) for the full format.

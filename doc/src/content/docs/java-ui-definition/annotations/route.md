---
title: "Route Annotations"
description: "Annotations for registering and linking UI classes to URL routes."
---

## @Route

`@Route` is repeatable (via `@Routes`). It registers a class as a reachable route within a `@UI` application. A class can handle multiple paths by stacking several `@Route` annotations.

```java
@Repeatable(Routes.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {
    String value();                   // route path
    String[] uis() default {};        // which @UI classes expose this route
    String parentRoute() default RouteConstants.NO_PARENT_ROUTE;
}
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | `String` | — | URL path for this route, e.g. `"/orders/list"` |
| `uis` | `String[]` | `{}` | Limits which `@UI` endpoints expose this route. Empty means all. |
| `parentRoute` | `String` | `"_empty"` (no parent) | Parent route path for nested navigation |

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

Setting `parentRoute` makes this route a child of another, enabling breadcrumb navigation and nested layouts:

```java
@Route(value = "/orders/{id}", parentRoute = "/orders/list")
public class OrderDetail { ... }
```

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

The following shows a typical order management module with a shell, a list, and a detail page:

```java
// Application shell — mounts the /orders UI and sets the default page
@UI("/orders")
@HomeRoute("/orders/list")
public class OrdersShell { ... }

// List page — registered under the /orders UI
@Route(value = "/orders/list", uis = {"/orders"})
public class OrderList { ... }

// Detail page — child of the list route; triggers breadcrumb navigation
@Route(value = "/orders/{id}", parentRoute = "/orders/list")
public class OrderDetail { ... }
```

When the user opens `/orders`, the framework redirects them to `/orders/list`. Navigating to `/orders/123` shows the detail page with a back link to the list.

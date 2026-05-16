---
title: "@Route / @HomeRoute / @BaseRoute"
weight: 2
---

# @Route

Maps a class to a URL route within a Mateu application.

```java
@Repeatable(Routes.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {
    String value();
    String[] uis() default {};
    String parentRoute() default RouteConstants.NO_PARENT_ROUTE;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | — | The URL path (e.g. `"/invoices"`) |
| `uis` | String[] | `{}` | Limits which `@UI` entries expose this route |
| `parentRoute` | String | `""` | Parent route for nested navigation |

## Basic usage

```java
@Route("/invoices")
public class InvoiceListPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Invoice list");
    }
}
```

## Nested routes

```java
@Route(value = "/invoices/detail", parentRoute = "/invoices")
public class InvoiceDetailPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Invoice detail");
    }
}
```

## Repeatable

`@Route` is repeatable, so a single class can handle multiple paths:

```java
@Route("/invoices")
@Route("/bills")
public class InvoicePage implements ComponentTreeSupplier { ... }
```

---

# @HomeRoute

Declares the default route that users are redirected to when accessing the root of the application.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface HomeRoute {
    String value();
}
```

## Usage

```java
@HomeRoute("/dashboard")
public class AppConfig { }
```

---

# @BaseRoute

Sets a base path prefix applied to all routes in a class or configuration.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface BaseRoute {
    String value();
}
```

## Usage

```java
@BaseRoute("/admin")
public class AdminRouteConfig { }
```

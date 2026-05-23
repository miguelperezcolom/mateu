---
title: "Navigation Annotations"
description: "Annotations for breadcrumbs and menu entries."
---

## @Breadcrumbs

```java
public @interface Breadcrumbs {
  Breadcrumb[] value();
}
```

Attaches a static breadcrumb trail to a page. Each entry is a `@Breadcrumb`.

## @Breadcrumb

```java
public @interface Breadcrumb {
  String label();
  String url();
}
```

A single breadcrumb entry with a display label and a URL.

Example:

```java
@Breadcrumbs({
    @Breadcrumb(label = "Home", url = "/"),
    @Breadcrumb(label = "Orders", url = "/orders"),
    @Breadcrumb(label = "Detail", url = "")
})
public class OrderDetail { ... }
```

## @Menu (Target: FIELD)

```java
public @interface Menu {
  boolean selected() default false;
  String description() default "";
}
```

Marks a field as a navigation menu entry in the application sidebar. `selected` highlights it as the active entry. `description` is a hint for AI assistants explaining the menu entry's purpose.

## @HomeRoute

```java
public @interface HomeRoute {
  String value();
}
```

Declares which route is the default landing page of the application. Cross-reference: also documented in route.md.

---
title: "UI vs Route"
---

`@UI` and `@Route` serve different purposes. `@UI` publishes an application at a base URL. `@Route` defines a screen inside that application.

---

## `@UI`

`@UI` marks the entry point of a Mateu application and binds it to a base URL.

```java
@UI("/")
public class AppHome {}
```

A class annotated with `@UI` is the root of a UI. Mateu registers it as a publicly accessible endpoint.

`@UI` takes a required base URL. Optional attributes control which HTML shell and frontend component file to serve:

```java
@UI(value = "/admin", indexHtmlPath = "/static/admin.html", frontendComponentPath = "/assets/mateu.js")
public class AdminApp {}
```

---

## `@Route`

`@Route` defines an internal route inside a UI. It does not publish a new application by itself.

```java
@Route("/products/:id")
public class ProductForm {
    String id;
}
```

A class annotated only with `@Route` belongs to a UI root published elsewhere. It is reachable through that UI's base URL.

---

## How they compose

The final URL of a routed screen is built from:

- the base URL declared by `@UI`
- the internal path declared by `@Route`

If `@UI` is at `/admin` and a `@Route` declares `/products/:id`, the full URL becomes `/admin/products/:id`.

---

## Example: route with a parent

```java
@Route(value = "/products/create", parentRoute = "/admin")
public class CreateProductPage extends ProductForm {}
```

This screen does not publish a new UI. It defines a route inside the existing `/admin` UI.

---

## Mental model

- `@UI` = application root (one per application or sub-application)
- `@Route` = screen inside that root

A class can have both annotations if it is simultaneously an application root and its own first screen. Typically they are separate.

---

## Next

- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
- [Execution model](/java-user-manual/concepts/execution-model/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)

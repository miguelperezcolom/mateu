---
title: "UI vs Route"
---

`@UI` and the route registry serve different purposes. `@UI` publishes an application (a **mount**) at a base URL. A `routes.yaml` entry defines a screen inside that application.

:::note
The `@Route`, `@Routes` and `@HomeRoute` annotations were removed. `@UI` is the only routing annotation; inner routes are data in a [`routes.yaml` route registry](/java-ui-definition/route-registry/).
:::

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

## Inner routes (`routes.yaml`)

A `routes.yaml` entry defines an internal route inside a UI. It does not publish a new application by itself.

```java
public class ProductForm {
    String id;
}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: products/:id
    viewModel: com.example.ProductForm
```

A class bound only by a route entry belongs to a UI root published elsewhere. It is reachable through that UI's base URL.

---

## How they compose

The final URL of a routed screen is built from:

- the base URL declared by `@UI` (or by the route file's `basePath`)
- the relative path of the `routes.yaml` entry

If `@UI` is at `/admin` and its route file declares `products/:id`, the full URL becomes `/admin/products/:id`.

---

## Example: a route inside an existing UI

A screen inside the `/admin` UI is an entry in a route file tagged with that UI's base path:

```yaml
type: Routes
basePath: /admin
routes:
  - route: products/create
    viewModel: com.acme.CreateProductPage
```

This screen does not publish a new UI. It defines a route inside the existing `/admin` UI. To nest
a route under another one, use `children` (each child gets `RouteEntry.parent`, and the parent
renders the child in its slot; see the [route registry](/java-ui-definition/route-registry/#nested-routes-a-sub-route-in-a-parents-slot)).

---

## Mental model

- `@UI` = application root (one per application or sub-application)
- `routes.yaml` entry = screen inside that root

The `@UI` class is the mount's root view (the entry whose route is `""`). When the app has a menu, its landing page is the first menu item, or whatever the app class returns from `HomeRouteSupplier.homeRoute()`.

Routes can also be supplied in code (a `RouteEntrySupplier` bean); `routes.yaml` wins over a supplied entry for the same route. See the [route registry](/java-ui-definition/route-registry/).

---

## Next

- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
- [Execution model](/java-user-manual/concepts/execution-model/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)

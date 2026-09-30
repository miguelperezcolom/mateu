---
title: "Navigation Annotations"
description: "The automatic breadcrumb trail, the annotations that change it, and menu entries."
---

## The automatic trail

Every page gets a breadcrumb trail without declaring one. The shell builds it from what it already
knows:

1. **The menu path** to the page's route — the group(s) and the entry the menu shows for it
   (`Call center › Reservas`), sections a federated pod contributed included. The entry whose route is
   the longest prefix of the current one wins; the home entry never matches by prefix.
2. **The CRUD level**, from what the route has past that entry: the record (named with the record page's
   own title, e.g. `QN29HB · Giulia Keller`), then `Editar` / `Nuevo` (`Edit` / `New` outside Spanish).

A page the menu does not know gets no trail (nothing is guessed), and neither does a page whose trail
would be a single crumb — its title says that already.

- **Vaadin** draws it above the page title; every crumb but the last navigates inside the app.
- **Redwood** has no breadcrumbs component (Spectra's page headers offer none): the trail becomes the
  header's own *go to parent* affordance, labelled with the parent crumb, whenever the page has no
  back button of its own.

An explicit `@Breadcrumbs` / `BreadcrumbsSupplier` replaces the automatic trail.

## @NoBreadcrumbs (Target: TYPE)

```java
public @interface NoBreadcrumbs {}
```

Turns the automatic trail off: on a page class for that page (a home, a welcome, a wizard), on the
`@UI` shell class for every page of the app.

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

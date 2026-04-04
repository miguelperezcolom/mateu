---
title: "Navigation and menus"
weight: 10
---

# Navigation and menus

Navigation in Mateu comes from your object model.

---

## Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

---

## Menu as navigation links

Menu entries are not limited to ViewModels.

You can also define menu items as direct navigation links:

```java
@Menu
String users = "/users";
```

This creates a menu item that navigates to a route.

### With parameters

```java
@Menu
String adminUser = "/users/admin?version=2772";
```

This allows:

- deep linking
- preconfigured views
- navigation shortcuts

### Mixing approaches

```java
@Route("")
public class Home {

    @Menu
    String users = "/users";

    @Menu
    GroupsCrud groups;

    @Menu
    String adminUser = "/users/admin?version=2772";

}
```

- `String` → navigation
- `ViewModel` → view + route

## Mental model

A menu entry can be:

- a ViewModel → generates UI
- a route (`String`) → navigates

---

## App variants

Mateu can infer the navigation UI automatically.

Use `@App` when you want to force a specific variant:

- hamburger menu
- menu on the left
- menu on the top
- tabs
- auto

```java
@App(AppVariant.MENU_ON_LEFT)
```

---

## Routing

Routes are resolved relative to the current UI and can be explicit (`@Route`) or implicit (`@Menu`).

👉 [Learn about routing and parameters →](/java-user-manual/routing-and-parameters)

---

## Breadcrumbs

👉 [Learn about breadcrumbs →](/java-user-manual/breadcrumbs)

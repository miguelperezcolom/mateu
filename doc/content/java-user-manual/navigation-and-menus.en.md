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

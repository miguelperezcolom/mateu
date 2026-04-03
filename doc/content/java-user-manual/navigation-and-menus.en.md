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

## Breadcrumbs

👉 [Learn about breadcrumbs →](/java-user-manual/breadcrumbs)

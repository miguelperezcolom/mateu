---
title: "Navigation model in Mateu"
weight: 9
---

# Navigation model in Mateu

Navigation in Mateu is not configured.

It **emerges from your object model**.

---

## Routes

```java
@Route("/users")
public class UsersPage {}
```

---

## Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

---

## Navigation presentation

Mateu not only infers navigation structure from `@Menu`.

It also infers how navigation should be rendered.

By default:

- flat menu structures may be rendered as tabs  
- nested menu structures may be rendered as menus  

---

## App variants

When you want explicit control, use `@App`.

```java
@Route("/app")
@App(AppVariant.HAMBURGUER_MENU)
public class Home {

    @Menu
    UsersCrud users;

    @Menu
    GroupsCrud groups;

}
```

```java
public enum AppVariant {
  HAMBURGUER_MENU,
  MENU_ON_LEFT,
  MENU_ON_TOP,
  TABS,
  AUTO
}
```

---

## Mental model

- `@Menu` → navigation tree  
- Mateu → infers navigation UI  
- `@App` → overrides the app variant  

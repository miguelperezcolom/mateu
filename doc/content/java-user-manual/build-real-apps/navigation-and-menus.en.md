---
title: "Navigation and menus"
weight: 2
aliases:
  - /java-user-manual/navigation-and-menus/
---

# Navigation and menus

Navigation in Mateu comes from your object model.

## Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

## Menu as navigation links

```java
@Menu
String users = "/users";
```

## App variants

```java
@App(AppVariant.MENU_ON_LEFT)
```

## Mental model

A menu entry can be:

- a ViewModel → generates UI
- a route (`String`) → navigates

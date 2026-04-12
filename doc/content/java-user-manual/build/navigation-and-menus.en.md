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

Menu entries are not limited to ViewModels.

You can also define menu items as direct navigation links:

```java
@Menu
String users = "/users";
```

## App variants

Navigation presentation can be customized with app-level annotations such as `@App`.

## Mental model

A menu entry can be:

- a ViewModel → generates UI
- a route (`String`) → navigates

Navigation is derived from the same model that defines the UI.

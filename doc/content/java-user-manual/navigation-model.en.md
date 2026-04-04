---
title: "Navigation model in Mateu"
weight: 9
---

# Navigation model in Mateu

Navigation in Mateu is not configured.

It **emerges from your object model**.

---

## Core idea

You don’t define:

- routes separately
- menus separately
- breadcrumbs separately

You define a model.

Mateu builds navigation from it.

---

## Routes

Routes live inside a UI context defined by `@UI`.

Explicit routes are declared with `@Route`.

Implicit routes can be inferred from `@Menu`.

👉 [Learn about routing and parameters →](/java-user-manual/routing-and-parameters)

---

## Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

Menu entries can also be direct navigation links:

```java
@Menu
String users = "/users";
```

This means a menu entry can either:

- point to a ViewModel
- or navigate directly to a route

---

## Microservices navigation

```java
@Menu
RemoteMenu users = new RemoteMenu("/_users");
```

Each service exposes its own UI.

A shell composes them.

---

## Breadcrumbs

Breadcrumbs can be:

- static → annotations
- dynamic → supplier

👉 [See breadcrumbs →](/java-user-manual/breadcrumbs)

---

## Mental model

Navigation is not something you configure.

It is something that **falls out of your application structure**.

Sometimes it is inferred from ViewModels.  
Sometimes it is declared as a direct route link.

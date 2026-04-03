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

## 1. Routes

```java
@Route("/users")
public class UsersPage {}
```

Routes are defined declaratively.

---

## 2. Menus

```java
@Menu
Users users;
```

Nested classes create nested menus.

---

## 3. Microservices navigation

```java
@Menu
RemoteMenu users = new RemoteMenu("/_users");
```

Each service exposes its own UI.

A shell composes them.

---

## 4. Breadcrumbs

Breadcrumbs can be:

- static → annotations
- dynamic → supplier

👉 [See breadcrumbs →](/java-user-manual/breadcrumbs)

---

## Mental model

Navigation is not something you configure.

It is something that **falls out of your application structure**.

---

## What this means

- no routing config files
- no menu config files
- no duplicated navigation logic

---

## Summary

- routes → `@Route`
- menus → `@Menu`
- composition → `RemoteMenu`
- breadcrumbs → annotations or supplier

All derived from your model.

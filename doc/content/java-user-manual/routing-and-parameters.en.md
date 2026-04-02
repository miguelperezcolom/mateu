---
title: "Routing and parameters"
weight: 6
---

# Routing and parameters

In Mateu, routes are defined directly in your backend code.

## Defining a route

```java
@UI("/users")
public class UsersPage {
}
```

This exposes the UI at `/users`.

## Parameters

You can define parameters directly in the route.

```java
@UI("/users/:id")
public class UserDetail {

  String id;

}
```

Mateu binds route parameters to your UI definition.

## What this means

- no separate routing layer to maintain
- no frontend router
- no manual parameter parsing

## Mental model

Routes are part of your UI definition — not a separate concern.

## Why this matters

Routing stays close to the code that owns the screen, which keeps the system simpler and reduces moving parts.

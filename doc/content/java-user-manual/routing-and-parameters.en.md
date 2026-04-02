---
title: "Routing and parameters"
weight: 6
---

# Routing and parameters

In Mateu, routing stays close to the backend code that owns the screen.

## UI roots

The simplest way to expose a route is through `@UI`.

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

## Additional route definitions

Mateu also supports explicit route definitions with `@Route`.

This is useful when you want route control separated from a UI root or when you want a route enabled only for specific UIs.

```java
@Route("/home")
public class Home {
}
```

And for specific UIs:

```java
@Route(value = "/home", uis = {"/ui1", "/ui2"})
public class Home {
}
```

## Route handlers and resolvers

For more advanced scenarios, Mateu also supports route-oriented abstractions such as:

- `RouteResolver`
- `RouteHandler`

These make it possible to resolve or handle routes programmatically when the default annotation-based model is not enough.

## What this means

- no separate frontend router
- no duplicated route config
- no manual parameter parsing
- routing stays close to the backend code

## Mental model

Routes are part of your UI definition — not a separate concern.

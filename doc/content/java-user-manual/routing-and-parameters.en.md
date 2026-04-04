---
title: "Routing and parameters"
weight: 11
---

# Routing and parameters

Mateu uses a **declarative, model-driven routing system**.

There is no separate router configuration.  
Routes are defined directly in your application code.

---

## UI context

A Mateu application starts with a class annotated with `@UI`.

```java
@UI("/admin")
public class AdminApp {}
```

This defines the **base route** of the application.

All routes are resolved relative to this base.

---

## Defining routes

You can define routes using `@Route`.

```java
@Route("/users")
public class UsersPage {}
```

If your UI is:

```java
@UI("/admin")
```

The final route will be:

```text
/admin/users
```

---

## Routes from menus

Routes do not always need to come from `@Route`.

Menu entries can also point directly to routes:

```java
@Menu
String users = "/users";
```

And they can include query parameters:

```java
@Menu
String adminUser = "/users/admin?version=2772";
```

This makes it easy to define shortcuts and deep links directly from the menu.

---

## Route parameters

Mateu supports path parameters:

```java
@Route("/users/:id")
public class UserDetail {

  String id;

}
```

Request:

```text
/users/123
```

Result:

```java
id = "123";
```

---

## Query parameters

Query parameters are also automatically bound:

```java
@Route("/users/:id")
public class UserDetail {

  String id;
  Integer version;

}
```

Request:

```text
/users/123?version=5
```

Result:

```java
id = "123";
version = 5;
```

---

## Binding rules

- Parameters are bound by **name**
- If a field exists, it is automatically populated
- If it does not exist, the parameter is ignored
- Path parameters take precedence over query parameters

---

## Implicit routes from menus

You don’t always need to define routes explicitly.

Fields annotated with `@Menu` can generate routes automatically:

```java
public class AdminHome {

  @Menu
  UsersCrud users;

}
```

This creates a route:

```text
/users
```

relative to the current UI.

---

## Explicit vs implicit routes

If both exist:

- explicit routes (`@Route`) win
- implicit routes (`@Menu`) are used by default

---

## Nested routes

Some views live inside other views (tabs, master-detail, shells, etc.).

Mateu supports this using `parentRoute`.

```java
@Route(
  value = "/orders/create",
  parentRoute = "/orders"
)
public class CreateOrderView {}
```

This route is only valid if:

- `/orders` has already been resolved
- the parent view has a slot for child content

---

## Parent route matching

`parentRoute`:

- can include parameters
- can be a pattern
- is matched against the resolved parent route

---

## Hydration hook

For advanced cases, you can access the full request.

```java
public class UserDetail implements Hydratable {

  String id;
  String userAgent;

  @Override
  public void hydrate(HttpRequest httpRequest) {
    userAgent = httpRequest.getHeaderValue("User-Agent");
  }
}
```

This method runs:

- after parameters are bound
- before the view is used

---

## Full lifecycle

When a request arrives:

1. Mateu resolves the UI (`@UI`)
2. Builds route candidates (explicit and implicit)
3. Filters by `parentRoute` if needed
4. Chooses the most specific route
5. Binds parameters to fields
6. Calls `hydrate()` if implemented
7. Renders the ViewModel

---

## Mental model

```text
URL → UI → Route → Fields → Hydrate → UI
```

---

## Summary

Mateu routing is:

- **declarative** → no router config
- **contextual** → relative to `@UI`
- **structure-driven** → menus create routes
- **explicit when needed** → `@Route`
- **nested when needed** → `parentRoute`
- **automatic** → parameter binding
- **extensible** → `Hydratable`

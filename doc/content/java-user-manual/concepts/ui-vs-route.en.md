---
title: "UI vs Route"
weight: 10
---

# `@UI` vs `@Route`

Mateu uses `@UI` and `@Route` for different levels of routing.

## `@UI`

`@UI` publishes a UI at a base URL.

Think of it as the application entry point.

```java
@UI("")
public class AppHome {}
```

## `@Route`

`@Route` defines internal routes inside that UI.

It does not publish a new UI by itself.

```java
@Route("/users/:id")
public class UserDetailPage {
    String id;
}
```

## Mental model

- `@UI` = application base URL
- `@Route` = internal route inside that application

A class annotated with `@Route` but not with `@UI` always belongs to a UI root published elsewhere.

## Example

```java
@Route(value="/use-cases/rra/orders/create", parentRoute="/use-cases/rra")
public class CreateOrderPage extends EditOrderPage {}
```

This class does not publish a new UI.

It defines a route inside an existing UI.

## Final URL

The final URL is built from:

- the base URL published by `@UI`
- the internal route defined by `@Route`

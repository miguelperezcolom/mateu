---
title: "Action behavior"
weight: 5
aliases:
  - /java-user-manual/actions/
---

# Action behavior

In Mateu, actions are not only about what happens in the backend.

They also define how the UI behaves when an action is executed.

This is controlled with `@Action`.

## What `@Action` defines

- validation
- confirmation dialogs
- execution mode
- UI behavior
- browser integration
- SSE support
- validation scope

## Returning values

Actions can also influence navigation.

If a method returns a `URI`, Mateu navigates to that route.

```java
@SneakyThrows
@Button
URI adminUser() {
  return new URI("/users/admin?version=2772");
}
```

## Routing and parameters

Mateu can also hydrate a ViewModel directly from the URL.

That includes:

- path parameters
- query parameters

👉 See [Routing and parameters →](/java-user-manual/concepts/routing-and-parameters/)

## Mental model

- methods define what an action does
- `@Button` / `@Toolbar` define where it appears
- `@Action` defines how it behaves
- returning `URI` can trigger navigation

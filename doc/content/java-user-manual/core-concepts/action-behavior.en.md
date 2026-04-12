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

## Returning values

If a method returns a `URI`, Mateu navigates to that route.

```java
@Button
URI adminUser() {
  return new URI("/users/admin?version=2772");
}
```

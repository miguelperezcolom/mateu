---
title: "Getting started"
weight: 1
---

# Getting started

> ⚠️ This is a minimal example.
>
> For a real application, start with the [Quickstart →](/java-user-manual/getting-started/quickstart)

Mateu lets you define UIs using plain Java.

## A minimal example

```java
@UI("")
public class Counter {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

This defines a working UI.

## Actions

Actions can be defined in multiple ways:

- as `Runnable` fields
- as methods annotated with `@Toolbar`
- as methods annotated with `@Button`

This gives you flexibility in how actions are rendered and positioned.

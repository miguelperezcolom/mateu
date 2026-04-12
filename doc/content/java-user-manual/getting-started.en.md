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

---
title: "Getting started"
weight: 3
---

# Getting started

This is the fastest way to understand how Mateu works in Java.

## The idea

You define your UI in Java.

Mateu renders it and connects user interactions back to your backend code.

## A first example

```java
@UI("")
public class Counter {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

## What this means

- `@UI("")` exposes the class as a UI
- `count` is part of the UI state
- `@ReadOnly` tells Mateu to show it as read-only data
- `increment` becomes a button
- when the button is triggered, the backend code runs and the UI updates

## Mental model

In Mateu Java, you usually define:

- state with fields
- actions with methods or callables
- UI behavior with annotations

## Next steps

- Declarative vs fluent
- Examples
- Supported components

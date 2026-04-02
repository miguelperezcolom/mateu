---
title: "The basics"
weight: 5
---

Mateu lets you define your UI in plain Java.

Instead of building and maintaining a separate frontend, you describe the UI using backend code and Mateu renders it automatically.

## The core idea

A Mateu UI is usually expressed with:

- Java classes
- fields for state
- methods or callables for actions
- annotations for UI behavior

For example:

```java
@UI("")
public class Counter {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

Mateu turns that definition into a working UI.

## What Mateu generates

From your Java definition, Mateu can render things like:

- forms
- tables
- layouts
- buttons and actions
- navigation structures

## Two ways to define UIs

Mateu supports two main styles:

### Declarative

You describe the UI directly with classes, fields, methods, and annotations.

This is the simplest and most direct approach.

### Imperative / fluent

You build the UI using fluent Java APIs and component records when you want more control.

## Why this matters

This approach reduces:

- duplicated models
- frontend/backend synchronization
- manual API glue
- accidental complexity

The result is a simpler way to build business applications.

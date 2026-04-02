---
title: "Java"
description: "Build Mateu UIs in Java with classes, fields, annotations, and actions."
weight: 2

type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

# Java

Mateu lets you define UIs in plain Java.

Instead of building a separate frontend, you describe the UI in backend code and Mateu renders it automatically.

## What you use

In Java, Mateu UIs are typically built with:

- classes
- fields for state
- methods or callables for actions
- annotations for UI behavior and presentation

## Two ways to build UIs

### Declarative

Use classes, fields, methods, and annotations.

This is the simplest way to start and the recommended approach for most screens.

### Fluent

Use Mateu's Java API when you want more control over the generated UI.

## What Mateu generates

From your Java definition, Mateu can render:

- forms
- tables
- layouts
- actions
- navigation

## Start here

- Getting started
- Declarative vs fluent
- State, actions and fields
- Field stereotypes
- Examples
- Supported components

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

Mateu turns that into a working UI.

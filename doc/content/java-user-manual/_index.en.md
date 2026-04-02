---
title: "Java"
description: "Build Mateu UIs in Java with classes, fields, annotations, actions and triggers."
weight: 2

type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

# Java

Mateu lets you define UIs in plain Java.

## Core concepts

- State, actions and fields  
- Field stereotypes  
- Foreign keys and options  
- Triggers and events  
- CRUD patterns  

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

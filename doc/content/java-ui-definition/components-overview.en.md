---
title: "Overview"
weight: 1
---

# Components overview

Mateu components are defined in Java and rendered automatically.

## What you typically use

- Text
- Forms
- Grids
- Layouts
- Buttons

## Example

```java
@UI("")
public class Example {

  String name;

  @Button
  Runnable save = () -> {};

}
```

Mateu turns this into a working UI.

## Key idea

Components are not created manually.

They are derived from your code structure.

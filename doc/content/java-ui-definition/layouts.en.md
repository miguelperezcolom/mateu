---
title: "Layouts"
weight: 2
---

# Layouts

Layouts define how components are arranged.

## Common layouts

- vertical
- horizontal
- split

## Example

```java
@SplitLayout
List panels = List.of(
    new Text("Left"),
    new Text("Right")
);
```

## When to use

Use layouts to structure your UI instead of manual HTML/CSS.

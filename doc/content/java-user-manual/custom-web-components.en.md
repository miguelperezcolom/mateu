---
title: "Custom web components"
weight: 32
---

# Custom web components

Mateu allows you to integrate any web component.

## Rendering a custom element

```java
Element.builder()
  .name("model-viewer")
  .attributes(Map.of(
    "src", src
  ))
  .build();
```

## Injecting scripts

```java
UICommandType.AddContentToHead
```

## What this enables

- use external libraries
- extend Mateu UI

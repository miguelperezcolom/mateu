---
title: "Container"
---

Wraps a component in a centred, width-constrained block — the standard page container used throughout Mateu UIs.

## Basic usage

```java
new Container(myContent)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | The component to wrap |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Example

```java
new Container(
    VerticalLayout.builder()
        .content(List.of(
            new Text("Top"),
            new Text("Bottom")
        ))
        .build()
)
```

## Tip

Use `Container` to give a page a centred, readable column layout. For edge-to-edge content (full browser width), use [FullWidth](../full-width/) instead.

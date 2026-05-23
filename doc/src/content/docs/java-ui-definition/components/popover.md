---
title: "Popover"
---

A floating panel that appears when the user clicks a wrapped component. Unlike a `Tooltip`, a `Popover` can contain rich content.

## Basic usage

```java
Popover.builder()
    .wrapped(new Text("Click me!"))
    .content(new Text("Popover content goes here."))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | Rich content shown in the floating panel |
| `wrapped` | `Component` | — | The element that triggers the popover on click |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Examples

```java
// Popover with structured content
Popover.builder()
    .wrapped(new Badge("?"))
    .content(VerticalLayout.builder()
        .spacing(true)
        .content(List.of(
            new Text("Why is this field required?", TextContainer.strong),
            new Text("This value is used to calculate VAT. Without it, the invoice cannot be generated.")
        ))
        .build())
    .build()

// Image in a popover
Popover.builder()
    .wrapped(new Text("Preview"))
    .content(new Image("https://example.com/preview.png"))
    .build()
```

## Tip

Use `Popover` when you need a click-triggered overlay with rich content (images, lists, formatted text). Use [Tooltip](../tooltip/) for simple hover hints.

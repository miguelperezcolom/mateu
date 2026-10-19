---
title: "Popover"
---

A floating panel that appears when the user clicks a wrapped component. Unlike a `Tooltip`, a `Popover` can contain rich content.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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
            new Text("Why is this field required?", List.of(TextVariant.b)),
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

Use `Popover` when you need a click-triggered overlay with rich content (images, lists, formatted text). Use [Tooltip](/java-ui-definition/components/tooltip/) for simple hover hints.

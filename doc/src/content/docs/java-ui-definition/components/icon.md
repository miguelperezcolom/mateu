---
title: "Icon"
---

Renders a vector icon from Mateu's built-in icon set (`IconKey`).

## Basic usage

```java
new Icon(IconKey.Form)
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `icon` | `IconKey` | — | The icon to render |
| `style` | String | `""` | Inline CSS — use to set size and colour |
| `cssClasses` | String | `""` | CSS class names |

## Examples

```java
new Icon(IconKey.Form)
new Icon(IconKey.Abacus)
new Icon(IconKey.Airplane)
new Icon(IconKey.Checkmark)
new Icon(IconKey.Cart)
new Icon(IconKey.Document)

// Sized via style
Icon.builder()
    .icon(IconKey.Person)
    .style("width: 32px; height: 32px; color: var(--lumo-primary-color);")
    .build()
```

## Icons in other components

```java
// Icon in a button
Button.builder()
    .label("Delete")
    .iconOnLeft(IconKey.Trash.iconName)
    .build()

// Icon in a tab
Tab.builder()
    .label("Orders")
    .iconOnLeft(IconKey.Cart.iconName)
    .content(ordersContent)
    .build()

// Icon alongside text
new HorizontalLayout(
    new Icon(IconKey.Checkmark),
    new Text("All checks passed")
)
```

## Tip

Use `IconKey.iconName` (a `String` property) when an API accepts an icon name string, and `new Icon(IconKey.xxx)` (a `Component`) when you need a renderable component.

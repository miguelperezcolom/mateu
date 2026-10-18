---
title: "Icon"
---

Renders a vector icon from Mateu's built-in icon set (`IconKey`).

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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
new Icon(IconKey.Check)
new Icon(IconKey.Cart)
new Icon(IconKey.FileText)

// Sized via style
Icon.builder()
    .icon(IconKey.User)
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

// Icon alongside text
new HorizontalLayout(
    new Icon(IconKey.Check),
    new Text("All checks passed")
)
```

## Tip

Use `IconKey.iconName` (a `String` property) when an API accepts an icon name string, and `new Icon(IconKey.xxx)` (a `Component`) when you need a renderable component.

---
title: "Tooltip"
---

Displays a text hint when the user hovers over a wrapped component.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
Tooltip.builder()
    .text("This field is required")
    .wrapped(new Text("Hover me!"))
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `text` | String | — | Tooltip text shown on hover |
| `wrapped` | `Component` | — | The component that triggers the tooltip |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Examples

```java
// Tooltip on a button
Tooltip.builder()
    .text("Downloads the report as a PDF")
    .wrapped(Button.builder().label("Export").actionId("export").build())
    .build()

// Tooltip on an icon
Tooltip.builder()
    .text("Read-only — contact your administrator to change this value")
    .wrapped(new Icon(IconKey.Lock))
    .build()

// Tooltip on any component
Tooltip.builder()
    .text("Total including VAT")
    .wrapped(new KPI("Total", "€ 1,234.00"))
    .build()
```

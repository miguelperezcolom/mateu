---
title: "KPI"
weight: 22
---

# KPI

A key performance indicator tile that displays a metric value alongside a label. Ideal for dashboards.

## Basic usage

```java
new KPI("Revenue", "€ 42,000")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `title` | String | — | Metric label (e.g. "Revenue", "Active users") |
| `text` | String | — | Metric value (e.g. "€ 42,000", "1,234") |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Dashboard row example

```java
HorizontalLayout.builder()
    .spacing(true)
    .content(List.of(
        new KPI("Revenue", "€ 42,000"),
        new KPI("Orders", "1,234"),
        new KPI("Customers", "567"),
        new KPI("Avg. order value", "€ 34.03")
    ))
    .build()
```

## Tip

Combine `KPI` tiles with a `BoardLayout` for a full dashboard layout:

```java
BoardLayout.builder()
    .rows(List.of(
        BoardLayoutRow.builder()
            .items(List.of(
                BoardLayoutItem.builder().content(new KPI("Revenue", "€ 42,000")).build(),
                BoardLayoutItem.builder().content(new KPI("Orders", "1,234")).build()
            ))
            .build()
    ))
    .build()
```

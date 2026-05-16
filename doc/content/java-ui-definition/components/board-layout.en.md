---
title: "BoardLayout"
weight: 7
---

# BoardLayout

A flexible board that arranges components into rows, each row containing any number of items with configurable widths. Useful for dashboards.

## Basic usage

```java
BoardLayout.builder()
    .rows(List.of(
        BoardLayoutRow.builder()
            .items(List.of(
                BoardLayoutItem.builder().content(kpi1).build(),
                BoardLayoutItem.builder().content(kpi2).build(),
                BoardLayoutItem.builder().content(kpi3).build()
            ))
            .build(),
        BoardLayoutRow.builder()
            .items(List.of(
                BoardLayoutItem.builder().content(chart).colspan(2).build(),
                BoardLayoutItem.builder().content(table).build()
            ))
            .build()
    ))
    .build()
```

## Properties

### BoardLayout

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `rows` | `List<BoardLayoutRow>` | — | Rows of the board |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

### BoardLayoutRow

| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `List<BoardLayoutItem>` | — | Items in this row |

### BoardLayoutItem

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | Component to place in this cell |
| `colspan` | int | 1 | Number of columns this item spans |

## Dashboard example

```java
BoardLayout.builder()
    .rows(List.of(
        // KPI row: three tiles side by side
        BoardLayoutRow.builder()
            .items(List.of(
                BoardLayoutItem.builder().content(new KPI("Revenue", "€ 42,000")).build(),
                BoardLayoutItem.builder().content(new KPI("Orders", "1,234")).build(),
                BoardLayoutItem.builder().content(new KPI("Customers", "567")).build()
            ))
            .build(),
        // Chart + list row
        BoardLayoutRow.builder()
            .items(List.of(
                BoardLayoutItem.builder().content(revenueChart).colspan(2).build(),
                BoardLayoutItem.builder().content(recentOrdersGrid).build()
            ))
            .build()
    ))
    .build()
```

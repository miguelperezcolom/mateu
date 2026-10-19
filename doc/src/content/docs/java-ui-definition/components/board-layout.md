---
title: "BoardLayout"
---

A flexible board that arranges components into rows, each row containing any number of items with configurable widths. Useful for dashboards.

## Basic usage

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
BoardLayout.builder()
    .rows(List.of(
        BoardLayoutRow.builder()
            .content(List.of(
                BoardLayoutItem.builder().content(kpi1).build(),
                BoardLayoutItem.builder().content(kpi2).build(),
                BoardLayoutItem.builder().content(kpi3).build()
            ))
            .build(),
        BoardLayoutRow.builder()
            .content(List.of(
                BoardLayoutItem.builder().content(chart).boardCols(2).build(),
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
| `content` | `List<Component>` | — | Items in this row — usually `BoardLayoutItem`s |

### BoardLayoutItem

| Property | Type | Default | Description |
|---|---|---|---|
| `content` | `Component` | — | Component to place in this cell |
| `boardCols` | int | 0 | Number of board columns this item spans (0 = the default single column) |

## Dashboard example

```java
BoardLayout.builder()
    .rows(List.of(
        // KPI row: three tiles side by side
        BoardLayoutRow.builder()
            .content(List.of(
                BoardLayoutItem.builder().content(new KPI("Revenue", "€ 42,000")).build(),
                BoardLayoutItem.builder().content(new KPI("Orders", "1,234")).build(),
                BoardLayoutItem.builder().content(new KPI("Customers", "567")).build()
            ))
            .build(),
        // Chart + list row
        BoardLayoutRow.builder()
            .content(List.of(
                BoardLayoutItem.builder().content(revenueChart).boardCols(2).build(),
                BoardLayoutItem.builder().content(recentOrdersGrid).build()
            ))
            .build()
    ))
    .build()
```

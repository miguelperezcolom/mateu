---
title: "Chart"
weight: 19
---

# Chart

Renders a Chart.js-powered chart. Supports line, bar, doughnut, pie, radar, polar area, bubble and scatter types.

## Basic usage

```java
Chart.builder()
    .chartType(ChartType.line)
    .chartData(ChartData.builder()
        .labels(List.of("Jan", "Feb", "Mar", "Apr"))
        .datasets(List.of(ChartDataset.builder()
            .label("Revenue")
            .data(List.of(1000d, 1500d, 1200d, 1800d))
            .build()))
        .build())
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `chartType` | `ChartType` | bar | Chart variety |
| `chartData` | `ChartData` | — | Labels and datasets |
| `chartOptions` | `ChartOptions` | — | Chart.js options object |
| `style` | String | `""` | Inline CSS — use to set `height` |
| `cssClasses` | String | `""` | CSS class names |

## Chart types (`ChartType`)

`line`, `bar`, `doughnut`, `pie`, `radar`, `polarArea`, `bubble`, `scatter`

## ChartData

| Property | Type | Description |
|---|---|---|
| `labels` | `List<String>` | Category labels on the axis |
| `datasets` | `List<ChartDataset>` | One dataset per series |

## ChartDataset

| Property | Type | Description |
|---|---|---|
| `label` | String | Series name (shown in the legend) |
| `data` | `List<Double>` | Data points |

## ChartOptions

| Property | Type | Description |
|---|---|---|
| `maintainAspectRatio` | boolean | Whether the chart maintains its aspect ratio |
| `scales` | `ChartScales` | Axis scale configuration |

## Line chart with axis configuration

```java
Chart.builder()
    .chartType(ChartType.line)
    .chartData(ChartData.builder()
        .labels(List.of("Mon", "Tue", "Wed", "Thu", "Fri"))
        .datasets(List.of(ChartDataset.builder()
            .label("Orders")
            .data(List.of(12d, 19d, 3d, 5d, 2d))
            .build()))
        .build())
    .chartOptions(ChartOptions.builder()
        .maintainAspectRatio(false)
        .scales(ChartScales.builder()
            .y(ChartAxisScale.builder().beginAtZero(true).build())
            .build())
        .build())
    .style("height: 300px;")
    .build()
```

## Doughnut chart

```java
Chart.builder()
    .chartType(ChartType.doughnut)
    .chartData(ChartData.builder()
        .labels(List.of("Scrap", "In progress", "Done"))
        .datasets(List.of(ChartDataset.builder()
            .label("Tasks")
            .data(List.of(5d, 12d, 30d))
            .build()))
        .build())
    .build()
```

## Multiple datasets (bar chart)

```java
Chart.builder()
    .chartType(ChartType.bar)
    .chartData(ChartData.builder()
        .labels(List.of("Q1", "Q2", "Q3", "Q4"))
        .datasets(List.of(
            ChartDataset.builder().label("2023").data(List.of(100d, 120d, 90d, 150d)).build(),
            ChartDataset.builder().label("2024").data(List.of(110d, 130d, 100d, 160d)).build()
        ))
        .build())
    .build()
```

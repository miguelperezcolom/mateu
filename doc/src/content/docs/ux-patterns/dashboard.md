---
title: Dashboard
description: Give users a prioritized, at-a-glance overview of their essential business status.
---

**Status:** ✅ Implemented

## Intent

Give users a landing page that summarises the status of their business at a glance: a band of KPIs on top and a grid of titled panels (charts, lists, notes) below, each one an entry point to more detail.

## Problem

Operational users open the app dozens of times a day just to answer "is everything OK?". Forcing them through listings and detail screens to reconstruct that answer wastes time; hand-building a dashboard with raw layouts means re-inventing metric tiles, grid placement and responsive behaviour on every project.

## Solution

Extend `Dashboard` and declare fields holding components. Mateu lays them out as a dashboard grid:

- Consecutive `MetricCard` fields are grouped into a **scoreboard** band (full-width strip of KPI tiles).
- Component fields annotated with `@Panel` become **titled tiles** on a responsive grid (`title` defaults to the field label; `colSpan`/`rowSpan` control the footprint).
- Any other component field is placed on the grid as-is.

```java
@UI("/dashboard")
@Title("Sales dashboard")
public class SalesDashboard extends Dashboard {

    MetricCard revenue = MetricCard.builder()
            .title("Revenue").value("1.2").unit("M€")
            .trend(MetricTrend.up).trendLabel("+8% vs last month")
            .icon("vaadin:dollar")
            .build();

    MetricCard orders = MetricCard.builder()
            .title("Orders").value("3,421")
            .trend(MetricTrend.up).trendLabel("+112")
            .build();

    @Panel(title = "Monthly sales", subtitle = "Units sold per month", colSpan = 2)
    Chart sales = Chart.builder()
            .chartType(ChartType.bar)
            .chartData(ChartData.builder()
                    .labels(List.of("Jan", "Feb", "Mar"))
                    .datasets(List.of(ChartDataset.builder()
                            .label("2026").data(List.of(120d, 190d, 300d)).build()))
                    .build())
            .build();

    @Panel(title = "Notes")
    Markdown notes = new Markdown("- Summer campaign starts **July 15th**", null, null);
}
```

![Sales dashboard](/images/docs/dashboard/sales-dashboard.png)

Populate the fields in the constructor or field initializers — query your use cases or repositories there, exactly like any other Mateu view-model. Override `columns()` to fix the number of grid columns; the default (`0`) lets the renderer pick a responsive auto-fit count.

### Drill-in

Give a `MetricCard` an `actionId` to make it clickable; the action is dispatched to the page like a button press, so you can navigate to the backing listing:

```java
MetricCard pending = MetricCard.builder()
        .title("Pending approvals").value("14")
        .actionId("openPending")
        .build();

@Action
Object openPending() {
    return URI.create("/approvals");
}
```

### Fluent variant

Everything is also available as fluent components for `ComponentTreeSupplier` pages: build a `DashboardLayout` with `Scoreboard`, `DashboardPanel` and `MetricCard` items directly when the layout is data-dependent.

```java
@Override
public Component component(HttpRequest request) {
    return DashboardLayout.builder()
            .items(List.of(
                    Scoreboard.builder().metrics(kpis()).build(),
                    DashboardPanel.builder().title("Monthly sales").colSpan(2)
                            .content(salesChart()).build()))
            .build();
}
```

## When to use it

Use a dashboard as the **home route** of operational backoffices: the scoreboard answers "is everything OK?" and the panels give one-click access to whatever is not. Prefer `AutoCrud` listings with `@KPI` headers when the overview is about a single collection rather than the whole business.

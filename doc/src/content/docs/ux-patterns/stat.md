---
title: Stat / KPI tile
description: A compact KPI — a big number, a trend delta and an inline sparkline.
---

**Status:** ✅ Implemented

## Intent

Show a single metric at a glance — revenue, active users, churn — as a big number with its recent trend (a delta and an inline sparkline), so the value *and its direction* read together. Row several up for a KPI band.

`Stat` complements `MetricCard`: where `MetricCard` shows a value + trend label, `Stat` adds the **sparkline** so you see the shape of the recent history.

## Solution

Use the `Stat` component: a `label`, a big `value` with optional `unit`, a `delta` with a `trend` of `"up"`, `"down"` or `"flat"` (which colors the delta green / red / grey and picks the sparkline color), and a `spark` list of numbers drawn as an inline sparkline. An `actionId` makes the whole tile clickable (drill-in).

```java
Stat.builder()
        .label("MRR").value("48.2").unit("k€")
        .delta("+7.4%").trend("up")
        .spark(List.of(30.0, 32.0, 31.0, 35.0, 40.0, 42.0, 48.0))
        .actionId("openMrr")
        .build();
```

Put several inside a `HorizontalLayout` for a KPI band:

```java
@Section("This month")
Component stats = HorizontalLayout.builder()
        .style("gap: 1rem; flex-wrap: wrap;")
        .content(List.of(mrr, activeUsers, churn, nps))
        .build();
```

![KPI stats](/images/docs/stat/kpi-stats.png)

The renderer is dependency-free (an inline SVG sparkline), themes through the standard CSS variables, and works in dark mode. On mobile (React Native) and in the IntelliJ plugin the sparkline is drawn natively.

## When to use it

Use `Stat` for **at-a-glance KPIs with a trend**. For a value without a sparkline, or for dashboard tiles wired into the `Dashboard` archetype's scoreboard, use `MetricCard`. Demo: `/stat-demo`.

---
title: Heatmap (calendar)
description: Show intensity over time — activity, usage, occupancy — GitHub-contributions style.
---

**Status:** ✅ Implemented

## Intent

Show *how much* happened *when* over a long stretch of days — commit activity, usage, occupancy, sales — as a calendar heatmap, so streaks, gaps and busy periods pop out at a glance.

## Solution

Use the `Heatmap` component: one `HeatCell` per day with a `date` and a `value`. The renderer lays the days out in week-columns (Monday-first) and colors each square by intensity from 0 to the maximum value. `label` overrides the cell tooltip.

```java
@Section("Commits this year")
Component heatmap = Heatmap.builder()
        .cells(List.of(
                HeatCell.builder().date(LocalDate.of(2026, 3, 1)).value(2).build(),
                HeatCell.builder().date(LocalDate.of(2026, 3, 2)).value(5).label("5 commits").build()
                /* … one per day … */))
        .build();
```

![Activity heatmap](/images/docs/heatmap/activity.png)

The renderer is dependency-free (a CSS grid of squares), colors by four intensity buckets of the primary color, themes through the standard CSS variables, works in dark mode, scrolls horizontally when wide and shows a Less→More legend. On mobile (React Native) and the IntelliJ plugin the same values render as a compact grid.

## When to use it

Use a `Heatmap` for **intensity across many days**. For a handful of dated events use a `Calendar`; for a trend line use a `TrendChart` or `Stat` sparkline. Demo: `/heatmap-demo`.

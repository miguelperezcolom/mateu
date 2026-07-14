---
title: Comparison card
description: Two values side by side with a delta chip — period over period, plan vs plan, before and after.
---

**Status:** ✅ Implemented

## Intent

Put two values next to each other and make the difference between them read at a glance — this month vs last, actual vs target, two plans, a before/after. The delta between them is the headline, colored by whether it went the right way.

## Solution

Use the `ComparisonCard` component: an optional `title`, a `leftLabel`/`leftValue` and `rightLabel`/`rightValue`, and a `delta` with a `trend` (`"up"` / `"down"` / `"flat"`). The delta renders as a chip between the two sides — green for `up`, red for `down`, grey for `flat` — with an ▲/▼ marker.

```java
@Section("Revenue")
Component revenue = ComparisonCard.builder()
        .title("Revenue")
        .leftLabel("Last month")
        .leftValue("€38k")
        .rightLabel("This month")
        .rightValue("€48k")
        .delta("+26%")
        .trend("up")
        .build();
```

![Revenue comparison](/images/docs/comparison-card/revenue.png)

The values are plain strings, so format them however you like (currency, percentages, counts). `trend` drives the color only — pick the direction that means "good/bad" for your metric (e.g. a falling churn rate is a `down` trend). The renderer is dependency-free, themes through the standard CSS variables and works in dark mode.

## When to use it

Use a `ComparisonCard` for **exactly two values whose difference is the point**. For a single KPI with a trend badge use `Stat` or `MetricCard`; for many metrics at once use a `Scoreboard` or `Dashboard`; for tiered plans use `PricingTable`. Demo: `/comparison-demo`.

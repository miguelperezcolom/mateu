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

### Tiles the viewer can rearrange

Override `reorderable()` to let each viewer drag the tiles into their own order, the way OPERA Cloud's dashboard works:

```java
@Override
protected boolean reorderable() {
    return true;
}
```

The viewer drops a tile on another to put it there. From the keyboard, focus a tile and press **Alt+←** or **Alt+→** to move it one place. The order belongs to the viewer: it is kept in the browser for that screen, keyed by each tile's id (the field name), and the declaration order stays the default. A tile you add later shows up after the ones the viewer has already placed. Nothing goes to the server, so a viewer who changes browser starts from the declared order.

The flag lives on the grid the archetype composes (`ResponsiveGrid.reorderable`; fluent: `grid.asReorderable()`), so any responsive grid of tiles can offer it. It works on the Vaadin and Redwood renderers. The native renderers keep the declared order.

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

## Redwood parameter and slot reference

What the Redwood `dashboard-landing-page` template (plus `dashboard-grid`, `dashboard-panel` and
`scoreboard`) exposes, and what Mateu gives you for it. The canonical page-header elements shared by
every template are documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** `kpi` | consecutive `MetricCard` fields, grouped into the scoreboard band | ✅ |
| `scoreboard.data` | the `MetricCard` fields themselves (or `Scoreboard` in the fluent variant) | ✅ |
| `scoreboard.selection` / `selectionMode: none \| single` | `MetricCard.actionId` makes a tile actionable, but a tile cannot hold selected state | 🟡 |
| `scoreboard.maxKpis` | — every declared metric renders | — |
| `dashboard-panel {panelTitle, panelSubtitle}` | `@Panel(title, subtitle)` / `DashboardPanel` | ✅ |
| `dashboard-grid` placement | `@Panel(colSpan, rowSpan)`; `columns()` fixes the column count (`0` = responsive auto-fit) | ✅ |
| `displayOptions.scoreboardSticky` | — the band scrolls with the page | — |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| `selectContext` / `selectObject` + `displayOptions.switcherSearch` | `RecordSwitcherSupplier` on a page with a header (the reflected form variant). The `Dashboard` archetype composes its own heading and has no page header, so it cannot carry one | 🟡 |
| `editLayoutMode` (drag tiles) | `reorderable()`: each viewer drags the tiles into their own order, kept in their browser | 🟡 |
| `contentLibraryData`, `editLayoutOptions {share, properties, contentLibraryFilters}` | ⚪ adding tiles from a content library and sharing layouts are a Fusion Apps concern, out of scope by decision | ⚪ |
| `spRestoreDefaults`, `spShare` | ⚪ part of the same edit-layout feature | ⚪ |

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| `Dashboard` archetype (scoreboard band + panels) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MetricCard.actionId` drill-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@AutoPage` inference (MetricCard fields → dashboard) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reorderable tiles | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |

The renderer columns of the first three rows need no dashboard code: the archetype is pure
composition on the one responsive grid. Tile reordering is client-side (the viewer's own order),
built on the web renderers (Vaadin, Redwood) only.

## When to use it

Use a dashboard as the **home route** of operational backoffices: the scoreboard answers "is everything OK?" and the panels give one-click access to whatever is not. Prefer `AutoCrud` listings with `@KPI` headers when the overview is about a single collection rather than the whole business.

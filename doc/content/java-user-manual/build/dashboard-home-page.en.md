---
title: "Dashboard home page"
weight: 2
---

# Dashboard home page

The dashboard is typically the first page users see. It shows KPIs, recent activity, and quick-access charts — all loaded from the backend on page open.

---

## Basic structure

A dashboard page implements `ComponentTreeSupplier` and `TriggersSupplier`. Use `OnLoadTrigger` to fetch data on load and `BoardLayout` to arrange the content in a grid.

```java
@Route(value = "/dashboard", parentRoute = "")
public class DashboardPage implements ComponentTreeSupplier, ActionHandler, TriggersSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Dashboard")
                .content(List.of(
                        new Text("${JSON.stringify(state)}")   // replaced by real content after load
                ))
                .build();
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(new OnLoadTrigger("load"));
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        int totalOrders   = orderRepository.count();
        int pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long revenue      = orderRepository.totalRevenueCents() / 100;

        return new State(Map.of(
                "totalOrders",   totalOrders,
                "pendingOrders", pendingOrders,
                "revenue",       revenue
        ));
    }
}
```

---

## KPI cards with BoardLayout

`BoardLayout` arranges components in a responsive grid. Use it to lay out metric cards side by side:

```java
@Override
public Component component(HttpRequest httpRequest) {
    return Form.builder()
            .title("Dashboard")
            .style("width: 100%;")
            .content(List.of(
                    BoardLayout.builder()
                            .rows(List.of(
                                    // Row 1: three equal KPI cards
                                    BoardLayoutRow.builder()
                                            .content(List.of(
                                                    kpiCard("Total orders",   "${state.totalOrders}",   BadgeColor.primary),
                                                    kpiCard("Pending",        "${state.pendingOrders}", BadgeColor.error),
                                                    kpiCard("Revenue (EUR)",  "${state.revenue}",       BadgeColor.success)
                                            ))
                                            .build(),
                                    // Row 2: chart takes 2 columns, recent activity takes 1
                                    BoardLayoutRow.builder()
                                            .content(List.of(
                                                    new BoardLayoutItem(salesChart(), 2),
                                                    new BoardLayoutItem(recentActivity(), 1)
                                            ))
                                            .build()
                            ))
                            .build()
            ))
            .build();
}
```

---

## KPI card helper

A card showing a metric and its label:

```java
private Component kpiCard(String label, String valueExpression, BadgeColor color) {
    return Card.builder()
            .title(new Text(label))
            .content(
                    Badge.builder()
                            .text(valueExpression)   // ${state.field} expression
                            .color(color)
                            .pill(true)
                            .build()
            )
            .build();
}
```

The `valueExpression` is a `${state.field}` string — the value is filled in by the browser after the `load` action returns the state.

---

## Chart

Add a sales chart alongside the KPIs:

```java
private Component salesChart() {
    return Card.builder()
            .title(new Text("Sales this week"))
            .content(
                    Chart.builder()
                            .chartType(ChartType.bar)
                            .chartData(ChartData.builder()
                                    .labels(List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))
                                    .datasets(List.of(
                                            ChartDataset.builder()
                                                    .label("Orders")
                                                    .data(List.of(12d, 19d, 8d, 15d, 22d, 30d, 17d))
                                                    .build()
                                    ))
                                    .build())
                            .chartOptions(ChartOptions.builder()
                                    .maintainAspectRatio(false)
                                    .scales(ChartScales.builder()
                                            .y(ChartAxisScale.builder().beginAtZero(true).build())
                                            .build())
                                    .build())
                            .build()
            )
            .build();
}
```

---

## Recent activity list

A compact listing of the latest records:

```java
private Component recentActivity() {
    var recent = orderRepository.findTop5ByOrderByCreatedAtDesc();
    return Card.builder()
            .title(new Text("Recent orders"))
            .content(
                    VerticalLayout.builder()
                            .spacing(true)
                            .content(recent.stream()
                                    .map(order -> HorizontalLayout.builder()
                                            .content(List.of(
                                                    new Text(order.customerName()),
                                                    Badge.builder()
                                                            .text(order.status().name())
                                                            .color(mapColor(order.status()))
                                                            .build()
                                            ))
                                            .justification(HorizontalLayoutJustification.between)
                                            .build())
                                    .collect(Collectors.toList()))
                            .build()
            )
            .build();
}
```

---

## Loading data dynamically

The `component()` method is called before the `load` action fires. Build the skeleton with `${state.*}` expressions; they resolve in the browser after the action returns:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    // Called by OnLoadTrigger("load") after the page renders
    return new State(Map.of(
            "totalOrders",   orderRepository.count(),
            "pendingOrders", orderRepository.countPending(),
            "revenue",       orderRepository.totalRevenue()
    ));
}
```

For charts and activity lists (server-side content), build the components directly in `component()` using live data, since those don't depend on `${state.*}` expressions.

---

## Embedding the dashboard in the app shell

Using `WidgetSupplier` on the `@UI` class, the dashboard appears as the home page without requiring navigation:

```java
@UI("")
@Title("My Backoffice")
public class MyApp implements WidgetSupplier {

    @Menu Products products;
    @Menu Orders orders;

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        int totalOrders   = orderRepository.count();
        int pendingOrders = orderRepository.countPending();

        return List.of(
                BoardLayout.builder()
                        .rows(List.of(
                                BoardLayoutRow.builder()
                                        .content(List.of(
                                                kpiCard("Total orders",  "" + totalOrders),
                                                kpiCard("Pending",       "" + pendingOrders)
                                        ))
                                        .build()
                        ))
                        .build()
        );
    }
}
```

`widgets()` receives the `HttpRequest`, so it can read the JWT token to personalize the dashboard per user or role.

---

## Card-based listing (alternative home page)

Use `Listing` with `ListingType.card` for a home page that shows records as cards with images and badges:

```java
@Override
public Component component(HttpRequest httpRequest) {
    return Page.builder()
            .title("Welcome")
            .subtitle("Review your open orders.")
            .content(List.of(
                    Listing.builder()
                            .listingType(ListingType.card)
                            .searchable(false)
                            .infiniteScrolling(true)
                            .onRowSelectionChangedActionId("go-to-order")
                            .build()
            ))
            .build();
}
```

Each row in `search()` returns a `CardRow` with a pre-built card component.

---

## Summary

| Pattern | When to use |
|---|---|
| `BoardLayout` + `OnLoadTrigger` | KPIs that update after the page loads |
| `Chart` inside `Card` | Visualizing trends or distributions |
| `WidgetSupplier` on `@UI` class | Dashboard as the shell home, without a route |
| `Listing` with `ListingType.card` | Entity-centric home page (orders, tasks, etc.) |
| `VerticalLayout` in `Card` | Recent activity / notification feed |

---

## Next

- [Application shell](/java-user-manual/build/application-shell/)
- [Layouts](/java-user-manual/concepts/fluent-components/fluent-layouts/)
- [Display components](/java-user-manual/concepts/fluent-components/fluent-display-components/)

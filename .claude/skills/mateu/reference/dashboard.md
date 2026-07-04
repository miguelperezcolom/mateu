# Dashboard landing page

Extend `Dashboard` (io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard) and
declare fields holding components. Layout rules:

- **Consecutive `MetricCard` fields** → grouped into a full-width `Scoreboard` KPI band.
- **Component fields with `@Panel(title, subtitle, colSpan, rowSpan)`** → titled tiles on a
  responsive grid (title defaults to the field label).
- **Other component fields** → placed on the grid as-is.
- Override `columns()` to fix the grid column count (default 0 = responsive auto-fit).

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
            .actionId("openOrders")        // drill-in: click runs the action below
            .build();

    @Panel(title = "Monthly sales", colSpan = 2)
    Chart sales = Chart.builder().chartType(ChartType.bar)
            .chartData(ChartData.builder()
                    .labels(List.of("Jan", "Feb"))
                    .datasets(List.of(ChartDataset.builder().label("2026")
                            .data(List.of(120d, 190d)).build()))
                    .build())
            .build();

    @Action
    Object openOrders() { return URI.create("/orders"); }
}
```

Populate fields in the constructor / initializers (call your use cases there). Fluent variant:
build a `DashboardLayout` (+ `Scoreboard`, `DashboardPanel`, `MetricCard`) from
`ComponentTreeSupplier.component(...)` when the layout is data-dependent.

`MetricCard` fields: `title`, `value`, `unit`, `trend` (up/down/neutral → green/red/grey),
`trendLabel`, `icon`, `description`, `actionId`.

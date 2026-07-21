package io.mateu.mdd.demoadminpanel.infra.in.ui.autopage;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import java.net.URI;
import java.util.List;

/**
 * Demo of page-level inference ({@code @AutoPage}): this is a PLAIN class — it does not extend the
 * {@code Dashboard} archetype — yet it renders as one, because the declared structure (metric cards
 * plus a paneled chart) is enough for Mateu to compose the template. Compare with {@code
 * SalesDashboard} (/dashboard-demo), which declares the same intent by subclassing.
 */
@UI("/auto-dashboard-demo")
@Title("Ops dashboard (inferred)")
@AutoPage
public class InferredOpsDashboard {

  MetricCard occupancy =
      MetricCard.builder()
          .title("Occupancy")
          .value("87")
          .unit("%")
          .trend(MetricTrend.up)
          .trendLabel("+4% vs last week")
          .icon("vaadin:building")
          .build();

  MetricCard checkIns =
      MetricCard.builder()
          .title("Check-ins today")
          .value("42")
          .trend(MetricTrend.neutral)
          .trendLabel("as planned")
          .icon("vaadin:user-check")
          .actionId("openSales")
          .build();

  MetricCard pendingIssues =
      MetricCard.builder()
          .title("Pending issues")
          .value("3")
          .trend(MetricTrend.down)
          .trendLabel("-2 since yesterday")
          .icon("vaadin:tools")
          .build();

  @Panel(title = "Arrivals this week", subtitle = "Guests per day", colSpan = 2)
  Chart arrivals =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Arrivals")
                              .data(List.of(31d, 28d, 35d, 42d, 58d, 64d, 40d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "How this page works")
  Markdown about =
      new Markdown(
          "This class does **not** extend `Dashboard` — it only declares metric cards and a "
              + "paneled chart, and `@AutoPage` infers the archetype.",
          null,
          null);

  @Action
  Object openSales() {
    return URI.create("/dashboard-demo");
  }
}

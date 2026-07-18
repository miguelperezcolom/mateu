package io.mateu.mdd.redwoodshowcase.ui.dashboard;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Action;
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
 * Demo of the declarative {@link Dashboard} archetype: consecutive {@link MetricCard} fields become
 * a scoreboard band, and {@code @Panel} component fields become titled tiles on a responsive grid.
 */
@UI("/dashboard-demo")
@Title("Sales dashboard")
public class SalesDashboard extends Dashboard {

  MetricCard revenue =
      MetricCard.builder()
          .title("Revenue")
          .value("1.2")
          .unit("M€")
          .trend(MetricTrend.up)
          .trendLabel("+8% vs last month")
          .icon("vaadin:dollar")
          .build();

  MetricCard orders =
      MetricCard.builder()
          .title("Orders")
          .value("3,421")
          .trend(MetricTrend.up)
          .trendLabel("+112")
          .icon("vaadin:cart")
          .actionId("openOrders")
          .build();

  MetricCard returns =
      MetricCard.builder()
          .title("Returns")
          .value("87")
          .trend(MetricTrend.down)
          .trendLabel("-12% vs last month")
          .icon("vaadin:refresh")
          .build();

  MetricCard nps =
      MetricCard.builder()
          .title("NPS")
          .value("62")
          .trend(MetricTrend.neutral)
          .trendLabel("stable")
          .description("Net promoter score, last 30 days")
          .build();

  @Panel(title = "Monthly sales", subtitle = "Units sold per month", colSpan = 2)
  Chart sales =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("2026")
                              .data(List.of(120d, 190d, 300d, 250d, 220d, 310d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Channel mix")
  Chart channels =
      Chart.builder()
          .chartType(ChartType.pie)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Web", "Stores", "Partners"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Share")
                              .data(List.of(55d, 30d, 15d))
                              .build()))
                  .build())
          .build();

  @Action
  Object openOrders() {
    return URI.create("/products");
  }

  @Panel(title = "Notes")
  Markdown notes =
      new Markdown(
          """
          - Summer campaign starts **July 15th**
          - Stores channel under review
          - Partner onboarding paused
          """,
          null,
          null);
}

package io.mateu.explorer.examples.archetypes.dashboard;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Text;
import java.util.List;

/**
 * The {@code Dashboard} archetype: declare data, get the page. Consecutive {@link MetricCard}
 * fields become the KPI band (a {@code Scoreboard}); {@code @Panel} component fields become titled
 * tiles on a responsive grid. A card's {@code actionId} makes it clickable — it runs the {@code
 * @Action} method of that name (a drill-in).
 */
@Title("Museum operations")
public class MuseumDashboard extends Dashboard {

  MetricCard visitors =
      MetricCard.builder()
          .title("Visitors")
          .value("48,210")
          .trend(MetricTrend.up)
          .trendLabel("+6% vs last month")
          .timeframe("This month")
          .icon("vaadin:users")
          .actionId("drillIntoVisitors")
          .build();

  MetricCard loans =
      MetricCard.builder()
          .title("Active loans")
          .value("37")
          .trend(MetricTrend.neutral)
          .timeframe("Today")
          .icon("vaadin:truck")
          .build();

  MetricCard conservation =
      MetricCard.builder()
          .title("Conservation backlog")
          .value("12")
          .trend(MetricTrend.down)
          .trendLabel("-4 this week")
          .timeframe("Open tasks")
          .icon("vaadin:tools")
          .build();

  @Panel(title = "Visitors per museum", subtitle = "Last 30 days", colSpan = 2)
  Chart perMuseum =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("The Met", "SMK", "Cleveland"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Visitors")
                              .data(List.of(26400d, 9800d, 12010d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Tickets by type")
  Chart tickets =
      Chart.builder()
          .chartType(ChartType.doughnut)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Adult", "Student", "Member", "Free"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Tickets")
                              .data(List.of(52d, 18d, 21d, 9d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Note")
  Text note = new Text("Click the Visitors card: its actionId runs drillIntoVisitors().");

  @Action
  Message drillIntoVisitors() {
    return Message.success("Drilling into visitors…");
  }
}

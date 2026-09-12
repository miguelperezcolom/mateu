package io.mateu.demo.starwars4;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;

import java.util.List;

/**
 * The {@code Dashboard} archetype: consecutive {@link MetricCard} fields become a scoreboard band,
 * and {@code @Panel} component fields become titled tiles on a responsive grid. Everything is
 * declared as data — no layout code.
 */
@UI("dashboard")
@Title("Galaxy dashboard")
public class GalaxyDashboard extends Dashboard {

  MetricCard characters =
      MetricCard.builder()
          .title("Characters")
          .value("82")
          .trend(MetricTrend.up)
          .trendLabel("+3 this era")
          .icon("vaadin:user")
          .build();

  MetricCard planets =
      MetricCard.builder()
          .title("Planets")
          .value("60")
          .icon("vaadin:globe")
          .build();

  MetricCard species =
      MetricCard.builder()
          .title("Species")
          .value("37")
          .icon("vaadin:tree")
          .build();

  MetricCard films =
      MetricCard.builder()
          .title("Films")
          .value("6")
          .trend(MetricTrend.neutral)
          .trendLabel("the saga")
          .icon("vaadin:film")
          .build();

  @Panel(title = "Records per collection", subtitle = "How much of the galaxy is catalogued", colSpan = 2)
  Chart counts =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("People", "Planets", "Species", "Vehicles", "Starships", "Films"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Count")
                              .data(List.of(82d, 60d, 37d, 39d, 36d, 6d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Films per era")
  Chart era =
      Chart.builder()
          .chartType(ChartType.pie)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Prequel", "Original", "Sequel"))
                  .datasets(
                      List.of(ChartDataset.builder().label("Films").data(List.of(3d, 3d, 3d)).build()))
                  .build())
          .build();
}

package io.mateu.explorer.examples.components.charts;

import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Funnel;
import io.mateu.uidl.data.FunnelStage;
import io.mateu.uidl.data.HeatCell;
import io.mateu.uidl.data.Heatmap;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.TrendChart;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** The same four visualisations in Java, built from data computed on the server. */
public class VisitorCharts implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                Chart.builder()
                    .chartType(ChartType.bar)
                    .style("height: 240px;")
                    .chartOptions(ChartOptions.builder().maintainAspectRatio(false).build())
                    .chartData(
                        ChartData.builder()
                            .labels(List.of("The Met", "SMK", "Cleveland", "Rijksmuseum"))
                            .datasets(
                                List.of(
                                    ChartDataset.builder()
                                        .label("Visitors (thousands)")
                                        .data(List.of(26.4, 9.8, 12.0, 21.7))
                                        .build()))
                            .build())
                    .build(),
                HorizontalLayout.builder()
                    .wrap(true)
                    .spacing(true)
                    .content(
                        List.of(
                            TrendChart.builder()
                                .title("Membership sign-ups")
                                .values(List.of(40d, 42d, 39d, 51d, 58d, 63d, 70d))
                                .labels(List.of("W1", "W2", "W3", "W4", "W5", "W6", "W7"))
                                .color("#7c3aed")
                                .area(true)
                                .style("width: 20rem;")
                                .build()))
                    .build(),
                Funnel.builder()
                    .stages(
                        List.of(
                            new FunnelStage("Newsletter sent", 30000, null),
                            new FunnelStage("Opened", 12500, null),
                            new FunnelStage("Clicked the exhibition", 3100, null),
                            new FunnelStage("Booked", 940, "#16a34a")))
                    .build(),
                Heatmap.builder().cells(lastFourWeeks()).build()))
        .build();
  }

  /** One cell per day: the value decides the shade; the label is the tooltip. */
  static List<HeatCell> lastFourWeeks() {
    var cells = new ArrayList<HeatCell>();
    var start = LocalDate.of(2026, 10, 1);
    for (int i = 0; i < 28; i++) {
      var value = (i * 7 % 10);
      cells.add(new HeatCell(start.plusDays(i), value, value + " guided tours"));
    }
    return cells;
  }
}

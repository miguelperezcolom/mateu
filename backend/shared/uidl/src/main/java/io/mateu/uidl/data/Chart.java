package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Chart(
    ChartType chartType,
    ChartData chartData,
    ChartOptions chartOptions,
    String style,
    String cssClasses)
    implements Component {

  public Chart() {
    this(ChartType.bar, ChartData.builder().build(), ChartOptions.builder().build(), "", "");
  }
}

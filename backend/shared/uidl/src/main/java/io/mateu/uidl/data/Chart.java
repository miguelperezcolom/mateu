package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A chart (bar, line, pie and others) drawn from labelled datasets. */
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

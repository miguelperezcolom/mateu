package io.mateu.mdd.demoadminpanel.infra.in.ui.trend;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.TrendChart;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link TrendChart} component: a monthly revenue line/area chart. */
@UI("/trend-demo")
@Title("Revenue trend")
public class RevenueTrend {

  @Section("Monthly revenue (k€)")
  Component trend =
      TrendChart.builder()
          .title("Revenue 2026")
          .values(List.of(32.0, 35.0, 33.0, 41.0, 44.0, 48.0, 52.0, 49.0, 58.0, 63.0, 61.0, 72.0))
          .labels(
              List.of(
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
                  "Dec"))
          .color("#1a73e8")
          .area(true)
          .build();
}

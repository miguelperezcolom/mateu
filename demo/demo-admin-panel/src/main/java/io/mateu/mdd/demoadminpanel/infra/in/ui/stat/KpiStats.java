package io.mateu.mdd.demoadminpanel.infra.in.ui.stat;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Stat} component: a row of KPI tiles with trend sparklines. */
@UI("/stat-demo")
@Title("KPIs")
public class KpiStats {

  @Section("This month")
  Component stats =
      HorizontalLayout.builder()
          .style("gap: 1rem; flex-wrap: wrap;")
          .content(
              List.of(
                  Stat.builder()
                      .label("MRR")
                      .value("48.2")
                      .unit("k€")
                      .delta("+7.4%")
                      .trend("up")
                      .spark(List.of(30.0, 32.0, 31.0, 35.0, 40.0, 42.0, 48.0))
                      .build(),
                  Stat.builder()
                      .label("Active users")
                      .value("2,914")
                      .delta("+312")
                      .trend("up")
                      .spark(List.of(2200.0, 2350.0, 2400.0, 2600.0, 2700.0, 2850.0, 2914.0))
                      .build(),
                  Stat.builder()
                      .label("Churn")
                      .value("3.1")
                      .unit("%")
                      .delta("+0.4pp")
                      .trend("down")
                      .spark(List.of(2.4, 2.5, 2.6, 2.6, 2.8, 3.0, 3.1))
                      .build(),
                  Stat.builder()
                      .label("NPS")
                      .value("62")
                      .delta("0")
                      .trend("flat")
                      .spark(List.of(60.0, 61.0, 62.0, 61.0, 62.0, 62.0, 62.0))
                      .build()))
          .build();
}

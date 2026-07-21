package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;

/**
 * Dashboard screen for the Explorer — consecutive {@link MetricCard} fields become a scoreboard
 * band, {@code @Panel} component fields become titled tiles on a responsive grid. Rendered by the
 * redwood-spectra renderer with the Oracle Spectra dashboard leaf components (scoreboard metric
 * cards + dashboard panels).
 */
@UI("/dashboard")
@Title("Sales dashboard")
public class DashboardDemo extends Dashboard {

  MetricCard revenue =
      MetricCard.builder()
          .title("Revenue")
          .value("1.2")
          .unit("M€")
          .trend(MetricTrend.up)
          .trendLabel("+8% vs last month")
          .build();

  MetricCard orders =
      MetricCard.builder()
          .title("Orders")
          .value("3,421")
          .trend(MetricTrend.up)
          .trendLabel("+112")
          .build();

  MetricCard returns =
      MetricCard.builder()
          .title("Returns")
          .value("87")
          .trend(MetricTrend.down)
          .trendLabel("-12% vs last month")
          .build();

  MetricCard nps =
      MetricCard.builder()
          .title("NPS")
          .value("62")
          .trend(MetricTrend.neutral)
          .trendLabel("stable")
          .build();

  @Panel(title = "Monthly sales", subtitle = "Units sold per month", colSpan = 2)
  Markdown sales =
      new Markdown(
          """
          | Month | Units |
          |---|---|
          | May | 1,240 |
          | Jun | 1,510 |
          | Jul | 1,980 |
          """,
          null,
          null);

  @Panel(title = "Channel mix", subtitle = "Sales by channel")
  Markdown channels =
      new Markdown(
          """
          - **Direct** — 46%
          - **Marketplace** — 31%
          - **Agencies** — 23%
          """,
          null,
          null);
}

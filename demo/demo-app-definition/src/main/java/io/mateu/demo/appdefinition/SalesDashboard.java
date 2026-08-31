package io.mateu.demo.appdefinition;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Text;

/**
 * A page TEMPLATE (the {@link Dashboard} archetype) bound to a route by DATA — there is no {@code
 * @UI}; {@code routes.yaml} maps {@code dashboard} to this class as its {@code viewModel}. It shows
 * that a template needs NO new {@code type:} value: an orchestrator archetype is a class view like
 * any other, so it is bound via {@code viewModel} and wrapped in the app shell (exactly like a CRUD
 * mediator). Composition-only templates (Welcome, HeroSection) are just component trees instead.
 */
@Title("Sales")
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
          .build();

  MetricCard returns =
      MetricCard.builder()
          .title("Returns")
          .value("87")
          .trend(MetricTrend.down)
          .trendLabel("-5%")
          .icon("vaadin:reply")
          .build();

  @Panel(title = "Notes")
  Text notes =
      Text.builder()
          .text("A Dashboard archetype bound to a route by DATA (no @UI), wrapped in the app shell.")
          .build();
}
